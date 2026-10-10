import Link from 'next/link';
import { guardPage, hasPermission } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createTourContainer } from '@/modules/tour/container';
import { SearchDepartureCommand } from '@/modules/departure/commands/search-departure.command';
import { departureRoutes } from '@/modules/departure/routes';
import { DepartureStatusBadge } from '@/modules/departure/ui/DepartureStatusBadge';
import { DepartureStatusSelect } from '@/modules/departure/ui/DepartureStatusSelect';
import { toDepartureDto, type DepartureDto } from '@/modules/departure/serializers/departure.serializer';
import type { TourRow } from '@/modules/tour/models/tour.model';
import {
  CalendarDays,
  Plus,
  Search,
  Eye,
  Edit3,
  Compass,
  Users,
  Clock,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tourId?: string;
    page?: string;
  }>;
}

export default async function DeparturesListPage({ searchParams }: PageProps) {
  await guardPage('departures.list');

  const [canCreate, canUpdate, canUpdateStatus] = await Promise.all([
    hasPermission('departures.create'),
    hasPermission('departures.update'),
    hasPermission('departures.update-status'),
  ]);

  const params = await searchParams;
  const q = params.q || undefined;
  const status = params.status || undefined;
  const tourId = params.tourId || undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createDepartureContainer();
  const tourContainer = createTourContainer();

  const [searchResult, activeTours]: [{ data: any[]; total: number }, TourRow[]] = await Promise.all([
    container.searchService.execute(
      SearchDepartureCommand.fromInput({
        q,
        status,
        tourId,
        limit,
        offset,
      }),
    ),
    tourContainer.repository.getActive(),
  ]);

  const { data: rawDepartures, total } = searchResult;
  const departures: DepartureDto[] = rawDepartures.map(toDepartureDto);
  const totalPages = Math.ceil(total / limit);

  // Quick summary counts
  const totalCapacitySum = departures.reduce((acc: number, d: DepartureDto) => acc + d.totalCapacity, 0);
  const totalBookedSum = departures.reduce((acc: number, d: DepartureDto) => acc + d.bookedSlots, 0);
  const upcomingCount = departures.filter(
    (d: DepartureDto) => d.status === 'scheduled' || d.status === 'confirmed',
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Salidas Programadas
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Programación de fechas para tours, asignación de flota de transporte y control de aforo ({total} registradas).
          </p>
        </div>

        {canCreate && (
          <Link
            href={departureRoutes.create()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nueva Salida
          </Link>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Salidas</span>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
          <span className="text-xs text-muted-foreground">registradas en catálogo</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Próximas Salidas</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{upcomingCount}</p>
          <span className="text-xs text-muted-foreground">programadas / confirmadas</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Aforo Visible</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{totalCapacitySum}</p>
          <span className="text-xs text-muted-foreground">asientos en esta página</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cupos Reservados</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalBookedSum}</p>
          <span className="text-xs text-muted-foreground">pasajeros confirmados</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form method="GET" className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por código, punto de encuentro..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            name="tourId"
            defaultValue={tourId ?? ''}
            className="rounded-lg bg-background border border-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
          >
            <option value="">Todos los Tours</option>
            {activeTours.map((t: TourRow) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status ?? ''}
            className="rounded-lg bg-background border border-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
          >
            <option value="">Todos los estados</option>
            <option value="scheduled">Programada</option>
            <option value="confirmed">Confirmada</option>
            <option value="in_progress">En Curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition cursor-pointer"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Departures Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Tour / Experiencia</th>
                <th className="py-3 px-4 font-semibold">Salida / Cita</th>
                <th className="py-3 px-4 font-semibold">Retorno Estimado</th>
                <th className="py-3 px-4 font-semibold text-center">Aforo / Cupos</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    No se encontraron salidas programadas con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                departures.map((dep: DepartureDto) => {
                  const depDate = new Date(dep.departureDate);
                  const retDate = dep.returnDate ? new Date(dep.returnDate) : null;

                  return (
                    <tr key={dep.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-primary">
                        <Link href={departureRoutes.show(dep.id)} className="hover:underline">
                          {dep.code}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{dep.tourName || 'Tour no asignado'}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Compass className="h-3 w-3 text-muted-foreground" />
                          <span>{dep.tourCode || '-'}</span>
                          {dep.priceOverride && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                              ${dep.priceOverride} (Especial)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">
                          {depDate.toLocaleDateString('es-VE', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {depDate.toLocaleTimeString('es-VE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {dep.meetingTime && (
                            <span className="text-[11px] bg-muted px-1.5 py-0.2 rounded ml-1">
                              Cita: {dep.meetingTime}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {retDate ? (
                          <>
                            <div className="text-foreground">
                              {retDate.toLocaleDateString('es-VE', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div>
                              {retDate.toLocaleTimeString('es-VE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </>
                        ) : (
                          'Mismo día'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="text-xs font-semibold text-foreground">
                          {dep.bookedSlots} / {dep.totalCapacity}
                        </div>
                        <div className="w-20 bg-muted rounded-full h-1.5 mt-1 mx-auto overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              dep.occupancyPercent >= 90
                                ? 'bg-rose-500'
                                : dep.occupancyPercent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, dep.occupancyPercent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          {dep.availableSlots} disp. ({dep.occupancyPercent}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <DepartureStatusBadge status={dep.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canUpdateStatus && <DepartureStatusSelect id={dep.id} currentStatus={dep.status} />}
                          <Link
                            href={departureRoutes.show(dep.id)}
                            title="Ver detalle y flota"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canUpdate && (
                            <Link
                              href={departureRoutes.edit(dep.id)}
                              title="Editar salida"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Mostrando página {page} de {totalPages} ({total} resultados)
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    ...(tourId ? { tourId } : {}),
                    page: String(page - 1),
                  })}`}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    ...(tourId ? { tourId } : {}),
                    page: String(page + 1),
                  })}`}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
