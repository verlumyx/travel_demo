'use client';

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  value?: number | null;
  defaultValue?: number | string | null;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  decimals?: number;
  allowNegative?: boolean;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
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

function sanitizeNumeric(
  raw: string,
  decimals: number,
  allowNegative: boolean
): string {
  let next = raw.replace(/,/g, '.');
  const isNegative = allowNegative && next.trim().startsWith('-');
  next = next.replace(/[^0-9.]/g, '');

  if (decimals <= 0) {
    next = next.replace(/\./g, '');
  } else {
    const [integerPart, ...rest] = next.split('.');
    next = integerPart ?? '';
    if (rest.length > 0) {
      next += '.' + rest.join('').slice(0, decimals);
    }
  }

  return (isNegative ? '-' : '') + next;
}

/**
 * Input numérico sin las flechas nativas de `type="number"`.
 * Permite escribir libremente mientras el campo está enfocado y aplica
 * el clamp de `min`/`max` al perder el foco.
 * Soporta modo controlado (`value`, `onValueChange`) e incontrolado (`defaultValue`, `name`).
 */
export function NumberInput({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  decimals = 0,
  allowNegative = false,
  className,
  inputMode,
  onFocus,
  onBlur,
  name,
  ref,
  ...props
}: NumberInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<number | null | undefined>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
      const num = typeof defaultValue === 'string' ? parseFloat(defaultValue) : Number(defaultValue);
      return Number.isNaN(num) ? min : num;
    }
    return min ?? 0;
  });

  const actualValue = isControlled ? value : internalValue;

  const [isFocused, setIsFocused] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const format = React.useCallback(
    (input: number | null | undefined): string => {
      if (input === null || input === undefined || Number.isNaN(input)) {
        return '';
      }
      return decimals > 0 ? String(input) : String(Math.trunc(input));
    },
    [decimals]
  );

  const display = isFocused ? draft : format(actualValue);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    setDraft(format(actualValue));
    onFocus?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = sanitizeNumeric(event.target.value, decimals, allowNegative);
    setDraft(next);

    if (next === '' || next === '-') {
      const nextVal = min ?? 0;
      if (!isControlled) setInternalValue(nextVal);
      onValueChange?.(nextVal);
      return;
    }

    const parsed = parseFloat(next);
    const nextVal = Number.isNaN(parsed) ? (min ?? 0) : parsed;
    if (!isControlled) setInternalValue(nextVal);
    onValueChange?.(nextVal);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    setIsFocused(false);
    const parsed = parseFloat(draft);
    const base = Number.isNaN(parsed) ? (min ?? 0) : parsed;
    const clamped = clampNumber(base, min, max);
    if (!isControlled) setInternalValue(clamped);
    onValueChange?.(clamped);
    onBlur?.(event);
  };

  return (
    <>
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
      <Input
        {...props}
        name={undefined}
        ref={ref}
        type="text"
        inputMode={inputMode ?? (decimals > 0 ? 'decimal' : 'numeric')}
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn('tabular-nums', className)}
      />
    </>
  );
}
