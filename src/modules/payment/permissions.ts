export const PAYMENT_MODULE = {
  id: 'payments',
  label: 'Pagos y Conciliación',
  permissions: [
    { id: 'payments.list', label: 'Listar pagos' },
    { id: 'payments.show', label: 'Ver detalle de pago' },
    { id: 'payments.create', label: 'Registrar abonos y pagos' },
    { id: 'payments.update', label: 'Editar información de pago' },
    { id: 'payments.update-status', label: 'Verificar o rechazar pagos' },
  ],
};
