import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex space-x-1">
          <div className={cn(
            'bg-red-600 rounded-full animate-bounce',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            'bg-red-600 rounded-full animate-bounce',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            'bg-red-600 rounded-full animate-bounce',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )} style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <span className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className={cn(
          'bg-red-600 rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <span className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'border-2 border-gray-200 border-t-red-600 rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <span className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page loading overlay
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" variant="spinner" />
        <p className="text-gray-600 font-medium mt-4">{text}</p>
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  loading, 
  children, 
  className,
  ...props 
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={loading}
      className={cn(
        'relative',
        loading && 'cursor-not-allowed opacity-75',
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" variant="spinner" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}
