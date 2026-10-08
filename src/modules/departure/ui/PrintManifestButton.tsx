'use client';

import { Printer } from 'lucide-react';

export function PrintManifestButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimir Manifiesto
    </button>
  );
}
