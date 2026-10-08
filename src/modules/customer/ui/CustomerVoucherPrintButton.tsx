'use client';

import { Printer } from 'lucide-react';

export function CustomerVoucherPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimir / Descargar PDF
    </button>
  );
}
