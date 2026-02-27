'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';

interface PsbtViewerProps {
  psbtBase64: string;
  label?: string;
}

export function PsbtViewer({ psbtBase64, label = 'PSBT' }: PsbtViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(psbtBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-white transition-colors"
            title="Copy PSBT"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <div
        className={`font-mono text-xs text-gray-400 break-all ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {psbtBase64}
      </div>
    </div>
  );
}
