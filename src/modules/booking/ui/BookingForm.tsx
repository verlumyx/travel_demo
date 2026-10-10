'use client';

import { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { createBookingAction } from '@/app/(admin)/admin/bookings/actions';
import { bookingRoutes } from '../routes';
import { uuidv7 } from '@/modules/shared/uuid';
import { Users, CalendarDays, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { NumberInput } from '@/components/ui/number-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface DepartureOption {
  id: string;
  code: string;
  departureDate: string;
  totalCapacity: number;
  bookedSlots: number;
  availableSlots: number;
  unitPrice: string;
  tourName: string;
  tourCode: string;
}

interface CustomerOption {
  id: string;
  code: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
}

interface BookingFormProps {
  departures: DepartureOption[];
  customers: CustomerOption[];
  preselectedDepartureId?: string;
  preselectedCustomerId?: string;
}

interface PassengerInput {
  firstName: string;
  lastName: string;
  documentType: 'cedula' | 'passport' | 'other';
  documentNumber: string;
  phone: string;
  isMainContact: boolean;
  notes: string;
}

export function BookingForm({
  departures,
  customers,
  preselectedDepartureId,
  preselectedCustomerId,
}: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    initialActionState,
  );

  const [selectedDepartureId, setSelectedDepartureId] = useState(
    preselectedDepartureId ?? (departures[0]?.id || ''),
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomerId ?? (customers[0]?.id || ''),
  );

  const selectedDeparture = departures.find((d) => d.id === selectedDepartureId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const maxSlots = selectedDeparture?.availableSlots ?? 10;
  const [slotsCount, setSlotsCount] = useState(1);

  // Dynamic passengers state
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    {
      firstName: '',
      lastName: '',
      documentType: 'cedula',
      documentNumber: '',
      phone: '',
      isMainContact: true,
      notes: '',
    },
  ]);

  // Total amount state
  const unitPriceNum = Number(selectedDeparture?.unitPrice ?? 0);
  const [totalAmount, setTotalAmount] = useState<string>(
    String((unitPriceNum * slotsCount).toFixed(2)),
  );

  // Synchronize passenger count with slotsCount
  useEffect(() => {
    setPassengers((prev) => {
      const currentCount = prev.length;
      if (currentCount === slotsCount) return prev;

      if (slotsCount > currentCount) {
        const added: PassengerInput[] = Array.from(
          { length: slotsCount - currentCount },
          () => ({
            firstName: '',
            lastName: '',
            documentType: 'cedula',
            documentNumber: '',
            phone: '',
            isMainContact: false,
            notes: '',
          }),
        );
        return [...prev, ...added];
      } else {
        return prev.slice(0, slotsCount);
      }
    });

    setTotalAmount((unitPriceNum * slotsCount).toFixed(2));
  }, [slotsCount, unitPriceNum]);

  // Helper to copy main customer details to Passenger 1
  function copyCustomerToPassenger1() {
    if (!selectedCustomer) return;
    setPassengers((prev) => {
      const next = [...prev];
      next[0] = {
        ...next[0],
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        documentType: (selectedCustomer.documentType as any) || 'cedula',
        documentNumber: selectedCustomer.documentNumber || '',
        phone: selectedCustomer.phone || '',
        isMainContact: true,
      };
      return next;
    });
  }

  function updatePassenger(index: number, field: keyof PassengerInput, val: any) {
    setPassengers((prev) => {
      const next = [...prev];
      if (field === 'isMainContact' && val === true) {
        // unset for others
        next.forEach((p, idx) => {
          p.isMainContact = idx === index;
        });
      } else {
        next[index] = { ...next[index], [field]: val };
      }
      return next;
    });
  }

  const generatedId = uuidv7();

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      <input type="hidden" name="id" value={generatedId} />
      <input
        type="hidden"
        name="passengersJson"
        value={JSON.stringify(passengers)}
      />

      {state.message && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            state.status === 'error'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Section 1: Customer & Departure Selection */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Selección de Salida y Cliente Titular
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="customerId" className="block text-sm font-medium text-foreground">
                Cliente Titular *
              </label>
              <Link
                href="/admin/customers/create"
                target="_blank"
                className="text-xs text-primary hover:underline"
              >
                + Crear nuevo cliente
              </Link>
            </div>
            <Select2
              id="customerId"
              name="customerId"
              required
              value={selectedCustomerId}
              onValueChange={(val) => setSelectedCustomerId(val)}
              placeholder="Seleccione un cliente..."
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.fullName} (${c.code}) ${c.phone ? `- ${c.phone}` : ''}`,
              }))}
              size="sm"
            />
            {state.fieldErrors?.customerId && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.customerId[0]}
              </p>
            )}
          </div>

          {/* Departure Selection */}
          <div>
            <label htmlFor="departureId" className="block text-sm font-medium text-foreground mb-1.5">
              Salida Programada *
            </label>
            <Select2
              id="departureId"
              name="departureId"
              required
              value={selectedDepartureId}
              onValueChange={(val) => setSelectedDepartureId(val)}
              placeholder="Seleccione una fecha de salida..."
              options={departures.map((d) => ({
                value: d.id,
                label: `${d.tourName} [${d.code}] - ${new Date(d.departureDate).toLocaleDateString('es-VE', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} ($${d.unitPrice}) - ${d.availableSlots} cupos disponibles`,
                isDisabled: d.availableSlots <= 0,
              }))}
              size="sm"
            />
            {state.fieldErrors?.departureId && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.departureId[0]}
              </p>
            )}
          </div>
        </div>

        {/* Selected Departure Summary Banner */}
        {selectedDeparture && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-semibold text-foreground text-sm block">
                {selectedDeparture.tourName} ({selectedDeparture.tourCode})
              </span>
              <span className="text-muted-foreground mt-0.5 block">
                Salida: {new Date(selectedDeparture.departureDate).toLocaleString('es-VE')} • Salida: {selectedDeparture.code}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground block">Tarifa por pasajero:</span>
                <span className="font-bold text-foreground text-sm">${selectedDeparture.unitPrice} USD</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Cupos Disponibles:</span>
                <span className={`font-bold text-sm ${selectedDeparture.availableSlots > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {selectedDeparture.availableSlots} de {selectedDeparture.totalCapacity}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quantity & Total Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label htmlFor="slotsReserved" className="block text-sm font-medium text-foreground mb-1.5">
              Cantidad de Cupos a Reservar *
            </label>
            <NumberInput
              id="slotsReserved"
              name="slotsReserved"
              min={1}
              max={maxSlots > 0 ? maxSlots : 1}
              value={slotsCount}
              onValueChange={(val) => setSlotsCount(Math.max(1, val))}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo {maxSlots} cupos disponibles para esta salida.
            </p>
            {state.fieldErrors?.slotsReserved && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.slotsReserved[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-foreground mb-1.5">
              Monto Total de la Reserva (USD) *
            </label>
            <CurrencyInput
              id="totalAmount"
              name="totalAmount"
              required
              value={parseFloat(totalAmount) || 0}
              onValueChange={(val) => setTotalAmount(val.toFixed(2))}
              min={0}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calculado automáticamente ({slotsCount} × ${selectedDeparture?.unitPrice ?? 0}). Editable si aplica descuento o ajuste.
            </p>
            {state.fieldErrors?.totalAmount && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.totalAmount[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Passengers Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pasajeros de la Reserva ({passengers.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registre a cada viajero individual para el manifiesto de abordaje y seguro de viaje.
            </p>
          </div>

          {selectedCustomer && (
            <button
              type="button"
              onClick={copyCustomerToPassenger1}
              className="text-xs text-primary font-medium hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Copiar datos de {selectedCustomer.fullName} al Pasajero 1
            </button>
          )}
        </div>

        <div className="space-y-4">
          {passengers.map((p, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border bg-muted/20 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="font-semibold text-foreground text-sm">
                  Pasajero #{index + 1}
                </span>

                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="radio"
                    name="mainContactRadio"
                    checked={p.isMainContact}
                    onChange={() => updatePassenger(index, 'isMainContact', true)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>Contacto Principal del Viaje</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={p.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    placeholder="Ej: Laura Sofía"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={p.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                    placeholder="Ej: Silva Gómez"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Tipo de Documento
                  </label>
                  <Select2
                    value={p.documentType}
                    onValueChange={(val) => updatePassenger(index, 'documentType', val)}
                    options={[
                      { value: 'cedula', label: 'Cédula' },
                      { value: 'passport', label: 'Pasaporte' },
                      { value: 'other', label: 'Otro' },
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Número de Documento
                  </label>
                  <input
                    type="text"
                    value={p.documentNumber}
                    onChange={(e) => updatePassenger(index, 'documentNumber', e.target.value)}
                    placeholder="V-21345678"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Teléfono del Pasajero
                  </label>
                  <input
                    type="tel"
                    value={p.phone}
                    onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                    placeholder="+58 412 9876543"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Notas sobre este pasajero (alergias, requerimientos dietéticos)
                </label>
                <input
                  type="text"
                  value={p.notes}
                  onChange={(e) => updatePassenger(index, 'notes', e.target.value)}
                  placeholder="Ej: Menú vegetariano, mareo en carretera"
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Booking Notes */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notas Operativas de la Reserva
        </label>
        <RichTextEditor
          id="notes"
          name="notes"
          placeholder="Instrucciones especiales para el viaje, condiciones de pago convenidas con el cliente, etc."
          minHeight="min-h-[140px]"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={bookingRoutes.list()}
          className="px-4 py-2 text-sm font-medium border border-input bg-background text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending || maxSlots <= 0}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
        >
          {isPending ? 'Emitiendo reserva...' : 'Emitir y Bloquear Cupos'}
        </button>
      </div>
    </form>
  );
}
