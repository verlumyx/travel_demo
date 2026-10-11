import {
  Smartphone,
  Banknote,
  Building,
  Coins,
  CreditCard,
} from 'lucide-react';

interface PaymentMethodBadgeProps {
  method: string;
}

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: typeof Smartphone; color: string }
> = {
  pago_movil: {
    label: 'Pago Móvil',
    icon: Smartphone,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  zelle: {
    label: 'Zelle',
    icon: Banknote,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  binance: {
    label: 'Binance Pay',
    icon: Coins,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  zinli: {
    label: 'Zinli',
    icon: CreditCard,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  bank_transfer: {
    label: 'Transferencia Bancaria',
    icon: Building,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  cash_usd: {
    label: 'Efectivo USD',
    icon: Banknote,
    color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  cash_ves: {
    label: 'Efectivo VES',
    icon: Banknote,
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
};

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  let conf = METHOD_CONFIG[method];

  if (!conf) {
    const lower = (method || '').toLowerCase();
    if (lower.includes('pago móvil') || lower.includes('pago movil') || lower.includes('mobile')) {
      conf = { label: method, icon: METHOD_CONFIG.pago_movil.icon, color: METHOD_CONFIG.pago_movil.color };
    } else if (lower.includes('zelle')) {
      conf = { label: method, icon: METHOD_CONFIG.zelle.icon, color: METHOD_CONFIG.zelle.color };
    } else if (lower.includes('binance') || lower.includes('usdt') || lower.includes('crypto')) {
      conf = { label: method, icon: METHOD_CONFIG.binance.icon, color: METHOD_CONFIG.binance.color };
    } else if (lower.includes('zinli')) {
      conf = { label: method, icon: METHOD_CONFIG.zinli.icon, color: METHOD_CONFIG.zinli.color };
    } else if (lower.includes('transferencia') || lower.includes('banco') || lower.includes('bank')) {
      conf = { label: method, icon: METHOD_CONFIG.bank_transfer.icon, color: METHOD_CONFIG.bank_transfer.color };
    } else if (lower.includes('efectivo') || lower.includes('cash')) {
      const isVes = lower.includes('ves') || lower.includes('bs');
      const base = isVes ? METHOD_CONFIG.cash_ves : METHOD_CONFIG.cash_usd;
      conf = { label: method, icon: base.icon, color: base.color };
    } else {
      conf = {
        label: method,
        icon: CreditCard,
        color: 'bg-muted text-muted-foreground border-border',
      };
    }
  }

  const Icon = conf.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${conf.color}`}
    >
      <Icon className="h-3 w-3" />
      {conf.label}
    </span>
  );
}
