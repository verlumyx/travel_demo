import { connection } from 'next/server';
import { requireCustomerSession } from '@/modules/customer/auth/customer-session';
import { toCustomerDto } from '@/modules/customer/serializers/customer.serializer';
import { CustomerProfileForm } from '@/modules/customer/ui/CustomerProfileForm';
import { User, ShieldCheck } from 'lucide-react';

export const instant = false;

export default async function CustomerProfilePage() {
  await connection();
  const session = await requireCustomerSession();
  const customer = toCustomerDto(session.customer);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase block">
            Área Personal de Viajero
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Mi Perfil
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Mantén tus datos personales y de emergencia actualizados para tus boletos y asistencias de viaje.
          </p>
        </div>

        <div className="px-4 py-3 rounded-xl bg-muted/60 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Código de Viajero
            </span>
            <span className="font-mono font-bold text-sm text-foreground">
              {customer.code}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <CustomerProfileForm customer={customer} />
    </div>
  );
}
