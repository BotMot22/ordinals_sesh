'use client';

import { useState } from 'react';
import { useInscription } from '@/hooks/useInscription';
import { useInscriptionListing } from '@/hooks/useListings';
import { useFeeRate } from '@/hooks/useFeeRate';
import { useDummyUtxo } from '@/hooks/useUtxos';
import { useCreateListing } from '@/hooks/useCreateListing';
import { useBuyInscription } from '@/hooks/useBuyInscription';
import { useCreateDummyUtxo } from '@/hooks/useDummyUtxo';
import { useWallet } from '@/hooks/useWallet';
import { InscriptionDetail } from '@/components/inscription/InscriptionDetail';
import { ListingForm } from '@/components/trading/ListingForm';
import { BuyForm } from '@/components/trading/BuyForm';
import { TransactionStatus } from '@/components/trading/TransactionStatus';
import { Skeleton } from '@/components/common/Skeleton';
import { estimateBuyTxFee } from '@/lib/bitcoin/fees';
import { isTaprootAddress } from '@/lib/bitcoin/address';

export default function InscriptionPage({ params }: { params: { id: string } }) {
  const { data: inscription, isLoading } = useInscription(params.id);
  const { data: listing } = useInscriptionListing(params.id);
  const { data: feeRates } = useFeeRate();
  const { dummyUtxo, hasDummy } = useDummyUtxo();
  const { wallet } = useWallet();
  const createListing = useCreateListing();
  const buyInscription = useBuyInscription();
  const createDummyUtxo = useCreateDummyUtxo();
  const [txid, setTxid] = useState<string | null>(null);

  const isOwner = wallet && inscription && wallet.address === inscription.address;
  const feeRate = feeRates?.halfHour || 10;
  const estimatedFee = estimateBuyTxFee(feeRate, wallet ? isTaprootAddress(wallet.address) : false);

  const handleCreateListing = async (priceSats: number) => {
    if (!inscription) return;
    await createListing.mutateAsync({
      inscriptionId: inscription.id,
      inscriptionOutput: inscription.output,
      inscriptionValue: inscription.outputValue,
      price: priceSats,
    });
  };

  const handleBuy = async () => {
    if (!listing || !dummyUtxo) return;
    const result = await buyInscription.mutateAsync({
      order: listing,
      dummyUtxo,
      feeRate,
    });
    setTxid(result);
  };

  const handleCreateDummy = async () => {
    const result = await createDummyUtxo.mutateAsync({ feeRate });
    setTxid(result);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!inscription) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Inscription Not Found</h1>
        <p className="text-gray-400">Could not load inscription {params.id}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <InscriptionDetail inscription={inscription} price={listing?.price} />

      {/* Transaction Status */}
      {txid && (
        <TransactionStatus txid={txid} />
      )}

      {/* Trading Section */}
      <div className="max-w-md ml-auto">
        {isOwner && !listing && (
          <ListingForm
            inscriptionId={inscription.id}
            onSubmit={handleCreateListing}
            isLoading={createListing.isPending}
          />
        )}

        {!isOwner && listing && listing.source === 'magiceden' && listing.marketplaceUrl && (
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-orange-500 text-white">ME</span>
              <span className="text-white font-medium">Listed on Magic Eden</span>
            </div>
            <p className="text-gray-400 text-sm">
              This inscription is listed for {(listing.price / 100_000_000).toFixed(8)} BTC on Magic Eden.
            </p>
            <a
              href={listing.marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block"
            >
              Buy on Magic Eden
            </a>
          </div>
        )}

        {!isOwner && listing && listing.source !== 'magiceden' && (
          <BuyForm
            order={listing}
            estimatedFee={estimatedFee}
            hasDummyUtxo={hasDummy}
            onBuy={handleBuy}
            onCreateDummy={handleCreateDummy}
            isLoading={buyInscription.isPending}
            isCreatingDummy={createDummyUtxo.isPending}
          />
        )}

        {!isOwner && !listing && (
          <div className="glass-card p-5 text-center">
            <p className="text-gray-400">This inscription is not currently listed for sale.</p>
          </div>
        )}

        {isOwner && listing && (
          <div className="glass-card p-5 text-center">
            <p className="text-brand-400 font-medium">Your listing is active</p>
            <p className="text-gray-400 text-sm mt-1">
              Listed for {(listing.price / 100_000_000).toFixed(8)} BTC
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
