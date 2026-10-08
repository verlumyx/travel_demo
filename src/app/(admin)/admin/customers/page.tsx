import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCustomerContainer } from '@/modules/customer/container';
import { SearchCustomerCommand } from '@/modules/customer/commands/search-customer.command';
import { customerRoutes } from '@/modules/customer/routes';
import { CustomerStatusBadge } from '@/modules/customer/ui/CustomerStatusBadge';
import { CustomerStatusToggle } from '@/modules/customer/ui/CustomerStatusToggle';
import { toCustomerDto, type CustomerDto } from '@/modules/customer/serializers/customer.serializer';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit3,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CustomersListPage({ searchParams }: PageProps) {
  await guardPage('customers.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = (params.status === 'active' || params.status === 'inactive') ? params.status : undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createCustomerContainer();
  const searchResult = await container.searchService.execute(
    SearchCustomerCommand.fromInput({
      q,
      status,
      limit,
      offset,
    }),
  );

  const { data: rawCustomers, total } = searchResult;
  const customers: CustomerDto[] = rawCustomers.map(toCustomerDto);
  const totalPages = Math.ceil(total / limit);

  const activeCount = customers.filter((c: CustomerDto) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Directorio de Clientes (CRM)
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión integral de pasajeros, datos de contacto, documentos y expedientes ({total} registrados).
          </p>
        </div>

        <Link
          href={customerRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Clientes</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
          <span className="text-xs text-muted-foreground">registrados en CRM</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Clientes Activos</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-xs text-muted-foreground">en esta página</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Filtro de Estado</span>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mt-2 capitalize">
            {status ? (status === 'active' ? 'Solo Activos' : 'Solo Inactivos') : 'Todos los estados'}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form method="GET" className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre, documento, teléfono, email o código..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            name="status"
            defaultValue={status ?? ''}
            className="rounded-lg bg-background border border-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition cursor-pointer"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Documento</th>
                <th className="py-3 px-4 font-semibold">Contacto</th>
                <th className="py-3 px-4 font-semibold">Origen</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    No se encontraron clientes con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                customers.map((c: CustomerDto) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-primary">
                      <Link href={customerRoutes.show(c.id)} className="hover:underline">
                        {c.code}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{c.fullName}</div>
                      {c.emergencyContact && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Emergencia: {c.emergencyContact}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {c.documentNumber ? (
                        <span className="font-mono bg-muted px-2 py-0.5 rounded">
                          {c.documentType ? `${c.documentType.toUpperCase()}: ` : ''}
                          {c.documentNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs space-y-0.5">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{c.email}</span>
                        </div>
                      )}
                      {!c.phone && !c.email && <span className="text-muted-foreground">—</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium bg-muted px-2 py-0.5 rounded capitalize">
                        {c.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <CustomerStatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CustomerStatusToggle id={c.id} currentStatus={c.status} />
                        <Link
                          href={customerRoutes.show(c.id)}
                          title="Ver ficha del cliente"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={customerRoutes.edit(c.id)}
                          title="Editar cliente"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Mostrando página {page} de {totalPages} ({total} clientes)
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    page: String(page - 1),
                  })}`}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    page: String(page + 1),
                  })}`}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
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
