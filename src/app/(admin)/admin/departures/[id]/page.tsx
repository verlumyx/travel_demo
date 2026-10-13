import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createDepartureUnitContainer } from '@/modules/departure-unit/container';
import { createTransportUnitContainer } from '@/modules/transport-unit/container';
import { departureRoutes } from '@/modules/departure/routes';
import { tourRoutes } from '@/modules/tour/routes';
import { toDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { toDepartureUnitDto, type DepartureUnitDto } from '@/modules/departure-unit/serializers/departure-unit.serializer';
import type { TransportUnitRow } from '@/modules/transport-unit/models/transport-unit.model';
import { DepartureStatusBadge } from '@/modules/departure/ui/DepartureStatusBadge';
import { DepartureStatusSelect } from '@/modules/departure/ui/DepartureStatusSelect';
import { DepartureFleetManager } from '@/modules/departure/ui/DepartureFleetManager';
import { RichTextView, isEmptyHtml } from '@/components/ui/rich-text-view';
import {
  CalendarDays,
  Compass,
  Clock,
  MapPin,
  Edit3,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';
import { z } from 'zod';
import { DepartureNotFoundException } from '@/modules/departure/exceptions/departure-not-found.exception';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartureDetailPage({ params }: PageProps) {
  const { id } = await params;
  await guardPage('departures.show');

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const departureContainer = createDepartureContainer();
  const departureUnitContainer = createDepartureUnitContainer();
  const transportUnitContainer = createTransportUnitContainer();

  let departureData;
  try {
    departureData = await departureContainer.findService.executeWithTour(id);
  } catch (error) {
    if (error instanceof DepartureNotFoundException) {
      notFound();
    }
    throw error;
  }

  const { departure: rawDeparture, tour } = departureData;
  const departure = toDepartureDto({
    ...rawDeparture,
    tourName: tour.name,
    tourCode: tour.code,
  });

  const [rawAssignedUnits, activeTransportUnits]: [any[], TransportUnitRow[]] = await Promise.all([
    departureUnitContainer.findService.findByDepartureId(id),
    transportUnitContainer.repository.getActive(),
  ]);

  const assignedUnits: DepartureUnitDto[] = rawAssignedUnits.map(toDepartureUnitDto);
  const assignedUnitIds = new Set(assignedUnits.map((u: DepartureUnitDto) => u.transportUnitId));
  const availableTransportUnits = activeTransportUnits.filter(
    (u: TransportUnitRow) => !assignedUnitIds.has(u.id),
  );

  const depDate = new Date(departure.departureDate);
  const retDate = departure.returnDate ? new Date(departure.returnDate) : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={departureRoutes.list()}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {departure.code}
              </h1>
              <DepartureStatusBadge status={departure.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Salida programada para el tour{' '}
              <Link href={tourRoutes.show(tour.id)} className="text-primary hover:underline font-medium">
                {tour.name} ({tour.code})
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href={`/admin/departures/${departure.id}/manifest`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Manifiesto
          </Link>
          <DepartureStatusSelect id={departure.id} currentStatus={departure.status} />
          <Link
            href={departureRoutes.edit(departure.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-input bg-background hover:bg-muted text-foreground text-xs font-medium transition shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar Salida
          </Link>
        </div>
      </div>

      {/* Main Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Schedule & Dates */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <CalendarDays className="h-4 w-4" />
            Cronograma del Viaje
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Fecha de Salida:</span>
              <span className="font-semibold text-foreground text-sm">
                {depDate.toLocaleDateString('es-VE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div>
                <span className="text-muted-foreground block">Hora de Salida:</span>
                <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {departure.meetingTime && (
                <div>
                  <span className="text-muted-foreground block">Hora de Cita:</span>
                  <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    {departure.meetingTime}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground block">Fecha Estimada de Retorno:</span>
              <span className="font-medium text-foreground">
                {retDate
                  ? retDate.toLocaleDateString('es-VE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Mismo día'}
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Point & Pricing */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <MapPin className="h-4 w-4" />
            Logística y Tarifa
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Punto de Encuentro:</span>
              <span className="font-medium text-foreground text-sm">
                {departure.meetingPoint || 'No especificado aún'}
              </span>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground block">Tarifa Aplicable:</span>
              {departure.priceOverride ? (
                <div className="mt-0.5">
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    ${departure.priceOverride} USD
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-2 line-through">
                    ${tour.basePrice} {tour.currency}
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    (Tarifa especial para esta salida)
                  </span>
                </div>
              ) : (
                <div className="mt-0.5">
                  <span className="text-base font-bold text-foreground">
                    ${tour.basePrice} {tour.currency}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    (Precio base del tour)
                  </span>
                </div>
              )}
            </div>

            {!isEmptyHtml(departure.notes) && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground block text-xs font-semibold">Notas Operativas:</span>
                <RichTextView
                  content={departure.notes}
                  className="text-xs text-foreground mt-0.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tour Summary Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Compass className="h-4 w-4" />
              Tour Asociado
            </div>
            <Link
              href={tourRoutes.show(tour.id)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Ver Tour
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-foreground text-sm">{tour.name}</span>
              <span className="text-muted-foreground block text-[11px]">{tour.code}</span>
            </div>

            <div className="pt-1 flex items-center gap-4">
              <div>
                <span className="text-muted-foreground block">Duración:</span>
                <span className="font-medium text-foreground">{tour.durationDays} día(s)</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Alimentación:</span>
                <span className="font-medium text-foreground">
                  {tour.includesFood ? 'Incluida' : 'No incluida'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Hospedaje:</span>
                <span className="font-medium text-foreground">
                  {tour.includesLodging ? 'Incluido' : 'No incluido'}
                </span>
              </div>
            </div>

            {tour.shortDescription && (
              <p className="text-muted-foreground text-[11px] pt-1 line-clamp-2">
                {tour.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fleet & Capacity Manager Component */}
      <DepartureFleetManager
        departureId={departure.id}
        totalCapacity={departure.totalCapacity}
        bookedSlots={departure.bookedSlots}
        departureStatus={departure.status}
        assignedUnits={assignedUnits}
        availableTransportUnits={availableTransportUnits}
      />
    </div>
  );
}
