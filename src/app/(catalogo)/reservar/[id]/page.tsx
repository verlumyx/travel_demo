import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createDepartureContainer } from '@/modules/departure/container';
import { toDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { ClientCheckoutForm } from '@/modules/booking/ui/ClientCheckoutForm';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientCheckoutPage({ params }: PageProps) {
  const { id } = await params;

  const departureContainer = createDepartureContainer();

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

  const availableSlots = departure.totalCapacity - departure.bookedSlots;
  const effectivePrice = departure.priceOverride
    ? Number(departure.priceOverride)
    : Number(tour.basePrice);

  const depDate = new Date(departure.departureDate);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href={`/tours/${tour.slug}`}
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
            Checkout Autoservicio
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Reservar Cupos — {tour.name}
          </h1>
        </div>
      </div>

      {/* Trip Recap Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="font-mono text-xs font-bold text-primary block">
              Salida: {departure.code} • Tour: {tour.code}
            </span>
            <h2 className="text-lg font-bold text-foreground mt-0.5">{tour.name}</h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground block">Tarifa por persona</span>
            <span className="text-2xl font-black font-mono text-foreground">
              ${effectivePrice.toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>
              {depDate.toLocaleDateString('es-VE', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>
              Salida:{' '}
              {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
              {departure.meetingTime ? ` (Cita: ${departure.meetingTime})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {departure.meetingPoint || 'Punto de encuentro céntrico'}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity & Availability Check */}
      {availableSlots <= 0 || departure.status === 'completed' || departure.status === 'cancelled' ? (
        <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            Salida sin cupos disponibles
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Esta salida ha alcanzado su aforo máximo o ya no se encuentra disponible para nuevas reservas.
          </p>
          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition pt-2"
          >
            Ver otras fechas disponibles
          </Link>
        </div>
      ) : (
        <ClientCheckoutForm
          departure={{
            id: departure.id,
            code: departure.code,
            departureDate: departure.departureDate,
            returnDate: departure.returnDate,
            meetingPoint: departure.meetingPoint,
            meetingTime: departure.meetingTime,
            availableSlots,
            effectivePrice,
            priceOverride: departure.priceOverride,
          }}
          tour={{
            id: tour.id,
            name: tour.name,
            code: tour.code,
            durationDays: tour.durationDays,
            currency: tour.currency,
            imageUrl: tour.imageUrl,
          }}
        />
      )}
    </div>
  );
}
