'use client';

import { useState, useTransition, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  assignDepartureUnitAction,
  updateDepartureUnitAction,
  unassignDepartureUnitAction,
} from '@/app/(admin)/admin/departures/actions';
import { initialActionState } from '@/modules/shared/actions/action-state';
import type { DepartureUnitDto } from '@/modules/departure-unit/serializers/departure-unit.serializer';
import type { TransportUnitRow } from '@/modules/transport-unit/models/transport-unit.model';
import { Bus, Plus, User, Phone, AlertTriangle, Edit3, Trash2, X, Check } from 'lucide-react';

interface DepartureFleetManagerProps {
  departureId: string;
  totalCapacity: number;
  bookedSlots: number;
  departureStatus: string;
  assignedUnits: DepartureUnitDto[];
  availableTransportUnits: TransportUnitRow[];
}

export function DepartureFleetManager({
  departureId,
  totalCapacity,
  bookedSlots,
  departureStatus,
  assignedUnits,
  availableTransportUnits,
}: DepartureFleetManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for Assign Unit Form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const selectedUnit = availableTransportUnits.find((u) => u.id === selectedUnitId);

  // State for Edit Unit Modal
  const [editingUnit, setEditingUnit] = useState<DepartureUnitDto | null>(null);

  // Action states
  const assignActionWithId = assignDepartureUnitAction.bind(null, departureId);
  const [assignState, assignFormAction, isAssignPending] = useActionState(
    assignActionWithId,
    initialActionState,
  );

  const availableSlots = Math.max(0, totalCapacity - bookedSlots);
  const occupancyPercent =
    totalCapacity > 0 ? Math.round((bookedSlots / totalCapacity) * 100) : 0;
  const isLocked = departureStatus === 'completed' || departureStatus === 'cancelled';

  async function handleUnassign(unit: DepartureUnitDto) {
    const projectedCapacity = totalCapacity - unit.assignedCapacity;
    if (projectedCapacity < bookedSlots) {
      alert(
        `No se puede desvincular la unidad ${unit.unitName} porque los cupos reservados (${bookedSlots}) superarían la capacidad restante (${projectedCapacity}).`,
      );
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de desvincular la unidad "${unit.unitName}" (${unit.unitCode}) de esta salida?`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await unassignDepartureUnitAction(unit.id, departureId);
      if (res.status === 'error') {
        alert(res.message);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Fleet Capacity KPI Bar */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Flota de Transporte Asignada y Aforo
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              El aforo total de la salida se calcula de forma automática sumando la capacidad de las unidades asignadas.
            </p>
          </div>

          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAssignForm(!showAssignForm)}
              disabled={availableTransportUnits.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Asignar Unidad
            </button>
          )}
        </div>

        {/* Capacity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
          <div className="bg-muted/40 rounded-lg p-3">
            <span className="text-xs text-muted-foreground block">Aforo Total</span>
            <span className="text-xl font-bold text-foreground">{totalCapacity}</span>
            <span className="text-xs text-muted-foreground ml-1">asientos</span>
          </div>

          <div className="bg-muted/40 rounded-lg p-3">
            <span className="text-xs text-muted-foreground block">Cupos Reservados</span>
            <span className="text-xl font-bold text-foreground">{bookedSlots}</span>
            <span className="text-xs text-muted-foreground ml-1">pasajeros</span>
          </div>

          <div className="bg-muted/40 rounded-lg p-3">
            <span className="text-xs text-muted-foreground block">Cupos Disponibles</span>
            <span
              className={`text-xl font-bold ${
                availableSlots > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {availableSlots}
            </span>
            <span className="text-xs text-muted-foreground ml-1">libres</span>
          </div>

          <div className="bg-muted/40 rounded-lg p-3">
            <span className="text-xs text-muted-foreground block">Ocupación</span>
            <span className="text-xl font-bold text-foreground">{occupancyPercent}%</span>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  occupancyPercent >= 90
                    ? 'bg-rose-500'
                    : occupancyPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, occupancyPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assign Unit Form (Accordion/Collapsible) */}
      {showAssignForm && !isLocked && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Asignar Nueva Unidad de Transporte a esta Salida
            </h4>
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {assignState.message && (
            <div
              className={`p-3 rounded-lg text-xs border ${
                assignState.status === 'error'
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
              }`}
            >
              {assignState.message}
            </div>
          )}

          <form action={assignFormAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="transportUnitId"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Unidad de Transporte *
                </label>
                <select
                  id="transportUnitId"
                  name="transportUnitId"
                  required
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>
                    Seleccione un vehículo activo...
                  </option>
                  {availableTransportUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code}) — {u.type} — {u.capacity} puestos {u.plateNumber ? `[${u.plateNumber}]` : ''}
                    </option>
                  ))}
                </select>
                {assignState.fieldErrors?.transportUnitId && (
                  <p className="text-xs text-destructive mt-1">
                    {assignState.fieldErrors.transportUnitId[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="assignedCapacity"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Capacidad Asignada a esta Salida *
                </label>
                <input
                  type="number"
                  id="assignedCapacity"
                  name="assignedCapacity"
                  required
                  min="1"
                  max={selectedUnit?.capacity ?? 100}
                  defaultValue={selectedUnit?.capacity ?? 20}
                  key={selectedUnitId}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Por defecto la capacidad del vehículo ({selectedUnit?.capacity ?? '—'}). Puede asignar menos asientos si se reserva espacio para equipaje u operador.
                </p>
                {assignState.fieldErrors?.assignedCapacity && (
                  <p className="text-xs text-destructive mt-1">
                    {assignState.fieldErrors.assignedCapacity[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="driverNameOverride"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Chofer para este Viaje (Sobrescribir chofer habitual)
                </label>
                <input
                  type="text"
                  id="driverNameOverride"
                  name="driverNameOverride"
                  placeholder={selectedUnit?.driverName ? `Predeterminado: ${selectedUnit.driverName}` : 'Nombre del chofer asignado'}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="driverPhoneOverride"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Teléfono de Contacto (Sobrescribir teléfono habitual)
                </label>
                <input
                  type="text"
                  id="driverPhoneOverride"
                  name="driverPhoneOverride"
                  placeholder={selectedUnit?.driverPhone ? `Predeterminado: ${selectedUnit.driverPhone}` : 'Teléfono del chofer'}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-foreground mb-1">
                Notas sobre la unidad en esta salida
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                placeholder="Ej: Incluye kit de primeros auxilios y radio VHF"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="px-3 py-1.5 text-xs font-medium border border-input bg-background text-foreground hover:bg-muted rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isAssignPending || !selectedUnitId}
                className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
              >
                {isAssignPending ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assigned Units List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Unidades en Servicio ({assignedUnits.length})
          </h3>
          {assignedUnits.length === 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              No hay flota asignada. El aforo actual es 0.
            </span>
          )}
        </div>

        {assignedUnits.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Esta salida no tiene unidades de transporte vinculadas todavía.
            {!isLocked && availableTransportUnits.length > 0 && (
              <p className="mt-2 text-xs">
                Haga clic en <strong>Asignar Unidad</strong> para conectar un vehículo y sumar asientos al aforo.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Unidad / Tipo</th>
                  <th className="py-3 px-4 font-semibold">Placa</th>
                  <th className="py-3 px-4 font-semibold text-center">Capacidad Asignada</th>
                  <th className="py-3 px-4 font-semibold">Chofer de Viaje</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Notas</th>
                  {!isLocked && <th className="py-3 px-4 font-semibold text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignedUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{unit.unitName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {unit.unitCode} • {unit.unitType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {unit.unitPlateNumber ? (
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                          {unit.unitPlateNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-foreground text-sm">{unit.assignedCapacity}</span>
                      <span className="text-muted-foreground text-[11px] ml-1">
                        / {unit.unitTotalCapacity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{unit.effectiveDriver}</span>
                      </div>
                      {unit.driverNameOverride && (
                        <span className="text-[10px] text-primary block mt-0.5 font-medium">
                          (Sobrescrito)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{unit.effectivePhone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate">
                      {unit.notes || '—'}
                    </td>
                    {!isLocked && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingUnit(unit)}
                            title="Editar capacidad o chofer"
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnassign(unit)}
                            disabled={isPending}
                            title="Desvincular unidad"
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Assigned Unit Modal */}
      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          departureId={departureId}
          totalCapacity={totalCapacity}
          bookedSlots={bookedSlots}
          onClose={() => setEditingUnit(null)}
          onSuccess={() => {
            setEditingUnit(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

interface EditUnitModalProps {
  unit: DepartureUnitDto;
  departureId: string;
  totalCapacity: number;
  bookedSlots: number;
  onClose: () => void;
  onSuccess: () => void;
}

function EditUnitModal({
  unit,
  departureId,
  totalCapacity,
  bookedSlots,
  onClose,
  onSuccess,
}: EditUnitModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [capacity, setCapacity] = useState(unit.assignedCapacity);
  const [driverOverride, setDriverOverride] = useState(unit.driverNameOverride ?? '');
  const [phoneOverride, setPhoneOverride] = useState(unit.driverPhoneOverride ?? '');
  const [notes, setNotes] = useState(unit.notes ?? '');

  const projectedTotal = totalCapacity - unit.assignedCapacity + capacity;
  const isInvalidCapacity = projectedTotal < bookedSlots;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isInvalidCapacity) {
      setError(
        `La nueva capacidad total (${projectedTotal}) no puede ser menor a los cupos reservados (${bookedSlots}).`,
      );
      return;
    }

    const formData = new FormData();
    formData.append('assignedCapacity', String(capacity));
    formData.append('driverNameOverride', driverOverride);
    formData.append('driverPhoneOverride', phoneOverride);
    formData.append('notes', notes);

    startTransition(async () => {
      const res = await updateDepartureUnitAction(unit.id, departureId, initialActionState, formData);
      if (res.status === 'error') {
        setError(res.message || 'Error al actualizar la asignación.');
      } else {
        onSuccess();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Editar Asignación: {unit.unitName} ({unit.unitCode})
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-xs border bg-destructive/10 border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">
              Capacidad Asignada * (Máx vehículo: {unit.unitTotalCapacity})
            </label>
            <input
              type="number"
              min="1"
              max={unit.unitTotalCapacity}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {isInvalidCapacity && (
              <p className="text-xs text-destructive mt-1 font-medium">
                ⚠️ Reduciría la capacidad a {projectedTotal}, por debajo de los {bookedSlots} cupos reservados.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Chofer para este Viaje
            </label>
            <input
              type="text"
              placeholder={unit.unitDefaultDriver ? `Predeterminado: ${unit.unitDefaultDriver}` : 'Nombre'}
              value={driverOverride}
              onChange={(e) => setDriverOverride(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              placeholder={unit.unitDefaultPhone ? `Predeterminado: ${unit.unitDefaultPhone}` : 'Teléfono'}
              value={phoneOverride}
              onChange={(e) => setPhoneOverride(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Notas</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium border border-input bg-background text-foreground hover:bg-muted rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isInvalidCapacity}
              className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
            >
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
