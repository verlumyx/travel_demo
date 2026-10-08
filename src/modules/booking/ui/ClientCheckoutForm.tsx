'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { clientCheckoutAction } from '@/app/(catalogo)/reservar/actions';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Building,
  Smartphone,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface ClientCheckoutFormProps {
  departure: {
    id: string;
    code: string;
    departureDate: string;
    returnDate?: string | null;
    meetingPoint?: string | null;
    meetingTime?: string | null;
    availableSlots: number;
    effectivePrice: number;
    priceOverride?: string | null;
  };
  tour: {
    id: string;
    name: string;
    code: string;
    durationDays: number;
    currency: string;
    imageUrl?: string | null;
  };
}

export function ClientCheckoutForm({ departure, tour }: ClientCheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(clientCheckoutAction, {
    status: 'idle',
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [slotsCount, setSlotsCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('pago_movil');

  // Accompanying passengers (if slotsCount > 1)
  const [companions, setCompanions] = useState<
    Array<{ firstName: string; lastName: string; documentType: string; documentNumber: string; phone: string }>
  >([]);

  const handleSlotsChange = (newCount: number) => {
    setSlotsCount(newCount);
    const needed = Math.max(0, newCount - 1);
    setCompanions((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({
          firstName: '',
          lastName: '',
          documentType: 'cedula',
          documentNumber: '',
          phone: '',
        });
      }
      return next.slice(0, needed);
    });
  };

  const updateCompanion = (index: number, field: string, val: string) => {
    setCompanions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const totalPrice = (slotsCount * departure.effectivePrice).toFixed(2);
  const depDate = new Date(departure.departureDate);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="departureId" value={departure.id} />
      <input type="hidden" name="slotsCount" value={slotsCount} />
      <input type="hidden" name="passengersJson" value={JSON.stringify(companions)} />

      {state.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
            state.status === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}
        >
          {state.status === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      {/* Progress Wizard Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition ${
            step === 1 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">1</span>
          Cupos y Tarifa
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition ${
            step === 2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">2</span>
          Datos de Pasajeros
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition ${
            step === 3 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">3</span>
          Pago y Comprobante
        </button>
      </div>

      {/* STEP 1: Slots Selection & Summary */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              ¿Cuántos cupos deseas reservar?
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cupos disponibles en esta salida: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{departure.availableSlots} cupos</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="slotsSelect" className="text-xs font-medium text-foreground">
              Número de Viajeros:
            </label>
            <select
              id="slotsSelect"
              value={slotsCount}
              onChange={(e) => handleSlotsChange(parseInt(e.target.value, 10))}
              className="px-4 py-2 text-sm font-bold rounded-xl border border-input bg-background font-mono focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: Math.min(departure.availableSlots, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'viajero' : 'viajeros'}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Breakdown Box */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tarifa por persona:</span>
              <span className="font-semibold text-foreground font-mono">
                ${departure.effectivePrice.toFixed(2)} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad de personas:</span>
              <span className="font-semibold text-foreground font-mono">x {slotsCount}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-baseline">
              <span className="text-sm font-bold text-foreground">Total a Pagar:</span>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ${totalPrice}
                </span>
                <span className="text-[11px] text-muted-foreground ml-1">USD</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
            >
              Continuar a Datos de Pasajeros
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Passenger Details */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Datos del Pasajero Titular (Contratante)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esta persona recibirá la confirmación, el voucher digital y el comprobante del viaje.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="holderFirstName" className="font-medium text-foreground">
                Nombres *
              </label>
              <input
                id="holderFirstName"
                name="holderFirstName"
                type="text"
                placeholder="Ej: María Alejandra"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.holderFirstName && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.holderFirstName[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderLastName" className="font-medium text-foreground">
                Apellidos *
              </label>
              <input
                id="holderLastName"
                name="holderLastName"
                type="text"
                placeholder="Ej: Pérez Rodríguez"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.holderLastName && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.holderLastName[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderEmail" className="font-medium text-foreground">
                Correo Electrónico *
              </label>
              <input
                id="holderEmail"
                name="holderEmail"
                type="email"
                placeholder="tu@correo.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.holderEmail && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.holderEmail[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderPhone" className="font-medium text-foreground">
                Teléfono / WhatsApp *
              </label>
              <input
                id="holderPhone"
                name="holderPhone"
                type="tel"
                placeholder="Ej: +58 412 1234567"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.holderPhone && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.holderPhone[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderDocumentType" className="font-medium text-foreground">
                Tipo de Documento *
              </label>
              <select
                id="holderDocumentType"
                name="holderDocumentType"
                defaultValue="cedula"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              >
                <option value="cedula">Cédula de Identidad (V / E)</option>
                <option value="passport">Pasaporte</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderDocumentNumber" className="font-medium text-foreground">
                Número de Documento *
              </label>
              <input
                id="holderDocumentNumber"
                name="holderDocumentNumber"
                type="text"
                placeholder="Ej: 18492019"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background font-mono focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.holderDocumentNumber && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.holderDocumentNumber[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emergencyContact" className="font-medium text-foreground">
                Contacto de Emergencia (Nombre)
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="text"
                placeholder="Ej: Carlos Pérez (Hermano)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emergencyPhone" className="font-medium text-foreground">
                Teléfono de Emergencia
              </label>
              <input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                placeholder="Ej: 0414 9876543"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Accompanying Passengers if slotsCount > 1 */}
          {companions.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Acompañantes Adicionales ({companions.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ingrese los datos para el manifiesto oficial de abordaje de cada pasajero adicional.
                </p>
              </div>

              <div className="space-y-4">
                {companions.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4 text-xs"
                  >
                    <div className="font-bold text-foreground">
                      Pasajero #{idx + 2} (Acompañante)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Nombres *</label>
                        <input
                          type="text"
                          value={comp.firstName}
                          onChange={(e) => updateCompanion(idx, 'firstName', e.target.value)}
                          placeholder="Nombres"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Apellidos *</label>
                        <input
                          type="text"
                          value={comp.lastName}
                          onChange={(e) => updateCompanion(idx, 'lastName', e.target.value)}
                          placeholder="Apellidos"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Cédula / Pasaporte</label>
                        <input
                          type="text"
                          value={comp.documentNumber}
                          onChange={(e) => updateCompanion(idx, 'documentNumber', e.target.value)}
                          placeholder="V-00000000"
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Teléfono (opcional)</label>
                        <input
                          type="tel"
                          value={comp.phone}
                          onChange={(e) => updateCompanion(idx, 'phone', e.target.value)}
                          placeholder="Teléfono móvil"
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
            >
              Continuar al Pago
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Reporting & Bank Coordinates */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Datos de Pago y Coordenadas Bancarias
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monto a transferir: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">${totalPrice} USD</strong> (o su equivalente según tasa oficial del día).
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label htmlFor="paymentMethod" className="text-xs font-medium text-foreground">
              Selecciona tu Método de Pago *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-ring font-medium"
            >
              <option value="pago_movil">Pago Móvil (Bolívares - VES)</option>
              <option value="zelle">Zelle (USD)</option>
              <option value="binance">Binance Pay (USDT)</option>
              <option value="zinli">Zinli (USD)</option>
              <option value="bank_transfer">Transferencia Bancaria Nacional (VES)</option>
              <option value="cash_usd">Efectivo USD (Entrega directa previa)</option>
            </select>
          </div>

          {/* Bank Coordinates Display Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-xs space-y-2">
            <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              Coordenadas de la Agencia para {paymentMethod.replace('_', ' ').toUpperCase()}:
            </span>

            {paymentMethod === 'pago_movil' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                <div>Banco: <strong>Banesco (0134)</strong></div>
                <div>Teléfono: <strong>0414-1234567</strong></div>
                <div>RIF / C.I.: <strong>J-50000000-0</strong> (TravelDemo C.A.)</div>
              </div>
            )}

            {paymentMethod === 'zelle' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                <div>Email Zelle: <strong>pagos@traveldemo.com</strong></div>
                <div>Titular: <strong>Travel Agency LLC</strong></div>
                <div>Memo: Tu nombre y código de tour</div>
              </div>
            )}

            {paymentMethod === 'binance' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                <div>Binance Pay ID: <strong>84920194</strong></div>
                <div>Moneda: <strong>USDT</strong></div>
                <div>Red sugerida: Binance Pay Direct o TRC-20</div>
              </div>
            )}

            {paymentMethod === 'zinli' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                <div>Correo Zinli: <strong>info@traveldemo.com</strong></div>
                <div>Nombre: <strong>TravelDemo Oficial</strong></div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                <div>Banco: <strong>Banesco Banco Universal</strong></div>
                <div>Cuenta Corriente: <strong>0134-0000-00-0000000000</strong></div>
                <div>Titular: <strong>TravelDemo C.A.</strong> / RIF: <strong>J-50000000-0</strong></div>
              </div>
            )}

            {paymentMethod === 'cash_usd' && (
              <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] pt-1">
                <div>Pago en taquilla u oficina de la agencia antes de la salida.</div>
                <div>Indica en la referencia: <strong>OFICINA</strong> o el nombre del asesor.</div>
              </div>
            )}
          </div>

          {/* Reference & Proof Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="paymentReference" className="font-medium text-foreground">
                Número de Referencia / ID de Transacción *
              </label>
              <input
                id="paymentReference"
                name="paymentReference"
                type="text"
                placeholder="Ej: 048291, Ref #9821374"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background font-mono focus:ring-2 focus:ring-ring"
              />
              {state.fieldErrors?.paymentReference && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.paymentReference[0]}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="proofImageUrl" className="font-medium text-foreground">
                Enlace / URL de la Captura del Pago (Opcional)
              </label>
              <input
                id="proofImageUrl"
                name="proofImageUrl"
                type="url"
                placeholder="https://... o enlace a tu comprobante en la nube"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="notes" className="font-medium text-foreground">
                Notas y Requerimientos Especiales (Opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Ej: Asiento en pasillo, requerimiento dietético, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Pasajeros
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando Reserva...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar y Enviar Reserva (${totalPrice} USD)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
