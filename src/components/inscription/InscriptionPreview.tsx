'use client';

import { useState } from 'react';
import { ORDINALS_API } from '@/lib/constants';
import { isImageContent, shouldUseIframe } from '@/lib/ordinals/content';
import { Skeleton } from '@/components/common/Skeleton';

interface InscriptionPreviewProps {
  inscriptionId: string;
  contentType?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InscriptionPreview({
  inscriptionId,
  contentType = '',
  className = '',
  size = 'md',
}: InscriptionPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const contentUrl = `${ORDINALS_API}/content/${inscriptionId}`;
  const previewUrl = `${ORDINALS_API}/preview/${inscriptionId}`;

  if (error) {
    return (
      <div className={`inscription-frame flex items-center justify-center bg-gray-900 ${className}`}>
        <span className="text-gray-600 text-xs">Preview unavailable</span>
      </div>
    );
  }

  if (isImageContent(contentType)) {
    return (
      <div className={`inscription-frame relative ${className}`}>
        {loading && <Skeleton className="absolute inset-0" />}
        <img
          src={contentUrl}
          alt={`Inscription ${inscriptionId}`}
          className="w-full h-full object-contain"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Use iframe for HTML, video, audio, or unknown types
  return (
    <div className={`inscription-frame relative ${className}`}>
      {loading && <Skeleton className="absolute inset-0" />}
      <iframe
        src={previewUrl}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        loading="lazy"
        title={`Inscription ${inscriptionId}`}
      />
    </div>
  );
}
