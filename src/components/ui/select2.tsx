'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import ReactSelect, {
  components,
  type DropdownIndicatorProps,
  type GroupBase,
  type Props as ReactSelectProps,
  type StylesConfig,
  type SelectInstance,
} from 'react-select';
import { cn } from '@/lib/utils';

export interface OptionType {
  value: string;
  label: string;
}

export type Select2Size = 'sm' | 'md';

export interface Select2Props
  extends Omit<
    ReactSelectProps<OptionType, false, GroupBase<OptionType>>,
    'classNames' | 'value' | 'defaultValue' | 'onChange'
  > {
  options: OptionType[];
  value?: OptionType | string | null;
  defaultValue?: OptionType | string | null;
  onChange?: (option: OptionType | null) => void;
  onValueChange?: (value: string) => void;
  error?: boolean;
  className?: string;
  size?: Select2Size;
  name?: string;
  ref?: React.Ref<SelectInstance<OptionType, false, GroupBase<OptionType>>>;
}

const SIZES: Record<Select2Size, { height: string; radius: string }> = {
  sm: { height: '36px', radius: '0.375rem' },
  md: { height: '42px', radius: '10px' },
};

export function Select2DropdownIndicator<Option extends OptionType>(
  props: DropdownIndicatorProps<Option, false, GroupBase<Option>>
) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </components.DropdownIndicator>
  );
}

/**
 * Estilos compartidos por los selects de la aplicacion.
 */
export function createSelect2Styles<Option extends OptionType>({
  size = 'sm',
  error = false,
}: {
  size?: Select2Size;
  error?: boolean;
} = {}): StylesConfig<Option, false, GroupBase<Option>> {
  const { height, radius } = SIZES[size];

  return {
    control: (base, state) => {
      const getBorderColor = () => {
        if (error) {
          return 'var(--destructive)';
        }

        if (state.isFocused) {
          return 'var(--ring)';
        }

        return 'var(--input)';
      };

      return {
        ...base,
        minHeight: height,
        height,
        borderRadius: radius,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: getBorderColor(),
        backgroundColor: state.isDisabled
          ? 'var(--muted)'
          : 'var(--background)',
        boxShadow: state.isFocused
          ? '0 0 0 3px color-mix(in srgb, var(--ring) 30%, transparent)'
          : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        transition: 'all 0.2s',
        outline: 'none',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        opacity: state.isDisabled ? 0.6 : 1,
        '&:hover': {
          borderColor: getBorderColor(),
        },
      };
    },
    valueContainer: (base) => ({
      ...base,
      height,
      padding: '0 0.75rem',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      overflow: 'hidden',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontSize: '0.875rem',
      color: 'var(--foreground)',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height,
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 0.25rem',
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 0.5rem',
      color: 'var(--muted-foreground)',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: '0.5rem',
      boxShadow:
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      marginTop: '0.25rem',
      overflow: 'hidden',
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.25rem',
      maxHeight: '300px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor:
        state.isSelected || state.isFocused
          ? 'var(--accent)'
          : 'transparent',
      color: state.isSelected
        ? 'var(--accent-foreground)'
        : 'var(--foreground)',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--accent)',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--foreground)',
      fontSize: '0.875rem',
      margin: 0,
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
    }),
  };
}

export function Select2({
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  error = false,
  className,
  size = 'sm',
  instanceId,
  placeholder,
  name,
  ref,
  ...props
}: Select2Props) {
  const customStyles = createSelect2Styles<OptionType>({ size, error });
  const generatedId = React.useId();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedOption = React.useMemo(() => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === 'object') return value;
    return options.find((opt) => opt.value === String(value)) ?? null;
  }, [value, options]);

  const defaultSelectedOption = React.useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (defaultValue === null) return null;
    if (typeof defaultValue === 'object') return defaultValue;
    return options.find((opt) => opt.value === String(defaultValue)) ?? null;
  }, [defaultValue, options]);

  const [currentOption, setCurrentOption] = React.useState<OptionType | null | undefined>(
    defaultSelectedOption
  );

  const handleChange = (option: OptionType | null) => {
    if (value === undefined) {
      setCurrentOption(option);
    }
    onChange?.(option);
    onValueChange?.(option?.value ?? '');
  };

  const activeOption = value !== undefined ? selectedOption : currentOption;
  const activeValueString = activeOption?.value ?? '';

  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={activeValueString} />}
      <ReactSelect<OptionType, false, GroupBase<OptionType>>
        ref={ref}
        instanceId={instanceId ?? generatedId}
        styles={customStyles}
        components={{ DropdownIndicator: Select2DropdownIndicator }}
        className={cn('react-select-container text-sm', className)}
        classNamePrefix="react-select"
        options={options}
        value={activeOption}
        defaultValue={defaultSelectedOption}
        onChange={handleChange}
        menuPortalTarget={isMounted && typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        noOptionsMessage={() => 'No hay opciones disponibles'}
        placeholder={placeholder ?? 'Selecciona una opcion...'}
        isDisabled={props.isDisabled}
        isClearable={props.isClearable}
        {...props}
        name={undefined}
      />
    </div>
  );
}
