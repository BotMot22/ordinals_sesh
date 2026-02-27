'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm max-w-sm ${
                toast.type === 'success'
                  ? 'bg-green-900/80 border-green-700 text-green-100'
                  : toast.type === 'error'
                  ? 'bg-red-900/80 border-red-700 text-red-100'
                  : 'bg-gray-800/80 border-gray-700 text-gray-100'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Simple standalone Toaster for layout.tsx
export function Toaster() {
  return null; // Toast state managed through ToastProvider wrapping in providers.tsx
}
