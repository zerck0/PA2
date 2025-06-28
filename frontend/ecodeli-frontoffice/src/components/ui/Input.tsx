import React, { forwardRef } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  autoComplete?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  onKeyDown,
  onFocus,
  onBlur,
  autoComplete
}, ref) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
