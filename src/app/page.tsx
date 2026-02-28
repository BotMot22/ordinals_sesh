'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Code2 } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { InscriptionGrid } from '@/components/inscription/InscriptionGrid';
import { SearchBar } from '@/components/common/SearchBar';
import { FEATURED_COLLECTIONS } from '@/lib/constants';
import { CollectionCard } from '@/components/collection/CollectionCard';

export default function Home() {
  const { data: listings, isLoading } = useListings({ sortBy: 'recent' });

  const recentListings = (listings || []).slice(0, 10).map((order) => ({
    id: order.inscriptionId,
    price: order.price,
    number: order.inscriptionNumber,
    source: order.source,
    marketplaceUrl: order.marketplaceUrl,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Trade Ordinals{' '}
              <span className="gradient-text">Trustlessly</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              Non-custodial Bitcoin Ordinals marketplace powered by PSBTs.
              Zero fees. No middleman. Your keys, your inscriptions.
            </p>
            <div className="max-w-xl mx-auto mb-8">
              <SearchBar placeholder="Search by inscription ID or collection..." />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/listings" className="btn-primary flex items-center gap-2">
                Browse Listings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/collections" className="btn-outline">
                Explore Collections
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Shield className="w-8 h-8 text-brand-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Non-Custodial</h3>
            <p className="text-gray-400 text-sm">
              Your inscriptions never leave your wallet. Trading uses PSBTs signed
              with SIGHASH_SINGLE|ANYONECANPAY for trustless atomic swaps.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <Zap className="w-8 h-8 text-brand-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Zero Fees</h3>
            <p className="text-gray-400 text-sm">
              No platform fees. You only pay the Bitcoin network fee.
              100% of the sale price goes to the seller.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <Code2 className="w-8 h-8 text-brand-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Open Protocol</h3>
            <p className="text-gray-400 text-sm">
              Built on the OpenOrdex protocol. Order book lives on Nostr.
              No database, no backend, fully decentralized.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Recent Listings</h2>
          <Link
            href="/listings"
            className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <InscriptionGrid
          items={recentListings}
          isLoading={isLoading}
          emptyMessage="No active listings yet. Be the first to list!"
        />
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Collections</h2>
          <Link
            href="/collections"
            className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {FEATURED_COLLECTIONS.map((slug) => (
            <CollectionCard
              key={slug}
              slug={slug}
              name={slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              icon=""
              supply={0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
