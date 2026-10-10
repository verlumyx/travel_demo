'use client';

import * as React from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';
import {
  generateManifestPdf,
  type ManifestPdfDeparture,
  type ManifestPdfUnit,
  type ManifestPdfPassenger,
} from '../pdf/manifest-pdf.generator';

export interface PrintManifestButtonProps {
  departure: ManifestPdfDeparture & { id?: string };
  assignedUnits: ManifestPdfUnit[];
  passengers: ManifestPdfPassenger[];
}

export function PrintManifestButton({
  departure,
  assignedUnits,
  passengers,
}: PrintManifestButtonProps) {
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handlePrint = () => {
    try {
      setIsPrinting(true);
      const doc = generateManifestPdf({
        departure,
        assignedUnits,
        passengers,
      });

      doc.autoPrint();
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      const opened = window.open(blobUrl, '_blank');
      if (!opened) {
        // En caso de bloqueo de ventanas emergentes en el navegador
        doc.save(`Manifiesto_${departure.code}.pdf`);
      }
    } catch (error) {
      console.error('Error al generar PDF para impresión:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    try {
      setIsDownloading(true);
      const doc = generateManifestPdf({
        departure,
        assignedUnits,
        passengers,
      });

      doc.save(`Manifiesto_${departure.code}.pdf`);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        title="Descargar archivo PDF estructurado"
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
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        title="Abrir e imprimir manifiesto en PDF oficial"
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        <span>Imprimir Manifiesto</span>
      </button>
    </div>
  );
}
