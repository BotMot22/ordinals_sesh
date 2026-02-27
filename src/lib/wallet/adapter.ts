import type { WalletAdapter, WalletType } from '@/types/wallet';
import { UnisatAdapter } from './adapters/unisat';
import { XverseAdapter } from './adapters/xverse';
import { LeatherAdapter } from './adapters/leather';
import { OkxAdapter } from './adapters/okx';
import { MagicEdenAdapter } from './adapters/magic-eden';
import { ManualAdapter } from './adapters/manual';

const adapters: Record<WalletType, () => WalletAdapter> = {
  unisat: () => new UnisatAdapter(),
  xverse: () => new XverseAdapter(),
  leather: () => new LeatherAdapter(),
  okx: () => new OkxAdapter(),
  'magic-eden': () => new MagicEdenAdapter(),
  manual: () => new ManualAdapter(),
};

export function getWalletAdapter(type: WalletType): WalletAdapter {
  const factory = adapters[type];
  if (!factory) throw new Error(`Unknown wallet type: ${type}`);
  return factory();
}

export function getAvailableWallets(): WalletAdapter[] {
  return Object.values(adapters).map((factory) => factory());
}

export function getInstalledWallets(): WalletAdapter[] {
  return getAvailableWallets().filter((adapter) => adapter.isInstalled());
}
