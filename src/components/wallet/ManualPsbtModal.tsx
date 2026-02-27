'use client';

import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Copy, CheckCircle } from 'lucide-react';

interface ManualPsbtModalProps {
  isOpen: boolean;
  onClose: () => void;
  psbtBase64: string;
  onSigned: (signedPsbtBase64: string) => void;
  title?: string;
}

export function ManualPsbtModal({
  isOpen,
  onClose,
  psbtBase64,
  onSigned,
  title = 'Sign PSBT',
}: ManualPsbtModalProps) {
  const [signedPsbt, setSignedPsbt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(psbtBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (signedPsbt.trim()) {
      onSigned(signedPsbt.trim());
      setSignedPsbt('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            1. Copy this PSBT and sign it in your wallet (e.g., Sparrow):
          </label>
          <div className="relative">
            <textarea
              readOnly
              value={psbtBase64}
              className="input-field w-full h-24 font-mono text-xs resize-none"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            2. Paste the signed PSBT here:
          </label>
          <textarea
            value={signedPsbt}
            onChange={(e) => setSignedPsbt(e.target.value)}
            placeholder="Paste signed PSBT (base64)..."
            className="input-field w-full h-24 font-mono text-xs resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!signedPsbt.trim()}
            className="btn-primary flex-1"
          >
            Submit Signed PSBT
          </button>
        </div>
      </div>
    </Modal>
  );
}
