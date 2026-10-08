'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateBookingAction } from '@/app/(admin)/admin/bookings/actions';
import { bookingRoutes } from '../routes';
import type { BookingDto } from '../serializers/booking.serializer';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface BookingEditFormProps {
  booking: BookingDto;
}

export function BookingEditForm({ booking }: BookingEditFormProps) {
  const updateActionWithId = updateBookingAction.bind(null, booking.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, {
    status: 'idle',
  });

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium ${
            state.status === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Notas Operativas de la Reserva {booking.code}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agregue o actualice requerimientos especiales, detalles de logística o información interna.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="text-xs font-medium text-foreground">
            Notas y Observaciones
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={booking.notes ?? ''}
            placeholder="Ej: El cliente requiere asiento delantero por mareo, confirmaron llegada 30 minutos antes..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-destructive">{state.fieldErrors.notes[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={bookingRoutes.show(booking.id)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
