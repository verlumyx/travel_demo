'use client';

import * as React from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';
import {
  generateVoucherPdf,
  type VoucherPdfData,
} from '@/modules/booking/pdf/voucher-pdf.generator';

export interface CustomerVoucherPrintButtonProps {
  data: VoucherPdfData;
}

export function CustomerVoucherPrintButton({ data }: CustomerVoucherPrintButtonProps) {
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const doc = await generateVoucherPdf(data);

      doc.autoPrint();
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      const opened = window.open(blobUrl, '_blank');
      if (!opened) {
        doc.save(`Voucher_${data.booking.code}.pdf`);
      }
    } catch (error) {
      console.error('Error al generar PDF de voucher para impresión:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const doc = await generateVoucherPdf(data);
      doc.save(`Voucher_${data.booking.code}.pdf`);
    } catch (error) {
      console.error('Error al descargar voucher PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading || isPrinting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        title="Descargar Boleto / Voucher en PDF estructurado"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Download className="h-4 w-4 text-muted-foreground" />
        )}
        <span>Descargar PDF</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        disabled={isPrinting || isDownloading}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        title="Abrir e imprimir voucher en PDF oficial"
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        <span>Imprimir Boleto</span>
      </button>
    </div>
  );
}
