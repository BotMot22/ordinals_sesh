'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { createDummyUtxoPsbt, finalizePsbt } from '@/lib/bitcoin/psbt';
import { broadcastTx, findPaymentUtxos } from '@/lib/bitcoin/utxo';
import { fetchUtxos } from '@/lib/api/mempool';

interface CreateDummyParams {
  feeRate: number;
}

export function useCreateDummyUtxo() {
  const { wallet, signPsbt } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateDummyParams) => {
      if (!wallet) throw new Error('Wallet not connected');

      const paymentAddress = wallet.paymentAddress || wallet.address;

      // Get UTXOs to fund the dummy creation
      const utxos = await fetchUtxos(paymentAddress);
      const paymentUtxos = findPaymentUtxos(utxos, 2000 + params.feeRate * 200);

      // Create PSBT
      const psbtBase64 = await createDummyUtxoPsbt({
        paymentUtxo: paymentUtxos[0],
        address: paymentAddress,
        publicKey: wallet.paymentPublicKey || wallet.publicKey,
        feeRate: params.feeRate,
      });

      // Sign
      const signedPsbtBase64 = await signPsbt(psbtBase64, {
        autoFinalized: true,
        toSignInputs: [{ index: 0, address: paymentAddress }],
      });

      // Finalize and broadcast
      const txHex = finalizePsbt(signedPsbtBase64);
      const txid = await broadcastTx(txHex);

      return txid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utxos'] });
    },
  });
}
