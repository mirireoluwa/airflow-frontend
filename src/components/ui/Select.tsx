import React from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, error, options, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'appearance-none flex h-12 w-full rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm px-4 pr-10 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/90',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
