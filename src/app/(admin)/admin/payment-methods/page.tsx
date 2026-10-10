import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createPaymentMethodContainer } from '@/modules/payment-method/container';
import { SearchPaymentMethodCommand } from '@/modules/payment-method/commands/search-payment-method.command';
import { toPaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import { paymentMethodRoutes } from '@/modules/payment-method/routes';
import { PaymentMethodStatusBadge } from '@/modules/payment-method/ui/PaymentMethodStatusBadge';
import { PaymentMethodStatusToggle } from '@/modules/payment-method/ui/PaymentMethodStatusToggle';
import { WalletCards, Plus, Search, Eye, Edit3, Coins } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; currency?: string; page?: string }>;
}

export default async function PaymentMethodsListPage({ searchParams }: PageProps) {
  await guardPage('payment-methods.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = params.status === 'active' || params.status === 'inactive' ? params.status : undefined;
  const currency = params.currency || undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createPaymentMethodContainer();
  const command = new SearchPaymentMethodCommand({ q, status, currency }, limit, offset);
  const { data: rows, total } = await container.searchService.execute(command);
  const paymentMethods = rows.map(toPaymentMethodDto);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <WalletCards className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Métodos de Pago</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configura los métodos de cobro y datos bancarios que visualizarán los clientes al reservar ({total} configurados).
          </p>
        </div>

        <Link
          href={paymentMethodRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Método de Pago
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, código o datos..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/admin/payment-methods"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !status ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todos
          </Link>
          <Link
            href="/admin/payment-methods?status=active"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'active' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Activos
          </Link>
          <Link
            href="/admin/payment-methods?status=inactive"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'inactive' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Inactivos
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 bg-slate-50/70">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Moneda</th>
                <th className="py-3.5 px-4">Datos / Instrucciones</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paymentMethods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No se encontraron métodos de pago configurados.
                  </td>
                </tr>
              ) : (
                paymentMethods.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700 text-xs">
                      {pm.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={paymentMethodRoutes.show(pm.id)} className="hover:text-teal-600 transition">
                        {pm.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        <Coins className="h-3 w-3 text-slate-400" />
                        {pm.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-xs text-slate-600 font-mono truncate">
                      {pm.instructions}
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentMethodStatusBadge status={pm.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PaymentMethodStatusToggle id={pm.id} currentStatus={pm.status} />
                        <Link
                          href={paymentMethodRoutes.show(pm.id)}
                          title="Ver detalle"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={paymentMethodRoutes.edit(pm.id)}
                          title="Editar"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Página {page} de {totalPages}</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/payment-methods?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-2xs"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/payment-methods?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-2xs"
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
