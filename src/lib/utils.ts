import { SATS_PER_BTC } from './constants';

export function satsToBtc(sats: number): number {
  return sats / SATS_PER_BTC;
}

export function btcToSats(btc: number): number {
  return Math.round(btc * SATS_PER_BTC);
}

export function formatSats(sats: number): string {
  if (sats >= SATS_PER_BTC) {
    return `${satsToBtc(sats).toFixed(8)} BTC`;
  }
  if (sats >= 1_000_000) {
    return `${(sats / 1_000_000).toFixed(2)}M sats`;
  }
  if (sats >= 1_000) {
    return `${(sats / 1_000).toFixed(1)}K sats`;
  }
  return `${sats} sats`;
}

export function formatBtc(sats: number): string {
  return `${satsToBtc(sats).toFixed(8)} BTC`;
}

export function formatUsd(sats: number, btcPrice: number): string {
  const usd = satsToBtc(sats) * btcPrice;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function shortenTxid(txid: string, chars = 8): string {
  if (!txid) return '';
  return `${txid.slice(0, chars)}...${txid.slice(-chars)}`;
}

export function getInscriptionId(txid: string, index: number): string {
  return `${txid}i${index}`;
}

export function parseInscriptionId(id: string): { txid: string; index: number } {
  const parts = id.split('i');
  return {
    txid: parts[0],
    index: parseInt(parts[1], 10),
  };
}

export function getOutputLocation(txid: string, vout: number): string {
  return `${txid}:${vout}`;
}

export function parseOutputLocation(location: string): { txid: string; vout: number } {
  const [txid, vout] = location.split(':');
  return { txid, vout: parseInt(vout, 10) };
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hexToBase64(hex: string): string {
  return Buffer.from(hex, 'hex').toString('base64');
}

export function base64ToHex(base64: string): string {
  return Buffer.from(base64, 'base64').toString('hex');
}

// PSBT format conversion aliases (no bitcoinjs-lib dependency)
export function psbtHexToBase64(hex: string): string {
  return hexToBase64(hex);
}

export function psbtBase64ToHex(base64: string): string {
  return base64ToHex(base64);
}

export function getContentType(contentType: string): 'image' | 'text' | 'html' | 'audio' | 'video' | 'model' | 'unknown' {
  if (!contentType) return 'unknown';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('text/html')) return 'html';
  if (contentType.startsWith('text/')) return 'text';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('model/')) return 'model';
  return 'unknown';
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
