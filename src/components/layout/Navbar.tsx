'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { SearchBar } from '@/components/common/SearchBar';
import { classNames } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/listings', label: 'Listings' },
  { href: '/profile', label: 'Profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              Ordinals<span className="text-brand-500">Sesh</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-3 ml-4">
            <WalletButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-2">
            <SearchBar className="mb-3" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={classNames(
                  'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
