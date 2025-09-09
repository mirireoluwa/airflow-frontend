import React from 'react';
import { cn } from '../../utils/cn';
import { Loading } from './Loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
  secondary: 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white/90 hover:border-gray-300/80',
  outline: 'border border-gray-300/60 hover:border-gray-400/80 text-gray-700 hover:bg-white/50 backdrop-blur-sm',
  ghost: 'hover:bg-white/60 text-gray-700 backdrop-blur-sm',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm h-9',
  md: 'px-6 py-2.5 text-sm h-10',
  lg: 'px-8 py-3 text-base h-12'
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  loadingText,
  className, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loading size="sm" variant="spinner" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
}
