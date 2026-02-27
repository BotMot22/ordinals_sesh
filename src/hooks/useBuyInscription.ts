'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { createBuyPsbt, finalizePsbt } from '@/lib/bitcoin/psbt';
import { broadcastTx, findPaymentUtxos } from '@/lib/bitcoin/utxo';
import { fetchUtxos } from '@/lib/api/mempool';
import type { Order } from '@/types/order';
import type { DummyUtxo } from '@/types/transaction';

interface BuyInscriptionParams {
  order: Order;
  dummyUtxo: DummyUtxo;
  feeRate: number;
}

export function useBuyInscription() {
  const { wallet, signPsbt } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BuyInscriptionParams) => {
      if (!wallet) throw new Error('Wallet not connected');

      const paymentAddress = wallet.paymentAddress || wallet.address;

      // 1. Get buyer's UTXOs for payment
      const utxos = await fetchUtxos(paymentAddress);

      // Calculate total needed: price + fee estimate + new dummy
      const estimatedFee = Math.ceil(300 * params.feeRate); // ~300 vbytes estimate
      const totalNeeded = params.order.price + estimatedFee + 1000;

      // Find payment UTXOs (exclude the dummy UTXO)
      const availableUtxos = utxos.filter(
        (u) => !(u.txid === params.dummyUtxo.txid && u.vout === params.dummyUtxo.vout)
      );
      const paymentUtxos = findPaymentUtxos(availableUtxos, totalNeeded);

      // 2. Create buy PSBT
      const psbtBase64 = await createBuyPsbt({
        sellerSignedPsbtBase64: params.order.signedPsbtBase64,
        buyerAddress: wallet.address,
        buyerPublicKey: wallet.publicKey,
        buyerPaymentUtxos: paymentUtxos,
        buyerDummyUtxo: params.dummyUtxo,
        feeRate: params.feeRate,
        inscriptionValue: params.order.utxo.value || 546,
        price: params.order.price,
      });

      // 3. Sign buyer inputs (input[0] = dummy, input[2+] = payment; skip input[1] = seller's)
      const inputsToSign = [
        { index: 0, address: paymentAddress }, // dummy UTXO
        ...paymentUtxos.map((_, i) => ({ index: i + 2, address: paymentAddress })),
      ];

      const signedPsbtBase64 = await signPsbt(psbtBase64, {
        autoFinalized: false,
        toSignInputs: inputsToSign,
      });

      // 4. Finalize and broadcast
      const txHex = finalizePsbt(signedPsbtBase64);
      const txid = await broadcastTx(txHex);

      return txid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utxos'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
