export const PAYMENT_METHOD_MODULE = {
  id: 'payment-methods',
  label: 'Métodos de Pago',
  permissions: [
    { id: 'payment-methods.list', label: 'Listar métodos de pago' },
    { id: 'payment-methods.show', label: 'Ver detalle de método de pago' },
    { id: 'payment-methods.create', label: 'Crear métodos de pago' },
    { id: 'payment-methods.update', label: 'Editar métodos de pago' },
    { id: 'payment-methods.update-status', label: 'Activar o inactivar métodos de pago' },
  ],
} as const;
