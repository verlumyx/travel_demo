'use client';

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  value?: number | null;
  defaultValue?: number | string | null;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  decimals?: number;
  currencySymbol?: string;
  locale?: string;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
  allowEmpty?: boolean;
}

function clampNumber(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    return min;
  }
  if (max !== undefined && value > max) {
    return max;
  }
  return value;
}

function sanitizeNumeric(raw: string, decimals: number): string {
  let next = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '');

  if (decimals <= 0) {
    return next.replace(/\./g, '');
  }

  const [integerPart, ...rest] = next.split('.');
  next = integerPart ?? '';
  if (rest.length > 0) {
    next += '.' + rest.join('').slice(0, decimals);
  }
  return next;
}

/**
 * Input de moneda con separador de miles y símbolo (`$` por defecto).
 * Muestra el valor formateado cuando no está enfocado y permite editar el
 * número plano mientras se escribe; aplica clamp de `min`/`max` al salir.
 * Soporta modo controlado (`value`, `onValueChange`) e incontrolado (`defaultValue`, `name`).
 */
export function CurrencyInput({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max,
  decimals = 2,
  currencySymbol = '$',
  locale = 'es-PA',
  className,
  onFocus,
  onBlur,
  name,
  ref,
  allowEmpty = false,
  ...props
}: CurrencyInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<number | null | undefined>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
      const num = typeof defaultValue === 'string' ? parseFloat(defaultValue) : Number(defaultValue);
      return Number.isNaN(num) ? (allowEmpty ? null : min) : num;
    }
    return allowEmpty ? null : (min ?? 0);
  });

  const actualValue = isControlled ? value : internalValue;

  const [isFocused, setIsFocused] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const formatGrouped = React.useCallback(
    (input: number | null | undefined): string => {
      if (input === null || input === undefined || Number.isNaN(input)) {
        return '';
      }
      return input.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    [locale, decimals]
  );

  const formatPlain = (input: number | null | undefined): string => {
    if (input === null || input === undefined || Number.isNaN(input)) {
      return '';
    }
    return decimals > 0 ? String(input) : String(Math.trunc(input));
  };

  const display = isFocused ? draft : formatGrouped(actualValue);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    setDraft(formatPlain(actualValue));
    onFocus?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = sanitizeNumeric(event.target.value, decimals);
    setDraft(next);

    if (next === '') {
      const nextVal = allowEmpty ? null : (min ?? 0);
      if (!isControlled) setInternalValue(nextVal);
      onValueChange?.(nextVal ?? 0);
      return;
    }

    const parsed = parseFloat(next);
    const nextVal = Number.isNaN(parsed) ? (allowEmpty ? null : (min ?? 0)) : parsed;
    if (!isControlled) setInternalValue(nextVal);
    onValueChange?.(nextVal ?? 0);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    setIsFocused(false);
    if (draft === '' && allowEmpty) {
      if (!isControlled) setInternalValue(null);
      onValueChange?.(0);
      onBlur?.(event);
      return;
    }
    const parsed = parseFloat(draft);
    if (Number.isNaN(parsed)) {
      const nextVal = allowEmpty ? null : (min ?? 0);
      if (!isControlled) setInternalValue(nextVal);
      onValueChange?.(nextVal ?? 0);
      onBlur?.(event);
      return;
    }
    const clamped = clampNumber(parsed, min, max);
    if (!isControlled) setInternalValue(clamped);
    onValueChange?.(clamped);
    onBlur?.(event);
  };

  return (
    <div className="relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={
            actualValue !== null && actualValue !== undefined && !Number.isNaN(actualValue)
              ? actualValue
              : ''
          }
        />
      )}
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
        {currencySymbol}
      </span>
      <Input
        {...props}
        name={undefined}
        ref={ref}
        type="text"
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn('pl-7 text-right tabular-nums', className)}
      />
    </div>
  );
}
