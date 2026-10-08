import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createBookingContainer } from '@/modules/booking/container';
import { SearchBookingCommand } from '@/modules/booking/commands/search-booking.command';
import { bookingRoutes } from '@/modules/booking/routes';
import { customerRoutes } from '@/modules/customer/routes';
import { departureRoutes } from '@/modules/departure/routes';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';
import { BookingStatusSelect } from '@/modules/booking/ui/BookingStatusSelect';
import { toBookingDto, type BookingDto } from '@/modules/booking/serializers/booking.serializer';
import {
  Ticket,
  Plus,
  Search,
  Eye,
  Edit3,
  DollarSign,
  CalendarDays,
  User,
  Compass,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    departureId?: string;
    customerId?: string;
    page?: string;
  }>;
}

export default async function BookingsListPage({ searchParams }: PageProps) {
  await guardPage('bookings.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = params.status || undefined;
  const departureId = params.departureId || undefined;
  const customerId = params.customerId || undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createBookingContainer();
  const searchResult = await container.searchService.execute(
    SearchBookingCommand.fromInput({
      q,
      status,
      departureId,
      customerId,
      limit,
      offset,
    }),
  );

  const { data: rawBookings, total } = searchResult;
  const bookingsList: BookingDto[] = rawBookings.map(toBookingDto);
  const totalPages = Math.ceil(total / limit);

  // Financial metrics
  const totalInvoiced = bookingsList.reduce(
    (acc: number, b: BookingDto) => (b.status !== 'cancelled' ? acc + Number(b.totalAmount) : acc),
    0,
  );
  const totalPaid = bookingsList.reduce(
    (acc: number, b: BookingDto) => (b.status !== 'cancelled' ? acc + Number(b.paidAmount) : acc),
    0,
  );
  const totalPending = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestión de Reservas
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Control de reservas manuales, bloqueo de aforo y estado de pagos ({total} registradas).
          </p>
        </div>

        <Link
          href={bookingRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Reservas</span>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
          <span className="text-xs text-muted-foreground">emitidas en el sistema</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Facturado</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">${totalInvoiced.toFixed(2)}</p>
          <span className="text-xs text-muted-foreground">en esta página</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Recaudado</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalPaid.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground">pagos verificados</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Saldo por Cobrar</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${totalPending.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground">saldo pendiente</span>
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
              placeholder="Buscar por código de reserva, notas..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            name="status"
            defaultValue={status ?? ''}
            className="rounded-lg bg-background border border-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente Pago</option>
            <option value="partial_payment">Abono Parcial</option>
            <option value="paid">Pagado Total</option>
            <option value="confirmed">Confirmada</option>
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

      {/* Bookings Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Cliente Titular</th>
                <th className="py-3 px-4 font-semibold">Salida / Tour</th>
                <th className="py-3 px-4 font-semibold text-center">Cupos</th>
                <th className="py-3 px-4 font-semibold">Total / Saldo</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookingsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Ticket className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    No se encontraron reservas con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                bookingsList.map((b: BookingDto) => {
                  const depDate = b.departureDate ? new Date(b.departureDate) : null;

                  return (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-primary">
                        <Link href={bookingRoutes.show(b.id)} className="hover:underline">
                          {b.code}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{b.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {b.customerCode} {b.customerPhone ? `• ${b.customerPhone}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{b.tourName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {depDate
                              ? depDate.toLocaleDateString('es-VE', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                          <span className="font-mono text-[11px] ml-1">[{b.departureCode}]</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-foreground text-sm">{b.slotsReserved}</span>
                        <span className="text-[11px] text-muted-foreground block">asientos</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">${b.totalAmount} USD</div>
                        <div className="text-xs text-muted-foreground">
                          Pagado: ${b.paidAmount}{' '}
                          {Number(b.pendingBalance) > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              (Resta: ${b.pendingBalance})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <BookingStatusSelect id={b.id} currentStatus={b.status} />
                          <Link
                            href={bookingRoutes.show(b.id)}
                            title="Ver detalle de la reserva"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={bookingRoutes.edit(b.id)}
                            title="Editar notas de la reserva"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
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
              Mostrando página {page} de {totalPages} ({total} reservas)
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
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
