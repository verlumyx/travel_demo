import { and, asc, count, desc, eq, gte, inArray, ne, sum } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { bookings } from '@/modules/booking/models/booking.model';
import { payments } from '@/modules/payment/models/payment.model';
import { departures } from '@/modules/departure/models/departure.model';
import { tours } from '@/modules/tour/models/tour.model';
import { customers } from '@/modules/customer/models/customer.model';
import type {
  DashboardMetricsDto,
  DashboardRepository,
} from './dashboard.repository';

export class DrizzleDashboardRepository implements DashboardRepository {
  constructor(private readonly db: DbExecutor) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      monthBookingsResult,
      verifiedPaymentsResult,
      pendingPaymentsResult,
      activeDeparturesResult,
      rawPriorityPayments,
      rawUpcomingDepartures,
      rawPendingBalanceBookings,
    ] = await Promise.all([
      // 1. Total ventas del mes en curso (reservas no canceladas)
      this.db
        .select({
          totalAmount: sum(bookings.totalAmount),
          count: count(),
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startOfMonth),
            ne(bookings.status, 'cancelled'),
          ),
        ),

      // 2. Ingresos conciliados (verified)
      this.db
        .select({
          totalAmount: sum(payments.amount),
          count: count(),
        })
        .from(payments)
        .where(eq(payments.status, 'verified')),

      // 3. Ingresos pendientes por auditar (pending)
      this.db
        .select({
          totalAmount: sum(payments.amount),
          count: count(),
        })
        .from(payments)
        .where(eq(payments.status, 'pending')),

      // 4. Ocupación global de flota en salidas activas
      this.db
        .select({
          totalCapacity: sum(departures.totalCapacity),
          totalBooked: sum(departures.bookedSlots),
          count: count(),
        })
        .from(departures)
        .where(inArray(departures.status, ['scheduled', 'confirmed'])),

      // 5. Lista prioritaria 1: Pagos pendientes de verificación (últimos 5)
      this.db
        .select({
          payment: payments,
          booking: bookings,
          customer: customers,
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .innerJoin(customers, eq(bookings.customerId, customers.id))
        .where(eq(payments.status, 'pending'))
        .orderBy(desc(payments.createdAt))
        .limit(5),

      // 6. Lista prioritaria 2: Próximas salidas programadas (próximas 5)
      this.db
        .select({
          departure: departures,
          tour: tours,
        })
        .from(departures)
        .innerJoin(tours, eq(departures.tourId, tours.id))
        .where(inArray(departures.status, ['scheduled', 'confirmed']))
        .orderBy(asc(departures.departureDate))
        .limit(5),

      // 7. Lista prioritaria 3: Reservas activas con saldo pendiente (últimas 5)
      this.db
        .select({
          booking: bookings,
          customer: customers,
          departure: departures,
        })
        .from(bookings)
        .innerJoin(customers, eq(bookings.customerId, customers.id))
        .innerJoin(departures, eq(bookings.departureId, departures.id))
        .where(
          and(
            inArray(bookings.status, ['pending', 'partial_payment']),
            ne(bookings.status, 'cancelled'),
          ),
        ),
    ]);

    const monthSales = Number(monthBookingsResult[0]?.totalAmount || 0);
    const monthBookingsCount = Number(monthBookingsResult[0]?.count || 0);

    const verifiedAmount = Number(verifiedPaymentsResult[0]?.totalAmount || 0);
    const pendingAmount = Number(pendingPaymentsResult[0]?.totalAmount || 0);
    const pendingPaymentsCount = Number(pendingPaymentsResult[0]?.count || 0);

    const totalCapacity = Number(activeDeparturesResult[0]?.totalCapacity || 0);
    const totalBooked = Number(activeDeparturesResult[0]?.totalBooked || 0);
    const activeDeparturesCount = Number(activeDeparturesResult[0]?.count || 0);
    const globalOccupationRate =
      totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    return {
      monthSales,
      monthBookingsCount,
      verifiedAmount,
      pendingAmount,
      pendingPaymentsCount,
      totalCapacity,
      totalBooked,
      activeDeparturesCount,
      globalOccupationRate,
      priorityPendingPayments: rawPriorityPayments.map((r) => ({
        payment: {
          id: r.payment.id,
          code: r.payment.code,
          amount: r.payment.amount,
          currency: r.payment.currency,
          method: r.payment.method,
          reference: r.payment.reference,
          createdAt: r.payment.createdAt,
        },
        booking: {
          id: r.booking.id,
          code: r.booking.code,
        },
        customer: {
          fullName: `${r.customer.firstName} ${r.customer.lastName}`.trim(),
        },
      })),
      upcomingDepartures: rawUpcomingDepartures.map((r) => ({
        departure: {
          id: r.departure.id,
          code: r.departure.code,
          departureDate: r.departure.departureDate,
          bookedSlots: r.departure.bookedSlots,
          totalCapacity: r.departure.totalCapacity,
        },
        tour: {
          id: r.tour.id,
          name: r.tour.name,
        },
      })),
      pendingBalanceBookings: rawPendingBalanceBookings.map((r) => ({
        booking: {
          id: r.booking.id,
          code: r.booking.code,
          totalAmount: r.booking.totalAmount,
          paidAmount: r.booking.paidAmount,
          slotsReserved: r.booking.slotsReserved,
        },
        customer: {
          fullName: `${r.customer.firstName} ${r.customer.lastName}`.trim(),
        },
        departure: {
          id: r.departure.id,
          code: r.departure.code,
          departureDate: r.departure.departureDate,
        },
      })),
    };
  }
}
