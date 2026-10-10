import { NextResponse, type NextRequest } from 'next/server';
import { hasPermission } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createDepartureUnitContainer } from '@/modules/departure-unit/container';
import { createPassengerContainer } from '@/modules/passenger/container';
import { toDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { toDepartureUnitDto } from '@/modules/departure-unit/serializers/departure-unit.serializer';
import { generateManifestPdf } from '@/modules/departure/pdf/manifest-pdf.generator';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAllowed = await hasPermission('departures.show');
    if (!isAllowed) {
      return new NextResponse('No autorizado', { status: 403 });
    }

    const { id } = await params;

    const departureContainer = createDepartureContainer();
    const departureUnitContainer = createDepartureUnitContainer();
    const passengerContainer = createPassengerContainer();

    const departureData = await departureContainer.findService.executeWithTour(id);
    const { departure: rawDeparture, tour } = departureData;
    const departure = toDepartureDto({
      ...rawDeparture,
      tourName: tour.name,
      tourCode: tour.code,
    });

    const [rawAssignedUnits, passengers] = await Promise.all([
      departureUnitContainer.findService.findByDepartureId(id),
      passengerContainer.repository.findManifestByDepartureId(id),
    ]);

    const assignedUnits = rawAssignedUnits.map(toDepartureUnitDto);

    const doc = generateManifestPdf({
      departure,
      assignedUnits,
      passengers,
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Manifiesto_${departure.code}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generando PDF de manifiesto:', error);
    return new NextResponse('Recurso no encontrado o error interno', { status: 404 });
  }
}
