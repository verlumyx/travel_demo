import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createBookingContainer } from '@/modules/booking/container';
import { SearchBookingCommand } from '@/modules/booking/commands/search-booking.command';
import { paymentRoutes } from '@/modules/payment/routes';
import { PaymentForm } from '@/modules/payment/ui/PaymentForm';
import { ArrowLeft, CreditCard } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function CreatePaymentPage({ searchParams }: PageProps) {
  await guardPage('payments.create');
  const { bookingId } = await searchParams;

  const bookingContainer = createBookingContainer();

  // Load recent / non-cancelled bookings for selection
  const bookingsResult = await bookingContainer.repository.search(
    SearchBookingCommand.fromInput({ limit: 100 }),
  );

  const availableBookings = bookingsResult.data
    .filter((b) => b.status !== 'cancelled')
    .map((b) => {
      const total = Number(b.totalAmount);
      const paid = Number(b.paidAmount);
      const pending = Math.max(0, total - paid).toFixed(2);
      return {
        id: b.id,
        code: b.code,
        customerName: b.customerName,
        totalAmount: String(b.totalAmount),
        paidAmount: String(b.paidAmount),
        pendingBalance: pending,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={paymentRoutes.list()}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Registrar Abono o Pago
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingrese los datos de la transacción para conciliarla con la reserva de viaje correspondiente.
          </p>
        </div>
      </div>

      <PaymentForm
        key={bookingId ?? 'new-payment'}
        bookings={availableBookings}
        initialBookingId={bookingId}
      />
    </div>
  );
}
