'use client';

import { useEffect, useState } from 'react';
import type { FlashMessage } from './flash';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function FlashToaster({ flash }: { flash: FlashMessage | null }) {
  const [dismissed, setDismissed] = useState(false);
  const [prevFlash, setPrevFlash] = useState(flash);

  if (prevFlash !== flash) {
    setPrevFlash(flash);
    setDismissed(false);
  }

  useEffect(() => {
    if (flash && !dismissed) {
      // Clear cookie on client side immediately so page refresh or navigation doesn't replay it
      document.cookie = '__flash=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash, dismissed]);

  if (!flash || dismissed) return null;

  const currentFlash = flash;

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }[currentFlash.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[currentFlash.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${bgStyles}`}>
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-medium">{currentFlash.message}</div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 hover:bg-black/5 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
