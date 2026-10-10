import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCustomerContainer } from '@/modules/customer/container';
import { customerRoutes } from '@/modules/customer/routes';
import { bookingRoutes } from '@/modules/booking/routes';
import { toCustomerDto } from '@/modules/customer/serializers/customer.serializer';
import { CustomerStatusBadge } from '@/modules/customer/ui/CustomerStatusBadge';
import { CustomerStatusToggle } from '@/modules/customer/ui/CustomerStatusToggle';
import { RichTextView, isEmptyHtml } from '@/components/ui/rich-text-view';
import { createBookingContainer } from '@/modules/booking/container';
import { SearchBookingCommand } from '@/modules/booking/commands/search-booking.command';
import {
  Users,
  ArrowLeft,
  Edit3,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  FileText,
  Ticket,
  Plus,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  await guardPage('customers.show');
  const { id } = await params;

  const customerContainer = createCustomerContainer();
  const bookingContainer = createBookingContainer();

  let rawCustomer;
  try {
    rawCustomer = await customerContainer.findService.findOrFail(id);
  } catch {
    notFound();
  }

  const customer = toCustomerDto(rawCustomer);

  // Fetch customer's bookings with departure and tour info via booking search service
  const bookingsResult = await bookingContainer.searchService.execute(
    SearchBookingCommand.fromInput({ customerId: id, limit: 100 }),
  );
  const customerBookings = bookingsResult.data.map((b) => ({
    booking: {
      id: b.id,
      code: b.code,
      slotsReserved: b.slotsReserved,
      totalAmount: b.totalAmount,
      paidAmount: b.paidAmount,
      status: b.status,
    },
    departureDate: b.departureDate,
    departureCode: b.departureCode,
    tourName: b.tourName,
    tourCode: b.tourCode,
  }));

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={customerRoutes.list()}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {customer.fullName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {customer.code}
              </span>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registrado el{' '}
              {new Date(customer.createdAt).toLocaleDateString('es-VE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              vía <span className="capitalize">{customer.source}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <CustomerStatusToggle id={customer.id} currentStatus={customer.status} />
          <Link
            href={customerRoutes.edit(customer.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-input bg-background hover:bg-muted text-foreground text-xs font-medium transition shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar Ficha
          </Link>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Phone className="h-4 w-4" />
            Datos de Contacto
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Teléfono / WhatsApp:</span>
              <span className="font-medium text-foreground text-sm">
                {customer.phone || 'No registrado'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Correo Electrónico:</span>
              <span className="font-medium text-foreground text-sm">
                {customer.email || 'No registrado'}
              </span>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground block">Documento de Identidad:</span>
              <span className="font-medium text-foreground">
                {customer.documentNumber ? (
                  <span className="font-mono bg-muted px-2 py-0.5 rounded">
                    {customer.documentType?.toUpperCase()}: {customer.documentNumber}
                  </span>
                ) : (
                  'No registrado'
                )}
              </span>
            </div>

            {customer.birthDate && (
              <div>
                <span className="text-muted-foreground block">Fecha de Nacimiento:</span>
                <span className="font-medium text-foreground">
                  {new Date(customer.birthDate).toLocaleDateString('es-VE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Info */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Contacto de Emergencia
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Persona de Contacto:</span>
              <span className="font-medium text-foreground text-sm">
                {customer.emergencyContact || 'No especificado'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Teléfono de Emergencia:</span>
              <span className="font-medium text-foreground text-sm">
                {customer.emergencyPhone || 'No especificado'}
              </span>
            </div>

            {!isEmptyHtml(customer.notes) && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground block text-xs font-semibold">Observaciones / Alergias:</span>
                <RichTextView
                  content={customer.notes}
                  className="text-foreground mt-0.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Activity Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Ticket className="h-4 w-4" />
              Historial de Viajes
            </div>
            <Link
              href={`/admin/bookings/create?customerId=${customer.id}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Plus className="h-3 w-3" />
              Nueva Reserva
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Total Reservas Realizadas:</span>
              <span className="text-xl font-bold text-foreground">
                {customerBookings.length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Cupos Contratados:</span>
              <span className="font-medium text-foreground">
                {customerBookings.reduce((acc, b) => acc + b.booking.slotsReserved, 0)} asientos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings History Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Reservas Asociadas ({customerBookings.length})
          </h3>
          <Link
            href={`/admin/bookings/create?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Emitir Reserva
          </Link>
        </div>

        {customerBookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Este cliente aún no tiene reservas emitidas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reserva</th>
                  <th className="py-3 px-4 font-semibold">Tour / Experiencia</th>
                  <th className="py-3 px-4 font-semibold">Fecha de Salida</th>
                  <th className="py-3 px-4 font-semibold text-center">Cupos</th>
                  <th className="py-3 px-4 font-semibold">Monto / Pagado</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerBookings.map((item) => (
                  <tr key={item.booking.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      <Link href={`/admin/bookings/${item.booking.id}`} className="hover:underline">
                        {item.booking.code}
                      </Link>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.tourName}</div>
                      <div className="text-[11px] text-muted-foreground">{item.tourCode}</div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(item.departureDate).toLocaleDateString('es-VE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-foreground">
                      {item.booking.slotsReserved}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">
                        ${item.booking.totalAmount}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Pagado: ${item.booking.paidAmount}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground capitalize">
                        {item.booking.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/bookings/${item.booking.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
