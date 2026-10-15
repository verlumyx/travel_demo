import { guardPage } from '@/modules/shared/auth/require-permission';
import { createSystemLogContainer } from '@/modules/system-log/container';
import { toSystemLogDto } from '@/modules/system-log/serializers/system-log.serializer';
import { SystemLogList } from '@/modules/system-log/ui/SystemLogList';
import { FileText, ShieldAlert } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    level?: string;
    source?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function SystemLogsPage({ searchParams }: PageProps) {
  await guardPage('system-logs.list');

  const resolvedParams = await searchParams;
  const level = resolvedParams.level as 'error' | 'warn' | 'info' | undefined;
  const source = resolvedParams.source;
  const status = resolvedParams.status as 'unread' | 'investigating' | 'resolved' | undefined;
  const search = resolvedParams.search;

  const container = createSystemLogContainer();
  const { items, total } = await container.searchService.execute({
    level,
    source,
    status,
    search,
    limit: 100,
  });

  const logs = items.map(toSystemLogDto);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Registro de Errores e Incidencias
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Auditoría en tiempo real de excepciones del servidor, fallas de checkout, almacenamiento e intentos de pago.
          </p>
        </div>
      </div>

      <SystemLogList
        logs={logs}
        total={total}
        initialFilters={{
          level,
          source,
          status,
          search,
        }}
      />
    </div>
  );
}
