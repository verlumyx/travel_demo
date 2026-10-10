import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createDepartureUnitContainer } from '@/modules/departure-unit/container';
import { createPassengerContainer } from '@/modules/passenger/container';
import { departureRoutes } from '@/modules/departure/routes';
import { toDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { toDepartureUnitDto } from '@/modules/departure-unit/serializers/departure-unit.serializer';
import { PrintManifestButton } from '@/modules/departure/ui/PrintManifestButton';
import { stripHtml } from '@/components/ui/rich-text-view';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bus,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartureManifestPage({ params }: PageProps) {
  await guardPage('departures.show');
  const { id } = await params;

  const departureContainer = createDepartureContainer();
  const departureUnitContainer = createDepartureUnitContainer();
  const passengerContainer = createPassengerContainer();

  let departureData;
  try {
    departureData = await departureContainer.findService.executeWithTour(id);
  } catch {
    notFound();
  }

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
  const depDate = new Date(departure.departureDate);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={departureRoutes.show(departure.id)}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              Manifiesto de Abordaje
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Salida <span className="font-mono font-bold text-foreground">{departure.code}</span> • {tour.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <PrintManifestButton />
        </div>
      </div>

      {/* Official Manifest Sheet */}
      <div className="bg-card border border-border print:border-none print:shadow-none rounded-xl p-6 sm:p-8 shadow-xs space-y-6 print:p-0 print:space-y-4">
        {/* Manifest Header */}
        <div className="border-b-2 border-foreground/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase block">
                Operaciones Turísticas y Transporte
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
                Manifiesto Oficial de Abordaje
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="font-mono font-bold text-base block text-foreground">
                SALIDA: {departure.code}
              </span>
              <span className="text-muted-foreground text-[11px]">
                Tour: {tour.name} ({tour.code})
              </span>
            </div>
          </div>

          {/* Operational Departure Specs */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/30 print:bg-slate-100 p-3 rounded-lg border border-border print:border-slate-300">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Fecha del Viaje:</span>
              <span className="font-semibold text-foreground">
                {depDate.toLocaleDateString('es-VE', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Hora Salida / Cita:</span>
              <span className="font-semibold text-foreground">
                {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                {departure.meetingTime ? ` (Cita: ${departure.meetingTime})` : ''}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Punto de Encuentro:</span>
              <span className="font-semibold text-foreground truncate block">
                {departure.meetingPoint || 'No especificado'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Aforo y Ocupación:</span>
              <span className="font-semibold text-foreground font-mono">
                {passengers.length} Pasajeros / {departure.totalCapacity} Cupos Totales
              </span>
            </div>
          </div>

          {/* Assigned Fleet Units */}
          {assignedUnits.length > 0 && (
            <div className="mt-2 text-xs flex flex-wrap gap-4 text-muted-foreground">
              <span className="font-bold text-foreground flex items-center gap-1">
                <Bus className="h-3.5 w-3.5" />
                Unidades Asignadas:
              </span>
              {assignedUnits.map((u) => (
                <span key={u.id} className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                  {u.unitPlateNumber ? `Placa ${u.unitPlateNumber}` : u.unitCode}
                  {u.effectiveDriver !== 'No asignado' ? ` (Chofer: ${u.effectiveDriver})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Passengers Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Lista de Pasajeros Registrados ({passengers.length})
            </h3>
            <span className="text-[11px] text-muted-foreground print:text-black">
              * Marcar casilla [ ] en el momento del abordaje físico
            </span>
          </div>

          {passengers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No hay pasajeros confirmados registrados en esta salida aún.
            </div>
          ) : (
            <table className="w-full text-left text-xs border border-border print:border-black divide-y divide-border print:divide-black">
              <thead className="bg-muted/50 print:bg-slate-200 text-foreground font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-border print:border-black">#</th>
                  <th className="py-2.5 px-3 w-10 text-center border-r border-border print:border-black">Check</th>
                  <th className="py-2.5 px-3 border-r border-border print:border-black">Pasajero</th>
                  <th className="py-2.5 px-3 border-r border-border print:border-black">Documento</th>
                  <th className="py-2.5 px-3 border-r border-border print:border-black">Teléfono</th>
                  <th className="py-2.5 px-3 border-r border-border print:border-black">Reserva</th>
                  <th className="py-2.5 px-3 border-r border-border print:border-black">Contacto Emergencia</th>
                  <th className="py-2.5 px-3">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black text-[11px]">
                {passengers.map((p, index) => (
                  <tr key={p.id} className="hover:bg-muted/10">
                    <td className="py-2 px-3 font-mono font-bold text-center border-r border-border print:border-black">
                      {index + 1}
                    </td>

                    <td className="py-2 px-3 text-center border-r border-border print:border-black">
                      <div className="w-4 h-4 border border-foreground/40 print:border-black rounded-xs mx-auto"></div>
                    </td>

                    <td className="py-2 px-3 font-semibold text-foreground border-r border-border print:border-black">
                      {p.firstName} {p.lastName}
                      {p.isMainContact && (
                        <span className="ml-1 text-[9px] px-1 py-0.2 bg-emerald-500/10 text-emerald-600 print:text-black font-normal rounded">
                          (Titular)
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 font-mono border-r border-border print:border-black">
                      {p.documentNumber ? (
                        <>
                          {p.documentType ? `${p.documentType.toUpperCase()}: ` : ''}
                          {p.documentNumber}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-2 px-3 border-r border-border print:border-black">
                      {p.phone || '-'}
                    </td>

                    <td className="py-2 px-3 font-mono border-r border-border print:border-black">
                      {p.bookingCode}
                    </td>

                    <td className="py-2 px-3 border-r border-border print:border-black">
                      {p.customerEmergencyContact ? (
                        <div>
                          <span>{p.customerEmergencyContact}</span>
                          {p.customerEmergencyPhone && (
                            <span className="block text-[10px] text-muted-foreground print:text-black">
                              {p.customerEmergencyPhone}
                            </span>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-2 px-3 text-muted-foreground print:text-black">
                      {stripHtml(p.notes) || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer & Signatures */}
        <div className="pt-8 mt-6 border-t border-foreground/20 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-12">
            <div>
              <span className="text-[11px] text-muted-foreground print:text-black block">
                Total de pasajeros abordados:{' '}
                <span className="font-mono font-bold">______ de {passengers.length}</span>
              </span>
            </div>
            <div className="border-t border-foreground/40 print:border-black pt-2">
              <span className="block font-bold text-foreground">Firma del Guía / Coordinador</span>
              <span className="text-[10px] text-muted-foreground print:text-black">Nombre y Cédula</span>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <span className="text-[11px] text-muted-foreground print:text-black block">
                Hora real de salida:{' '}
                <span className="font-mono font-bold">____ : ____</span>
              </span>
            </div>
            <div className="border-t border-foreground/40 print:border-black pt-2">
              <span className="block font-bold text-foreground">Firma del Conductor Principal</span>
              <span className="text-[10px] text-muted-foreground print:text-black">Unidad de Transporte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
