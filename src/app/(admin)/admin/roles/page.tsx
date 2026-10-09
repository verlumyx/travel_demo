import { guardPage } from '@/modules/shared/auth/require-permission';
import { createRoleContainer } from '@/modules/role/container';
import { toRoleDto } from '@/modules/role/serializers/role.serializer';
import { Shield, CheckCircle2, Lock, Key } from 'lucide-react';

export const instant = false;

export default async function RolesListPage() {
  await guardPage('roles.list');

  const container = createRoleContainer();
  const rawRoles = await container.repository.getAll();
  const roles = rawRoles.map(toRoleDto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Roles y Permisos</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Matriz de control de acceso basada en roles (RBAC) del sistema ({roles.length} roles configurados).
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r) => {
          const perms = (r.permissions as string[]) || [];
          const isAll = r.permissionType === 'all';

          return (
            <div
              key={r.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isAll
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {isAll ? 'Acceso Total' : 'Permisos Granulares'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{r.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {r.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">Capacidades asignadas:</span>
                    <span className="font-mono font-bold text-white">
                      {isAll ? 'Todas las acciones (Superadmin)' : `${perms.length} permisos`}
                    </span>
                  </div>

                  {!isAll && perms.length > 0 && (
                    <div className="mt-3 max-h-36 overflow-y-auto space-y-1 pr-1">
                      {perms.map((p) => (
                        <div
                          key={p}
                          className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80 truncate"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Estado Activo
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Lock className="h-3 w-3" /> Sistema
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
