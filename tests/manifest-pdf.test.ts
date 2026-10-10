import { describe, it, expect } from 'vitest';
import { generateManifestPdf } from '@/modules/departure/pdf/manifest-pdf.generator';

describe('Manifest PDF Generator', () => {
  it('genera un PDF válido para una salida con pasajeros confirmados', () => {
    const doc = generateManifestPdf({
      departure: {
        code: 'SAL000001',
        tourName: 'ARAYA FULL DAY',
        tourCode: 'TUR000003',
        departureDate: '2026-10-17T06:30:00Z',
        meetingTime: '06:30 AM',
        meetingPoint: 'Muelle de Cumaná',
        totalCapacity: 20,
      },
      assignedUnits: [
        {
          unitCode: 'UNI000001',
          unitPlateNumber: 'A12BC34',
          effectiveDriver: 'Carlos Rodriguez',
        },
      ],
      passengers: [
        {
          id: 'p-1',
          firstName: 'Alejandro',
          lastName: 'Gomez',
          documentType: 'cedula',
          documentNumber: '19876543',
          phone: '+58 412 1234567',
          isMainContact: true,
          bookingCode: 'RES000001',
          customerEmergencyContact: 'Maria Gomez',
          customerEmergencyPhone: '+58 414 7654321',
          notes: '<p>Asiento adelante por mareo</p>',
        },
      ],
    });

    const output = doc.output();
    expect(output.startsWith('%PDF-')).toBe(true);
    expect(doc.getNumberOfPages()).toBe(1);
  });

  it('genera un PDF válido con estructura correcta cuando no hay pasajeros', () => {
    const doc = generateManifestPdf({
      departure: {
        code: 'SAL000002',
        tourName: 'PARAPENTE LA GUIRA',
        departureDate: '2026-11-01T08:00:00Z',
        totalCapacity: 10,
      },
      assignedUnits: [],
      passengers: [],
    });

    const output = doc.output();
    expect(output.startsWith('%PDF-')).toBe(true);
    expect(doc.getNumberOfPages()).toBe(1);
  });

  it('gestiona paginación automáticamente cuando hay más de 25 pasajeros', () => {
    const manyPassengers = Array.from({ length: 30 }, (_, i) => ({
      id: `p-${i + 1}`,
      firstName: `Pasajero ${i + 1}`,
      lastName: `Prueba ${i + 1}`,
      documentType: 'cedula',
      documentNumber: `2${i}999888`,
      phone: '+58 412 0000000',
      isMainContact: i === 0,
      bookingCode: `RES00000${Math.floor(i / 4) + 1}`,
      customerEmergencyContact: null,
      customerEmergencyPhone: null,
      notes: null,
    }));

    const doc = generateManifestPdf({
      departure: {
        code: 'SAL000003',
        tourName: 'PARQUE NACIONAL MOCHIMA',
        departureDate: '2026-12-15T07:00:00Z',
        totalCapacity: 35,
      },
      assignedUnits: [
        {
          unitCode: 'UNI000002',
          effectiveDriver: 'No asignado',
        },
      ],
      passengers: manyPassengers,
    });

    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });
});
