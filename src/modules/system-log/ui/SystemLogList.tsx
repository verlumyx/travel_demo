'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SystemLogDto } from '../serializers/system-log.serializer';
import { updateSystemLogStatusAction, clearResolvedLogsAction } from '@/app/(admin)/admin/system-logs/actions';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  Code2,
  Clock,
  Globe,
  Activity,
  Terminal,
} from 'lucide-react';

interface SystemLogListProps {
  logs: SystemLogDto[];
  total: number;
  initialFilters: {
    level?: string;
    source?: string;
    status?: string;
    search?: string;
  };
}

export function SystemLogList({ logs, total, initialFilters }: SystemLogListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [levelFilter, setLevelFilter] = useState(initialFilters.level || 'all');
  const [sourceFilter, setSourceFilter] = useState(initialFilters.source || 'all');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');

  const applyFilters = (newLevel = levelFilter, newSource = sourceFilter, newStatus = statusFilter, newSearch = searchQuery) => {
    const params = new URLSearchParams();
    if (newLevel && newLevel !== 'all') params.set('level', newLevel);
    if (newSource && newSource !== 'all') params.set('source', newSource);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newSearch && newSearch.trim()) params.set('search', newSearch.trim());

    startTransition(() => {
      router.push(`/admin/system-logs?${params.toString()}`);
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (id: string, status: 'unread' | 'investigating' | 'resolved') => {
    startTransition(async () => {
      await updateSystemLogStatusAction(id, status);
      router.refresh();
    });
  };

  const handleClearResolved = () => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente los registros resueltos?')) return;
    startTransition(async () => {
      await clearResolvedLogsAction();
      router.refresh();
    });
  };

  const errorsCount = logs.filter((l) => l.level === 'error').length;
  const unreadCount = logs.filter((l) => l.status === 'unread').length;
  const checkoutCount = logs.filter((l) => l.source === 'checkout').length;

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Registros</span>
            <span className="text-2xl font-black font-mono text-foreground">{total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Errores Críticos</span>
            <span className="text-2xl font-black font-mono text-destructive">{errorsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Sin Revisar</span>
            <span className="text-2xl font-black font-mono text-amber-500">{unreadCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Fallas en Checkout</span>
            <span className="text-2xl font-black font-mono text-rose-500">{checkoutCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por mensaje, ruta o acción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters(levelFilter, sourceFilter, statusFilter, searchQuery)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              applyFilters(e.target.value, sourceFilter, statusFilter, searchQuery);
            }}
            aria-label="Filtrar por nivel de error"
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
          >
            <option value="all">Nivel: Todos</option>
            <option value="error">Error</option>
            <option value="warn">Advertencia</option>
            <option value="info">Información</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              applyFilters(levelFilter, e.target.value, statusFilter, searchQuery);
            }}
            aria-label="Filtrar por origen"
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
          >
            <option value="all">Origen: Todos</option>
            <option value="checkout">Checkout</option>
            <option value="storage">Almacenamiento</option>
            <option value="payment">Pagos</option>
            <option value="booking">Reservas</option>
            <option value="departure">Salidas</option>
            <option value="auth">Autenticación</option>
            <option value="system">Sistema</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters(levelFilter, sourceFilter, e.target.value, searchQuery);
            }}
            aria-label="Filtrar por estado"
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
          >
            <option value="all">Estado: Todos</option>
            <option value="unread">Sin revisar</option>
            <option value="investigating">En revisión</option>
            <option value="resolved">Resueltos</option>
          </select>

          <button
            onClick={() => applyFilters(levelFilter, sourceFilter, statusFilter, searchQuery)}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtrar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            disabled={isPending}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Recargar registros"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearResolved}
            disabled={isPending}
            className="px-3 py-2 rounded-xl border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar resueltos
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        {logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No se encontraron registros de error</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              El sistema se encuentra operando sin incidencias reportadas bajo los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const dateObj = new Date(log.createdAt);

              return (
                <div key={log.id} className="transition hover:bg-muted/30">
                  {/* Row Summary */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        className="mt-0.5 text-muted-foreground hover:text-foreground transition"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="mt-0.5">
                        {log.level === 'error' && (
                          <span className="w-6 h-6 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {log.level === 'warn' && (
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {log.level === 'info' && (
                          <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground truncate max-w-md">
                            {log.message}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                            {log.source}
                          </span>
                          {log.errorName && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              {log.errorName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          {log.path && (
                            <span className="flex items-center gap-1 font-mono">
                              <Globe className="w-3 h-3" />
                              {log.path}
                            </span>
                          )}
                          {log.action && (
                            <span className="flex items-center gap-1 font-mono">
                              <Code2 className="w-3 h-3" />
                              {log.action}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateObj.toLocaleDateString('es-VE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          log.status === 'unread'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : log.status === 'investigating'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {log.status === 'unread'
                          ? 'Sin revisar'
                          : log.status === 'investigating'
                          ? 'En revisión'
                          : 'Resuelto'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-muted/20 border-t border-border space-y-4">
                      {/* Control buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">Cambiar estado:</span>
                          <button
                            onClick={() => handleStatusChange(log.id, 'unread')}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-border hover:bg-muted font-medium transition cursor-pointer"
                          >
                            Sin revisar
                          </button>
                          <button
                            onClick={() => handleStatusChange(log.id, 'investigating')}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-medium transition cursor-pointer"
                          >
                            En revisión
                          </button>
                          <button
                            onClick={() => handleStatusChange(log.id, 'resolved')}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-medium transition cursor-pointer"
                          >
                            Marcar Resuelto
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground">ID: {log.id}</span>
                      </div>

                      {/* Request Context JSON */}
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-primary" />
                              Contexto de la Solicitud / Parámetros
                            </span>
                            <button
                              onClick={() => handleCopy(`ctx-${log.id}`, JSON.stringify(log.context, null, 2))}
                              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === `ctx-${log.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copiar JSON
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Stack Trace */}
                      {log.stack && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-destructive" />
                              Rastreo de Pila (Stack Trace)
                            </span>
                            <button
                              onClick={() => handleCopy(`stack-${log.id}`, log.stack!)}
                              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === `stack-${log.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copiar Stack
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-slate-950 text-rose-300 text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed whitespace-pre-wrap">
                            {log.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
