import { guardPage, hasPermission } from '@/modules/shared/auth/require-permission';
import { createUserContainer } from '@/modules/user/container';
import { toUserWithRoleDto } from '@/modules/user/serializers/user.serializer';
import { UserStatusToggle } from '@/modules/user/ui/UserStatusToggle';
import { Users, Shield, Mail, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const instant = false;

export default async function UsersListPage() {
  await guardPage('users.list');

  const canUpdateStatus = await hasPermission('users.update-status');

  const container = createUserContainer();
  const rawUsers = await container.repository.getAllWithRole();
  const usersWithRoles = rawUsers.map(toUserWithRoleDto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Gestión de Usuarios</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Control de cuentas del personal administrativo y asignación de roles ({usersWithRoles.length} registrados).
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-950/50">
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Fecha de Alta</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {usersWithRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usersWithRoles.map((u) => {
                  const isAdmin = u.roleName === 'Admin';
                  const isOperator = u.roleName === 'Operador';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          {u.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            isAdmin
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isOperator
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.roleName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          {new Date(u.createdAt).toLocaleDateString('es-VE')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canUpdateStatus && (
                            <UserStatusToggle id={u.id} currentStatus={u.status} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
