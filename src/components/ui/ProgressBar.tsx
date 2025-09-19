
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'apple';
  size?: 'sm' | 'md' | 'lg';
}

const progressVariants = {
  default: 'bg-red-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  apple: 'bg-gradient-to-r from-red-500 to-red-600'
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

export function ProgressBar({ 
  value, 
  className, 
  showLabel = false, 
  variant = 'default',
  size = 'md'
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  if (variant === 'apple') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-1">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              {clampedValue}%
            </span>
          )}
        </div>
        <div className="apple-progress-bar">
          <div
            className="apple-progress-fill"
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {clampedValue}%
          </span>
        )}
      </div>
      <div className={cn('w-full bg-gray-200 rounded-full', progressSizes[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-300 ease-in-out',
            progressSizes[size],
            progressVariants[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
