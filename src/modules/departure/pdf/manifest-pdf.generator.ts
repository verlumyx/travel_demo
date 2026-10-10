import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { stripHtml } from '@/components/ui/rich-text-view';

export interface ManifestPdfDeparture {
  code: string;
  tourName?: string | null;
  tourCode?: string | null;
  departureDate: string | Date;
  meetingTime?: string | null;
  meetingPoint?: string | null;
  totalCapacity: number;
}

export interface ManifestPdfUnit {
  unitCode: string;
  unitPlateNumber?: string | null;
  effectiveDriver?: string | null;
}

export interface ManifestPdfPassenger {
  id: string;
  firstName: string;
  lastName: string;
  documentType?: 'cedula' | 'passport' | 'other' | string | null;
  documentNumber?: string | null;
  phone?: string | null;
  isMainContact: boolean;
  bookingCode: string;
  customerEmergencyContact?: string | null;
  customerEmergencyPhone?: string | null;
  notes?: string | null;
}

export interface ManifestPdfData {
  departure: ManifestPdfDeparture;
  assignedUnits: ManifestPdfUnit[];
  passengers: ManifestPdfPassenger[];
}

/**
 * Genera el documento PDF oficial del Manifiesto de Abordaje estructurado desde cero.
 * Utiliza vectores puros, tipografía corporativa y paginación automática.
 */
export function generateManifestPdf(data: ManifestPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Paleta corporativa
  const primaryColor: [number, number, number] = [13, 148, 136]; // Teal #0d9488
  const darkTextColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate 500
  const borderColor: [number, number, number] = [203, 213, 225]; // Slate 300
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate 50

  // 1. Barra decorativa superior
  doc.setFillColor(...primaryColor);
  doc.rect(margin, margin, contentWidth, 2.5, 'F');

  let currentY = margin + 8;

  // 2. Encabezado institucional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('TRAVELDEMO • OPERACIONES TURÍSTICAS Y TRANSPORTE', margin, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkTextColor);
  doc.text('MANIFIESTO OFICIAL DE ABORDAJE', margin, currentY);

  // Encabezado derecho: Código de salida y Tour
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  const salidaText = `SALIDA: ${data.departure.code}`;
  doc.text(salidaText, pageWidth - margin, currentY - 4, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  const tourSuffix = data.departure.tourCode ? ` (${data.departure.tourCode})` : '';
  const tourName = data.departure.tourName || 'Tour General';
  const tourText = `Tour: ${tourName}${tourSuffix}`;
  doc.text(tourText, pageWidth - margin, currentY + 1, { align: 'right' });

  currentY += 6;

  // 3. Ficha resumen de especificaciones operativas
  doc.setDrawColor(...borderColor);
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  const colWidth = contentWidth / 4;
  const depDate = new Date(data.departure.departureDate);
  const formattedDate = !isNaN(depDate.getTime())
    ? depDate.toLocaleDateString('es-VE', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No definida';

  const formattedTime = !isNaN(depDate.getTime())
    ? depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const meetingTimeText = data.departure.meetingTime
    ? `${formattedTime} (Cita: ${data.departure.meetingTime})`
    : formattedTime;

  // Columna 1: Fecha
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('FECHA DEL VIAJE', margin + 3, currentY + 6);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(formattedDate, margin + 3, currentY + 12);

  // Columna 2: Hora
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('HORA SALIDA / CITA', margin + colWidth + 3, currentY + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(meetingTimeText, margin + colWidth + 3, currentY + 12);

  // Columna 3: Punto de encuentro
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('PUNTO DE ENCUENTRO', margin + colWidth * 2 + 3, currentY + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);
  const meetingPointText = data.departure.meetingPoint || 'No especificado';
  const splitMeetingPoint = doc.splitTextToSize(meetingPointText, colWidth - 5);
  doc.text(splitMeetingPoint.slice(0, 2), margin + colWidth * 2 + 3, currentY + 11);

  // Columna 4: Aforo y Ocupación
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('AFORO Y OCUPACIÓN', margin + colWidth * 3 + 3, currentY + 6);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(
    `${data.passengers.length} Pasajeros / ${data.departure.totalCapacity} Cupos`,
    margin + colWidth * 3 + 3,
    currentY + 12
  );

  // Sub-fila: Unidades y Choferes Asignados
  doc.setDrawColor(...borderColor);
  doc.line(margin + 2, currentY + 16, margin + contentWidth - 2, currentY + 16);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('UNIDADES ASIGNADAS:', margin + 3, currentY + 21);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);
  const unitsSummary =
    data.assignedUnits.length > 0
      ? data.assignedUnits
          .map(
            (u) =>
              `${u.unitPlateNumber ? `Placa ${u.unitPlateNumber}` : u.unitCode}${
                u.effectiveDriver && u.effectiveDriver !== 'No asignado'
                  ? ` (Chofer: ${u.effectiveDriver})`
                  : ''
              }`
          )
          .join('   |   ')
      : 'Sin unidades asignadas';
  doc.text(unitsSummary, margin + 33, currentY + 21);

  currentY += 28;

  // 4. Encabezado de la Sección de Pasajeros
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`LISTA DE PASAJEROS REGISTRADOS (${data.passengers.length})`, margin, currentY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...mutedTextColor);
  doc.text('* Marcar casilla [ ] en el momento del abordaje físico', pageWidth - margin, currentY, {
    align: 'right',
  });

  currentY += 3;

  // 5. Tabla de Pasajeros
  const tableData = data.passengers.map((p, idx) => {
    let docTypeLabel = '';
    if (p.documentType === 'cedula') docTypeLabel = 'C.I.';
    else if (p.documentType === 'passport') docTypeLabel = 'PAS.';
    else if (p.documentType) docTypeLabel = `${p.documentType.toUpperCase()}:`;

    const docDisplay = p.documentNumber
      ? `${docTypeLabel ? `${docTypeLabel} ` : ''}${p.documentNumber}`.trim()
      : '-';

    const emergency = p.customerEmergencyContact
      ? `${p.customerEmergencyContact}${p.customerEmergencyPhone ? `\nTel: ${p.customerEmergencyPhone}` : ''}`
      : '-';

    const passengerName = p.isMainContact
      ? `${p.firstName} ${p.lastName}\n[Titular]`
      : `${p.firstName} ${p.lastName}`;

    const cleanNotes = stripHtml(p.notes);

    return [
      String(idx + 1),
      '[  ]',
      passengerName,
      docDisplay,
      p.phone || '-',
      p.bookingCode,
      emergency,
      cleanNotes || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      ['#', 'Check', 'Pasajero', 'Documento', 'Teléfono', 'Reserva', 'Contacto Emergencia', 'Observaciones'],
    ],
    body:
      tableData.length > 0
        ? tableData
        : [
            [
              {
                content: 'No hay pasajeros confirmados registrados en esta salida aún.',
                colSpan: 8,
                styles: {
                  halign: 'center',
                  textColor: mutedTextColor,
                  fontStyle: 'italic',
                  minCellHeight: 12,
                },
              },
            ],
          ],
    margin: { top: 16, left: margin, right: margin, bottom: 20 },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: darkTextColor,
      lineColor: borderColor,
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // #
      1: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, // Check
      2: { cellWidth: 36 }, // Pasajero
      3: { cellWidth: 22 }, // Documento
      4: { cellWidth: 22 }, // Teléfono
      5: { cellWidth: 18, halign: 'center' }, // Reserva
      6: { cellWidth: 34 }, // Contacto Emergencia
      7: { cellWidth: 34 }, // Observaciones
    },
    didDrawPage: (hookData) => {
      // Sub-encabezado en páginas 2+ para mantener contexto
      if (hookData.pageNumber > 1) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedTextColor);
        const contTour = data.departure.tourName ? ` (${data.departure.tourName})` : '';
        doc.text(
          `MANIFIESTO DE ABORDAJE • SALIDA: ${data.departure.code}${contTour} — Continuación`,
          margin,
          10
        );
      }
    },
  });

  // 6. Bloque de Cierre Operativo y Firmas
  // @ts-expect-error jspdf-autotable agrega lastAutoTable en tiempo de ejecución
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : currentY + 10;
  const signaturesHeight = 26;

  let sigY = finalY;
  if (finalY + signaturesHeight > pageHeight - 16) {
    doc.addPage();
    sigY = margin + 10;
  }

  // Tarjeta de firmas
  doc.setDrawColor(...borderColor);
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(margin, sigY, contentWidth, 24, 1.5, 1.5, 'FD');

  const halfWidth = contentWidth / 2;

  // Lado Izquierdo: Total abordados & Firma Guía
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(
    `Total de pasajeros abordados: _____ de ${data.passengers.length}`,
    margin + 4,
    sigY + 6
  );

  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.line(margin + 4, sigY + 18, margin + halfWidth - 8, sigY + 18);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Firma del Guía / Coordinador', margin + 4, sigY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('(Nombre y Cédula)', margin + halfWidth - 9, sigY + 21, { align: 'right' });

  // Lado Derecho: Hora real de salida & Firma Conductor
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('Hora real de salida:  ____ : ____', margin + halfWidth + 4, sigY + 6);

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + halfWidth + 4, sigY + 18, margin + contentWidth - 4, sigY + 18);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Firma del Conductor Principal', margin + halfWidth + 4, sigY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('(Unidad de Transporte)', margin + contentWidth - 4, sigY + 21, { align: 'right' });

  // 7. Pie de página en todas las páginas (Página X de Total)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedTextColor);
    doc.text(
      `TravelDemo • Manifiesto Oficial de Abordaje (${data.departure.code})`,
      margin,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  return doc;
}
