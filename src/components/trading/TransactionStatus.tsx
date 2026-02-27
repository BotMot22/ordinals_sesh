'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { shortenTxid } from '@/lib/utils';
import { fetchTxStatus } from '@/lib/api/mempool';
import type { TransactionInfo } from '@/types/transaction';

interface TransactionStatusProps {
  txid: string;
  onConfirmed?: () => void;
}

export function TransactionStatus({ txid, onConfirmed }: TransactionStatusProps) {
  const [txInfo, setTxInfo] = useState<TransactionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txid) return;

    let cancelled = false;
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const info = await fetchTxStatus(txid);
        if (cancelled) return;
        setTxInfo(info);

        if (info.status === 'confirmed') {
          clearInterval(interval);
          onConfirmed?.();
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 10_000); // Poll every 10s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [txid, onConfirmed]);

  if (error) {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        <div className="flex-1">
          <p className="text-sm text-white">Transaction Broadcast</p>
          <p className="text-xs text-gray-500">Waiting for mempool confirmation...</p>
        </div>
        <a
          href={`https://mempool.space/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:text-brand-300"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
    mempool: { icon: Loader2, color: 'text-blue-400', label: 'In Mempool', animate: true },
    confirmed: { icon: CheckCircle, color: 'text-green-500', label: 'Confirmed' },
    failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
  };

  const status = txInfo?.status || 'pending';
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <Icon
          className={`w-5 h-5 ${config.color} ${
            'animate' in config && config.animate ? 'animate-spin' : ''
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{config.label}</p>
            {txInfo?.confirmations ? (
              <span className="text-xs text-gray-500">
                ({txInfo.confirmations} confirmation{txInfo.confirmations !== 1 ? 's' : ''})
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500 font-mono">{shortenTxid(txid, 12)}</p>
        </div>
        <a
          href={`https://mempool.space/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:text-brand-300"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
