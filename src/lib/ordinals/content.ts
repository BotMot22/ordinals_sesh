import { ORDINALS_API } from '../constants';

/**
 * Get the content URL for an inscription.
 */
export function getContentUrl(inscriptionId: string): string {
  return `${ORDINALS_API}/content/${inscriptionId}`;
}

/**
 * Get the preview URL for an inscription.
 */
export function getPreviewUrl(inscriptionId: string): string {
  return `${ORDINALS_API}/preview/${inscriptionId}`;
}

/**
 * Get the explorer URL for an inscription.
 */
export function getExplorerUrl(inscriptionId: string): string {
  return `${ORDINALS_API}/inscription/${inscriptionId}`;
}

/**
 * Determine if content should be displayed in an iframe.
 */
export function shouldUseIframe(contentType: string): boolean {
  return (
    contentType.startsWith('text/html') ||
    contentType.startsWith('model/') ||
    contentType.startsWith('video/') ||
    contentType.startsWith('audio/')
  );
}

/**
 * Determine if content is an image.
 */
export function isImageContent(contentType: string): boolean {
  return contentType.startsWith('image/');
}

/**
 * Determine if content is text.
 */
export function isTextContent(contentType: string): boolean {
  return (
    contentType.startsWith('text/') &&
    !contentType.startsWith('text/html')
  );
}
