import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { stripHtml } from '@/components/ui/rich-text-view';

export interface VoucherPdfBooking {
  id: string;
  code: string;
  status: string;
  slotsReserved: number;
  totalAmount: string;
  paidAmount: string;
  pendingBalance?: string;
  notes?: string | null;
  createdAt?: string | Date;
}

export interface VoucherPdfTour {
  id: string;
  name: string;
  code: string;
  durationDays?: number;
}

export interface VoucherPdfDeparture {
  id: string;
  code: string;
  departureDate: string | Date;
  returnDate?: string | Date | null;
  meetingTime?: string | null;
  meetingPoint?: string | null;
}

export interface VoucherPdfCustomer {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
}

export interface VoucherPdfPassenger {
  id: string;
  firstName: string;
  lastName: string;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  isMainContact: boolean;
  notes?: string | null;
}

export interface VoucherPdfData {
  booking: VoucherPdfBooking;
  tour: VoucherPdfTour;
  departure: VoucherPdfDeparture;
  customer: VoucherPdfCustomer;
  passengers: VoucherPdfPassenger[];
}

/**
 * Genera el documento PDF oficial del Boleto de Viaje & Voucher de Abordaje.
 * Vectorial, con tipografía corporativa, código QR integrado y paginación.
 */
export async function generateVoucherPdf(data: VoucherPdfData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Paleta corporativa
  const primaryColor: [number, number, number] = [13, 148, 136]; // Teal #0d9488
  const darkTextColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate 500
  const borderColor: [number, number, number] = [203, 213, 225]; // Slate 300
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate 50

  // 1. Barra decorativa superior
  doc.setFillColor(...primaryColor);
  doc.rect(margin, margin, contentWidth, 3, 'F');

  let currentY = margin + 9;

  // 2. Encabezado de marca y título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('TRAVELDEMO EXPEDICIONES VENEZUELA', margin, currentY);

  currentY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkTextColor);
  doc.text('BOLETO OFICIAL DE VIAJE & ABORDAJE', margin, currentY);

  currentY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(data.tour.name.toUpperCase(), margin, currentY);

  // Badge de Estado
  const statusLabels: Record<string, { label: string; bg: [number, number, number]; text: [number, number, number] }> = {
    confirmed: { label: 'CONFIRMADO', bg: [220, 252, 231], text: [22, 101, 52] },
    paid: { label: 'PAGADO', bg: [220, 252, 231], text: [22, 101, 52] },
    partially_paid: { label: 'ABONO PARCIAL', bg: [224, 242, 254], text: [7, 89, 133] },
    pending: { label: 'PENDIENTE', bg: [254, 243, 199], text: [146, 64, 14] },
    cancelled: { label: 'CANCELADO', bg: [254, 226, 226], text: [153, 27, 27] },
  };

  const statusInfo = statusLabels[data.booking.status] || {
    label: data.booking.status.toUpperCase(),
    bg: [241, 245, 249],
    text: [71, 85, 105],
  };

  const statusBadgeX = margin;
  const statusBadgeY = currentY + 3.5;
  const badgeWidth = 32;
  const badgeHeight = 6;
  doc.setFillColor(...statusInfo.bg);
  doc.roundedRect(statusBadgeX, statusBadgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...statusInfo.text);
  doc.text(statusInfo.label, statusBadgeX + badgeWidth / 2, statusBadgeY + 4.2, { align: 'center' });

  // 3. Generación e incrustación de Código QR para Check-in
  const qrValidationPayload = `RESERVA:${data.booking.code}|SALIDA:${data.departure.code}|TITULAR:${data.customer.firstName} ${data.customer.lastName}|PASAJEROS:${data.passengers.length}`;
  let qrBottom = margin + 35;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrValidationPayload, {
      margin: 1,
      width: 160,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    const qrSize = 25;
    const qrX = pageWidth - margin - qrSize;
    const qrY = margin + 5;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Borde sutil alrededor del QR
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, 'D');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('CHECK-IN MÓVIL', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedTextColor);
    doc.text('Presentar al abordar', qrX + qrSize / 2, qrY + qrSize + 7, { align: 'center' });

    qrBottom = qrY + qrSize + 8;
  } catch (err) {
    console.error('Error generando QR para voucher PDF:', err);
  }

  // Asegurar separación limpia debajo del QR para que ningún cuadro lo solape
  currentY = Math.max(statusBadgeY + badgeHeight + 6, qrBottom + 4);

  // 4. Ficha de Detalles de la Salida y Logística
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
    : 'Por definir';

  const formattedTime = !isNaN(depDate.getTime())
    ? depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const timeAndMeeting = data.departure.meetingTime
    ? `${formattedTime} (Cita: ${data.departure.meetingTime})`
    : formattedTime;

  // Col 1: Reserva y Salida
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('CÓDIGOS OFICIALES', margin + 3.5, currentY + 5.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`Reserva: ${data.booking.code}`, margin + 3.5, currentY + 11.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Salida: ${data.departure.code}`, margin + 3.5, currentY + 16.5);
  doc.text(`${data.booking.slotsReserved} cupo(s) contratados`, margin + 3.5, currentY + 20.5);

  // Col 2: Fecha
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('FECHA DEL VIAJE', margin + colWidth + 3.5, currentY + 5.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(formattedDate, margin + colWidth + 3.5, currentY + 11.5);

  // Col 3: Horarios
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('HORA DE SALIDA Y CITA', margin + colWidth * 2 + 3.5, currentY + 5.5);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(timeAndMeeting, margin + colWidth * 2 + 3.5, currentY + 11.5);

  // Col 4: Punto de Encuentro
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('PUNTO DE ENCUENTRO', margin + colWidth * 3 + 3.5, currentY + 5.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);
  const meetingPointText = data.departure.meetingPoint || 'Se notificará previamente por WhatsApp';
  const splitMeetingPoint = doc.splitTextToSize(meetingPointText, colWidth - 6);
  doc.text(splitMeetingPoint.slice(0, 3), margin + colWidth * 3 + 3.5, currentY + 10.5);

  currentY += 28;

  // 5. Bloque Resumen Financiero y Titular Contratante (2 columnas)
  const halfColWidth = (contentWidth - 4) / 2;

  // Tarjeta izquierda: Titular y Contacto
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, halfColWidth, 22, 2, 2, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DATOS DEL TITULAR (CONTRATANTE)', margin + 3.5, currentY + 5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${data.customer.firstName} ${data.customer.lastName} (${data.customer.code})`, margin + 3.5, currentY + 10.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  const docTypeLabel = data.customer.documentType === 'passport' ? 'Pas.' : 'C.I.';
  const customerDoc = data.customer.documentNumber ? `${docTypeLabel} ${data.customer.documentNumber}` : 'Sin doc.';
  const customerPhone = data.customer.phone ? ` • Tel: ${data.customer.phone}` : '';
  doc.text(`${customerDoc}${customerPhone}`, margin + 3.5, currentY + 15);

  const emergencyTxt = data.customer.emergencyContact
    ? `Emergencia: ${data.customer.emergencyContact} ${data.customer.emergencyPhone ? `(${data.customer.emergencyPhone})` : ''}`
    : 'Sin contacto de emergencia registrado';
  doc.text(emergencyTxt, margin + 3.5, currentY + 19);

  // Tarjeta derecha: Resumen de Saldos
  const rightCardX = margin + halfColWidth + 4;
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightCardX, currentY, halfColWidth, 22, 2, 2, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CONCILIACIÓN Y ESTADO DE CUENTA (USD)', rightCardX + 3.5, currentY + 5);

  const subCol = halfColWidth / 3;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('TOTAL:', rightCardX + 3.5, currentY + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`$${Number(data.booking.totalAmount).toFixed(2)}`, rightCardX + 3.5, currentY + 16);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('ABONADO:', rightCardX + subCol + 2, currentY + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Emerald
  doc.text(`$${Number(data.booking.paidAmount).toFixed(2)}`, rightCardX + subCol + 2, currentY + 16);

  const totalNum = Number(data.booking.totalAmount);
  const paidNum = Number(data.booking.paidAmount);
  const pendingNum = Math.max(0, totalNum - paidNum);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('PENDIENTE:', rightCardX + subCol * 2 + 2, currentY + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  if (pendingNum > 0) {
    doc.setTextColor(217, 119, 6); // Amber
  } else {
    doc.setTextColor(22, 101, 52);
  }
  doc.text(`$${pendingNum.toFixed(2)}`, rightCardX + subCol * 2 + 2, currentY + 16);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  const statusFin = pendingNum <= 0 ? '✓ Reserva 100% pagada' : 'Pendiente por conciliar / pagar';
  doc.text(statusFin, rightCardX + 3.5, currentY + 20);

  currentY += 26;

  // 6. Nómina oficial de pasajeros de esta reserva
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`NÓMINA DE PASAJEROS REGISTRADOS (${data.passengers.length})`, margin, currentY);

  currentY += 3;

  const tableData = data.passengers.map((p, idx) => {
    let docType = '';
    if (p.documentType === 'cedula') docType = 'C.I.';
    else if (p.documentType === 'passport') docType = 'PAS.';
    else if (p.documentType) docType = `${p.documentType.toUpperCase()}:`;

    const docDisplay = p.documentNumber
      ? `${docType ? `${docType} ` : ''}${p.documentNumber}`.trim()
      : '-';

    const passengerName = p.isMainContact
      ? `${p.firstName} ${p.lastName}\n[Titular]`
      : `${p.firstName} ${p.lastName}`;

    const role = p.isMainContact ? 'Contacto Principal' : 'Acompañante';

    return [
      String(idx + 1),
      passengerName,
      docDisplay,
      p.phone || '-',
      role,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      ['#', 'Nombre del Pasajero', 'Documento de Identidad', 'Teléfono / Móvil', 'Condición en la Reserva'],
    ],
    body: tableData,
    margin: { top: 16, left: margin, right: margin, bottom: 22 },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: darkTextColor,
      lineColor: borderColor,
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 62 },
      2: { cellWidth: 38 },
      3: { cellWidth: 36 },
      4: { cellWidth: 36 },
    },
  });

  // Obtener la posición Y final después de la tabla
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastAutoTableY = (doc as any).lastAutoTable?.finalY ?? currentY + 30;
  let finalY = lastAutoTableY + 6;

  // 7. Notas y Requerimientos Especiales (si existen)
  const cleanNotes = stripHtml(data.booking.notes);
  if (cleanNotes && cleanNotes.trim()) {
    if (finalY > pageHeight - 45) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setDrawColor(...borderColor);
    doc.setFillColor(...lightBgColor);
    doc.roundedRect(margin, finalY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('NOTAS Y REQUERIMIENTOS ESPECIALES:', margin + 3.5, finalY + 4.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkTextColor);
    const splitNotes = doc.splitTextToSize(cleanNotes, contentWidth - 7);
    doc.text(splitNotes.slice(0, 2), margin + 3.5, finalY + 9.5);

    finalY += 18;
  }

  // 8. Instrucciones y Términos de Abordaje Oficial
  if (finalY > pageHeight - 35) {
    doc.addPage();
    finalY = margin + 10;
  }

  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, finalY, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('INSTRUCCIONES IMPORTANTES PARA EL ABORDAJE:', margin + 3.5, finalY + 4.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('1. Presentar este voucher en formato digital (pantalla de su smartphone) o impreso junto a su documento de identidad original.', margin + 3.5, finalY + 8.5);
  doc.text('2. Presentarse en el punto de encuentro indicado puntualmente con al menos 20 minutos de anticipación a la hora de cita.', margin + 3.5, finalY + 12.5);
  doc.text('3. Ante cualquier consulta operativa o eventualidad durante el viaje, comuníquese con el equipo de soporte de TravelDemo.', margin + 3.5, finalY + 16.5);

  // 9. Pie de página en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 11, margin + contentWidth, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedTextColor);
    doc.text(
      'Documento Electrónico Oficial • TravelDemo C.A. • RIF: J-50000000-0 • www.traveldemo.com',
      margin,
      pageHeight - 7
    );

    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  return doc;
}
