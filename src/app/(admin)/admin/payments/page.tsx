import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createPaymentContainer } from '@/modules/payment/container';
import { SearchPaymentCommand } from '@/modules/payment/commands/search-payment.command';
import { toPaymentDto } from '@/modules/payment/serializers/payment.serializer';
import { paymentRoutes } from '@/modules/payment/routes';
import { bookingRoutes } from '@/modules/booking/routes';
import { PaymentStatusBadge } from '@/modules/payment/ui/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/modules/payment/ui/PaymentMethodBadge';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    method?: string;
    page?: string;
  }>;
}

export default async function PaymentsListPage({ searchParams }: PageProps) {
  await guardPage('payments.list');

  const { q, status, method, page = '1' } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const limit = 15;
  const offset = (currentPage - 1) * limit;

  const paymentContainer = createPaymentContainer();

  const [searchResult, metrics] = await Promise.all([
    paymentContainer.repository.search(
      SearchPaymentCommand.fromInput({
        q,
        status,
        method,
        limit,
        offset,
      }),
    ),
    paymentContainer.repository.getMetrics(),
  ]);

  const payments = searchResult.data.map(toPaymentDto);
  const totalPages = Math.ceil(searchResult.total / limit);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Conciliación de Pagos y Abonos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audite, apruebe y concilie transacciones multimoneda enlazadas a reservas de viajes.
          </p>
        </div>

        <Link
          href={paymentRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Abono
        </Link>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Recaudación Verificada</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${metrics.totalVerifiedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-muted-foreground">USD</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Total liquidado en caja y bancos</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pendientes por Revisar</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {metrics.pendingCount}
            </span>
            <span className="text-[11px] text-muted-foreground">transacciones</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Requieren conciliación manual</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pagos Aprobados</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {metrics.verifiedCount}
            </span>
            <span className="text-[11px] text-muted-foreground">aprobados</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Impactan aforo y saldo de reservas</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pagos Rechazados</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {metrics.rejectedCount}
            </span>
            <span className="text-[11px] text-muted-foreground">denegados</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Comprobantes no válidos</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <form method="get" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Buscar por código (PAG...), referencia, o receptor..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            name="status"
            defaultValue={status ?? ''}
            className="px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="verified">Verificados</option>
            <option value="rejected">Rechazados</option>
          </select>

          <select
            name="method"
            defaultValue={method ?? ''}
            className="px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los métodos</option>
            <option value="pago_movil">Pago Móvil</option>
            <option value="zelle">Zelle</option>
            <option value="binance">Binance Pay</option>
            <option value="zinli">Zinli</option>
            <option value="bank_transfer">Transferencia</option>
            <option value="cash_usd">Efectivo USD</option>
            <option value="cash_ves">Efectivo VES</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No se encontraron pagos registrados con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Reserva / Cliente</th>
                  <th className="py-3 px-4 font-semibold">Método</th>
                  <th className="py-3 px-4 font-semibold">Referencia</th>
                  <th className="py-3 px-4 font-semibold">Fecha Pago</th>
                  <th className="py-3 px-4 font-semibold">Monto</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      <Link href={paymentRoutes.show(p.id)} className="hover:underline">
                        {p.code}
                      </Link>
                    </td>

                    <td className="py-3 px-4">
                      {p.bookingCode ? (
                        <div>
                          <Link
                            href={bookingRoutes.show(p.bookingId)}
                            className="font-mono font-semibold text-foreground hover:text-primary transition flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            {p.bookingCode}
                          </Link>
                          <span className="text-[11px] text-muted-foreground block truncate max-w-[180px]">
                            {p.customerName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono">{p.bookingId.slice(0, 8)}...</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <PaymentMethodBadge method={p.method} />
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {p.reference || '-'}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('es-VE') : '-'}
                    </td>

                    <td className="py-3 px-4 font-bold text-foreground font-mono">
                      ${p.amount} {p.currency}
                    </td>

                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={paymentRoutes.show(p.id)}
                        className="text-primary hover:underline font-medium"
                      >
                        Auditar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Página {currentPage} de {totalPages} ({searchResult.total} transacciones)
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/payments?page=${currentPage - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}${method ? `&method=${method}` : ''}`}
                  className="px-3 py-1 rounded border border-border hover:bg-muted text-foreground"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/payments?page=${currentPage + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}${method ? `&method=${method}` : ''}`}
                  className="px-3 py-1 rounded border border-border hover:bg-muted text-foreground"
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
