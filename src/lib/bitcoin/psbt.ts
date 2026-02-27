import * as bitcoin from 'bitcoinjs-lib';
import { initBitcoin } from './init';
import { getNetwork } from './network';
import { addressToOutputScript, isTaprootAddress } from './address';
import { getTxHex } from './utxo';
import { DUMMY_UTXO_VALUE, DUST_LIMIT } from '../constants';
import type { DummyUtxo, Utxo } from '@/types/transaction';

// SIGHASH_SINGLE | SIGHASH_ANYONECANPAY = 0x83
const SIGHASH_SINGLE_ANYONECANPAY = 0x83;

export interface ListingPsbtParams {
  inscriptionUtxo: {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
  };
  price: number; // in sats
  sellerAddress: string;
  sellerPublicKey: string;
}

export interface BuyPsbtParams {
  sellerSignedPsbtBase64: string;
  buyerAddress: string;
  buyerPublicKey: string;
  buyerPaymentUtxos: Utxo[];
  buyerDummyUtxo: DummyUtxo;
  feeRate: number;
  inscriptionValue: number;
  price: number;
}

export interface DummyUtxoPsbtParams {
  paymentUtxo: Utxo;
  address: string;
  publicKey: string;
  feeRate: number;
}

/**
 * Create a listing PSBT for the seller.
 *
 * The seller signs input[0] (the inscription UTXO) with SIGHASH_SINGLE|ANYONECANPAY,
 * which locks in output[0] (the payment to the seller) but allows the buyer to
 * add additional inputs and outputs.
 */
export async function createListingPsbt(params: ListingPsbtParams): Promise<string> {
  await initBitcoin();
  const network = getNetwork();
  const { inscriptionUtxo, price, sellerAddress } = params;

  const psbt = new bitcoin.Psbt({ network });

  // Fetch raw tx for non-witness UTXO (needed for some address types)
  const txHex = await getTxHex(inscriptionUtxo.txid);

  const inputData: any = {
    hash: inscriptionUtxo.txid,
    index: inscriptionUtxo.vout,
    sighashType: SIGHASH_SINGLE_ANYONECANPAY,
    nonWitnessUtxo: Buffer.from(txHex, 'hex'),
  };

  // For segwit/taproot, also add witnessUtxo
  if (inscriptionUtxo.scriptPubKey) {
    inputData.witnessUtxo = {
      script: Buffer.from(inscriptionUtxo.scriptPubKey, 'hex'),
      value: inscriptionUtxo.value,
    };
  }

  // For taproot, add internal key
  if (isTaprootAddress(sellerAddress) && params.sellerPublicKey) {
    const pubkeyBuf = Buffer.from(params.sellerPublicKey, 'hex');
    // Taproot uses x-only pubkey (32 bytes)
    inputData.tapInternalKey = pubkeyBuf.length === 33 ? pubkeyBuf.slice(1) : pubkeyBuf;
  }

  psbt.addInput(inputData);

  // Output[0]: Payment to seller (locked by SIGHASH_SINGLE)
  psbt.addOutput({
    address: sellerAddress,
    value: price,
  });

  return psbt.toBase64();
}

/**
 * Create the buy PSBT that completes the seller's partial PSBT.
 *
 * Transaction structure:
 *   Input[0]: Buyer's dummy UTXO (ensures inscription goes to output[0] via ordinal theory)
 *   Input[1]: Seller's signed inscription UTXO
 *   Input[2+]: Buyer's payment UTXOs
 *
 *   Output[0]: Inscription to buyer (receives inscription via first-in-first-out)
 *   Output[1]: Payment to seller (matches seller's signed output)
 *   Output[2]: New dummy UTXO for future purchases
 *   Output[3]: Change back to buyer
 */
export async function createBuyPsbt(params: BuyPsbtParams): Promise<string> {
  await initBitcoin();
  const network = getNetwork();
  const {
    sellerSignedPsbtBase64,
    buyerAddress,
    buyerPublicKey,
    buyerPaymentUtxos,
    buyerDummyUtxo,
    feeRate,
    inscriptionValue,
    price,
  } = params;

  // Decode the seller's signed PSBT
  const sellerPsbt = bitcoin.Psbt.fromBase64(sellerSignedPsbtBase64, { network });

  const psbt = new bitcoin.Psbt({ network });

  // --- INPUTS ---

  // Input[0]: Dummy UTXO (from buyer)
  const dummyTxHex = await getTxHex(buyerDummyUtxo.txid);
  const dummyInputData: any = {
    hash: buyerDummyUtxo.txid,
    index: buyerDummyUtxo.vout,
    nonWitnessUtxo: Buffer.from(dummyTxHex, 'hex'),
  };

  if (isTaprootAddress(buyerAddress) && buyerPublicKey) {
    const pubkeyBuf = Buffer.from(buyerPublicKey, 'hex');
    dummyInputData.tapInternalKey = pubkeyBuf.length === 33 ? pubkeyBuf.slice(1) : pubkeyBuf;
  }

  psbt.addInput(dummyInputData);

  // Input[1]: Seller's inscription UTXO (copy from seller's PSBT with their signature)
  const sellerInput = sellerPsbt.data.inputs[0];
  const sellerTxInput = sellerPsbt.txInputs[0];

  const inscriptionInputData: any = {
    hash: sellerTxInput.hash,
    index: sellerTxInput.index,
    sighashType: SIGHASH_SINGLE_ANYONECANPAY,
  };

  if (sellerInput.nonWitnessUtxo) {
    inscriptionInputData.nonWitnessUtxo = sellerInput.nonWitnessUtxo;
  }
  if (sellerInput.witnessUtxo) {
    inscriptionInputData.witnessUtxo = sellerInput.witnessUtxo;
  }
  if (sellerInput.tapInternalKey) {
    inscriptionInputData.tapInternalKey = sellerInput.tapInternalKey;
  }
  if (sellerInput.finalScriptSig) {
    inscriptionInputData.finalScriptSig = sellerInput.finalScriptSig;
  }
  if (sellerInput.finalScriptWitness) {
    inscriptionInputData.finalScriptWitness = sellerInput.finalScriptWitness;
  }
  // Copy partial signatures
  if (sellerInput.partialSig) {
    inscriptionInputData.partialSig = sellerInput.partialSig;
  }
  if (sellerInput.tapKeySig) {
    inscriptionInputData.tapKeySig = sellerInput.tapKeySig;
  }

  psbt.addInput(inscriptionInputData);

  // Input[2+]: Buyer's payment UTXOs
  for (const utxo of buyerPaymentUtxos) {
    const paymentTxHex = await getTxHex(utxo.txid);
    const paymentInputData: any = {
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(paymentTxHex, 'hex'),
    };

    if (isTaprootAddress(buyerAddress) && buyerPublicKey) {
      const pubkeyBuf = Buffer.from(buyerPublicKey, 'hex');
      paymentInputData.tapInternalKey = pubkeyBuf.length === 33 ? pubkeyBuf.slice(1) : pubkeyBuf;
    }

    psbt.addInput(paymentInputData);
  }

  // --- OUTPUTS ---

  const totalPaymentInput = buyerPaymentUtxos.reduce((sum, u) => sum + u.value, 0);

  // Estimate fee
  const inputCount = 2 + buyerPaymentUtxos.length; // dummy + inscription + payments
  const outputCount = 4; // inscription + payment + dummy + change
  const estimatedVsize = isTaprootAddress(buyerAddress)
    ? Math.ceil(10.5 + inputCount * 58 + outputCount * 43)
    : Math.ceil(10.5 + inputCount * 68 + outputCount * 31);
  const fee = Math.ceil(estimatedVsize * feeRate);

  // Output[0]: Inscription to buyer
  psbt.addOutput({
    address: buyerAddress,
    value: inscriptionValue,
  });

  // Output[1]: Payment to seller (must match seller's signed output exactly)
  const sellerOutput = sellerPsbt.txOutputs[0];
  psbt.addOutput({
    address: bitcoin.address.fromOutputScript(sellerOutput.script, network),
    value: sellerOutput.value,
  });

  // Output[2]: New dummy UTXO for future purchases
  psbt.addOutput({
    address: buyerAddress,
    value: DUMMY_UTXO_VALUE,
  });

  // Output[3]: Change back to buyer
  const totalIn = buyerDummyUtxo.value + totalPaymentInput;
  const totalOut = inscriptionValue + price + DUMMY_UTXO_VALUE;
  const change = totalIn - totalOut - fee;

  if (change < 0) {
    throw new Error(
      `Insufficient funds. Need ${totalOut + fee} sats but only have ${totalIn} sats.`
    );
  }

  if (change >= DUST_LIMIT) {
    psbt.addOutput({
      address: buyerAddress,
      value: change,
    });
  }

  return psbt.toBase64();
}

/**
 * Create a PSBT to generate a dummy UTXO for the buyer.
 * This is needed when the buyer doesn't have a small UTXO to use as input[0].
 */
export async function createDummyUtxoPsbt(params: DummyUtxoPsbtParams): Promise<string> {
  await initBitcoin();
  const network = getNetwork();
  const { paymentUtxo, address, publicKey, feeRate } = params;

  const psbt = new bitcoin.Psbt({ network });

  const txHex = await getTxHex(paymentUtxo.txid);
  const inputData: any = {
    hash: paymentUtxo.txid,
    index: paymentUtxo.vout,
    nonWitnessUtxo: Buffer.from(txHex, 'hex'),
  };

  if (isTaprootAddress(address) && publicKey) {
    const pubkeyBuf = Buffer.from(publicKey, 'hex');
    inputData.tapInternalKey = pubkeyBuf.length === 33 ? pubkeyBuf.slice(1) : pubkeyBuf;
  }

  psbt.addInput(inputData);

  // Estimate fee for 1-in, 2-out tx
  const estimatedVsize = isTaprootAddress(address) ? 111 : 141;
  const fee = Math.ceil(estimatedVsize * feeRate);

  // Output[0]: Dummy UTXO
  psbt.addOutput({
    address,
    value: DUMMY_UTXO_VALUE,
  });

  // Output[1]: Change
  const change = paymentUtxo.value - DUMMY_UTXO_VALUE - fee;
  if (change < DUST_LIMIT) {
    throw new Error('Payment UTXO too small to create dummy UTXO with current fee rate');
  }

  psbt.addOutput({
    address,
    value: change,
  });

  return psbt.toBase64();
}

/**
 * Validate a seller's signed PSBT and extract the listing price.
 */
export function validateSellerPsbt(
  psbtBase64: string,
  expectedInscriptionId?: string
): { valid: boolean; price: number; sellerAddress: string; error?: string } {
  try {
    const network = getNetwork();
    const psbt = bitcoin.Psbt.fromBase64(psbtBase64, { network });

    // Must have exactly 1 input and 1 output
    if (psbt.txInputs.length !== 1) {
      return { valid: false, price: 0, sellerAddress: '', error: 'PSBT must have exactly 1 input' };
    }
    if (psbt.txOutputs.length !== 1) {
      return { valid: false, price: 0, sellerAddress: '', error: 'PSBT must have exactly 1 output' };
    }

    // Check sighash type
    const input = psbt.data.inputs[0];
    if (input.sighashType !== SIGHASH_SINGLE_ANYONECANPAY) {
      return {
        valid: false,
        price: 0,
        sellerAddress: '',
        error: 'Input must use SIGHASH_SINGLE|ANYONECANPAY',
      };
    }

    // Verify the input is signed
    const isSigned =
      (input.partialSig && input.partialSig.length > 0) ||
      input.finalScriptSig ||
      input.finalScriptWitness ||
      input.tapKeySig;

    if (!isSigned) {
      return { valid: false, price: 0, sellerAddress: '', error: 'Input is not signed' };
    }

    // Extract price and seller address from the output
    const output = psbt.txOutputs[0];
    const price = output.value;
    const sellerAddress = bitcoin.address.fromOutputScript(output.script, network);

    if (price < DUST_LIMIT) {
      return { valid: false, price: 0, sellerAddress: '', error: 'Price below dust limit' };
    }

    return { valid: true, price, sellerAddress };
  } catch (e: any) {
    return { valid: false, price: 0, sellerAddress: '', error: e.message };
  }
}

/**
 * Convert PSBT between hex and base64 formats.
 */
export function psbtHexToBase64(hex: string): string {
  return Buffer.from(hex, 'hex').toString('base64');
}

export function psbtBase64ToHex(base64: string): string {
  return Buffer.from(base64, 'base64').toString('hex');
}

/**
 * Finalize and extract transaction hex from a signed PSBT.
 */
export function finalizePsbt(psbtBase64: string): string {
  const network = getNetwork();
  const psbt = bitcoin.Psbt.fromBase64(psbtBase64, { network });
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().toHex();
}
