import { Input } from '@/components/ui/input';
import { forwardRef, InputHTMLAttributes } from 'react';

// Máscara de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
export const formatPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Limpa telefone para apenas números
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Valida se telefone tem pelo menos 10 dígitos
export const isValidPhone = (value: string): boolean => {
  const clean = cleanPhone(value);
  return clean.length >= 10 && clean.length <= 11;
};

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneMask(e.target.value);
      // Limite de 15 caracteres: (XX) XXXXX-XXXX
      if (formatted.length <= 15) {
        onChange(formatted);
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="(11) 99999-9999"
        value={value}
        onChange={handleChange}
        maxLength={15}
        className={`${error ? 'border-destructive' : ''} ${className || ''}`}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
