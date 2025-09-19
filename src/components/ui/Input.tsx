import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'apple';
  helpText?: string;
  success?: boolean;
  required?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function Input({ 
  className, 
  label, 
  error, 
  variant = 'default', 
  helpText,
  success,
  required,
  autoSave,
  autoSaveDelay = 1000,
  ...props 
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !props.value) return;

    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      // Simulate auto-save
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [props.value, autoSave, autoSaveDelay]);

  if (variant === 'apple') {
    return (
      <div className="apple-input-group">
        <input
          className={cn(
            'apple-input',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          required={required}
          {...props}
        />
        {label && (
          <label className={cn(
            'apple-label',
            (isFocused || hasValue) && 'top-1 text-xs text-red-600'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p id={`${props.id}-error`} className="text-xs text-red-600 ml-3">
                {error}
              </p>
            )}
            {helpText && !error && (
              <p id={`${props.id}-help`} className="text-xs text-gray-500 ml-3">
                {helpText}
              </p>
            )}
          </div>
          {isSaving && (
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'flex h-12 w-full rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/90',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200 ease-out',
          error && 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500/40',
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
