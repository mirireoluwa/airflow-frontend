import React from 'react';
import { cn } from '../../utils/cn';
import { Loading } from './Loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'apple-primary' | 'apple-secondary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
  secondary: 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white/90 hover:border-gray-300/80',
  outline: 'border border-gray-300/60 hover:border-gray-400/80 text-gray-700 hover:bg-white/50 backdrop-blur-sm',
  ghost: 'hover:bg-white/60 text-gray-700 backdrop-blur-sm',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
  'apple-primary': 'apple-button-primary',
  'apple-secondary': 'apple-button-secondary'
};

const buttonSizes = {
  sm: 'px-3 py-2 text-xs h-9 touch-target-sm',
  md: 'px-4 py-2.5 text-sm h-11 touch-target',
  lg: 'px-6 py-3 text-sm h-12 touch-target',
  xl: 'px-8 py-4 text-base h-14 touch-target-lg'
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
  const isAppleVariant = variant === 'apple-primary' || variant === 'apple-secondary';
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        isAppleVariant ? '' : 'rounded-xl',
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
