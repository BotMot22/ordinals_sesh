'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { createListingPsbt } from '@/lib/bitcoin/psbt';
import { publishOrder } from '@/lib/nostr/orders';
import { fetchUtxos } from '@/lib/api/mempool';
import { getTxInfo } from '@/lib/bitcoin/utxo';
import { parseOutputLocation } from '@/lib/utils';

interface CreateListingParams {
  inscriptionId: string;
  inscriptionOutput: string;
  inscriptionValue: number;
  price: number;
}

export function useCreateListing() {
  const { wallet, signPsbt } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateListingParams) => {
      if (!wallet) throw new Error('Wallet not connected');

      const { txid, vout } = parseOutputLocation(params.inscriptionOutput);

      // Get the scriptPubKey from the UTXO
      const txInfo = await getTxInfo(txid);
      const output = txInfo.vout[vout];
      const scriptPubKey = output.scriptpubkey;

      // 1. Create the listing PSBT
      const psbtBase64 = await createListingPsbt({
        inscriptionUtxo: {
          txid,
          vout,
          value: params.inscriptionValue,
          scriptPubKey,
        },
        price: params.price,
        sellerAddress: wallet.address,
        sellerPublicKey: wallet.publicKey,
      });

      // 2. Sign with wallet (SIGHASH_SINGLE|ANYONECANPAY)
      const signedPsbtBase64 = await signPsbt(psbtBase64, {
        autoFinalized: true,
        toSignInputs: [
          {
            index: 0,
            address: wallet.address,
            sighashTypes: [0x83], // SIGHASH_SINGLE | ANYONECANPAY
          },
        ],
      });

      // 3. Publish to Nostr
      const eventId = await publishOrder({
        inscriptionId: params.inscriptionId,
        price: params.price,
        sellerAddress: wallet.address,
        signedPsbtBase64,
        utxo: {
          txid,
          vout,
          value: params.inscriptionValue,
        },
      });

      return { eventId, signedPsbtBase64 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
