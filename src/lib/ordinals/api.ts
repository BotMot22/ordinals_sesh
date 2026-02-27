import { ORDINALS_API } from '../constants';
import type { Inscription, InscriptionContent } from '@/types/inscription';
import { getContentType } from '../utils';

/**
 * Fetch inscription details from ordinals.com
 */
export async function fetchInscription(id: string): Promise<Inscription> {
  const res = await fetch(`${ORDINALS_API}/inscription/${id}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // Fallback: parse HTML if JSON not available
    if (res.headers.get('content-type')?.includes('text/html')) {
      const html = await res.text();
      return parseInscriptionHtml(html, id);
    }
    throw new Error(`Failed to fetch inscription ${id}`);
  }

  return res.json();
}

/**
 * Parse inscription data from ordinals.com HTML page.
 * This mirrors the OpenOrdex approach for when JSON API is unavailable.
 */
function parseInscriptionHtml(html: string, id: string): Inscription {
  const getField = (label: string): string => {
    const regex = new RegExp(`<dt>${label}</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`);
    const match = html.match(regex);
    if (!match) return '';
    // Strip HTML tags and trim
    return match[1].replace(/<[^>]*>/g, '').trim();
  };

  const getFieldLink = (label: string): string => {
    const regex = new RegExp(`<dt>${label}</dt>\\s*<dd[^>]*>\\s*<a[^>]*href="([^"]*)"[^>]*>`);
    const match = html.match(regex);
    return match ? match[1] : '';
  };

  const output = getFieldLink('output') || getField('output');
  const outputParts = output.replace(/^\/output\//, '').split(':');

  return {
    id,
    number: parseInt(getField('number') || '0', 10),
    address: getField('address'),
    output: output.replace(/^\/output\//, ''),
    outputValue: parseInt(getField('output value') || '0', 10),
    contentType: getField('content type'),
    contentLength: parseInt(getField('content length') || '0', 10),
    timestamp: 0,
    genesisHeight: parseInt(getField('genesis height') || '0', 10),
    genesisFee: parseInt(getField('genesis fee') || '0', 10),
    genesisTx: getField('genesis transaction'),
    location: getField('location'),
    offset: parseInt(getField('offset') || '0', 10),
    sat: 0,
    satName: '',
    rarity: getField('rarity') || 'common',
  };
}

/**
 * Get inscription content info for preview/display.
 */
export function getInscriptionContent(id: string, contentType: string): InscriptionContent {
  const type = getContentType(contentType);
  return {
    type,
    url: `${ORDINALS_API}/content/${id}`,
    previewUrl: `${ORDINALS_API}/preview/${id}`,
  };
}

/**
 * Fetch inscriptions for an address.
 */
export async function fetchAddressInscriptions(address: string): Promise<Inscription[]> {
  const res = await fetch(`${ORDINALS_API}/inscriptions?address=${address}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`Failed to fetch inscriptions for ${address}`);
  return res.json();
}

/**
 * Fetch recent inscriptions.
 */
export async function fetchRecentInscriptions(limit = 20): Promise<Inscription[]> {
  const res = await fetch(`${ORDINALS_API}/inscriptions?limit=${limit}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch recent inscriptions');
  return res.json();
}
