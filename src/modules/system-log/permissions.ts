export const SYSTEM_LOG_MODULE = {
  id: 'system-logs',
  label: 'Registros del Sistema',
  permissions: [
    { id: 'system-logs.list', label: 'Listar registros y errores' },
    { id: 'system-logs.show', label: 'Ver detalles de error' },
    { id: 'system-logs.clear', label: 'Gestionar y limpiar registros' },
  ],
} as const;
