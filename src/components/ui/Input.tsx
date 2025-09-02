import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
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
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
