import React from 'react';
import { cn } from '../../utils/cn';
import type { TaskStatus, TaskPriority, ProjectStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-50/80 text-gray-700 border border-gray-200/50 backdrop-blur-sm shadow-sm',
  secondary: 'bg-gray-50/60 text-gray-600 border border-gray-200/40 backdrop-blur-sm shadow-sm',
  success: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm shadow-sm',
  warning: 'bg-amber-50/80 text-amber-700 border border-amber-200/50 backdrop-blur-sm shadow-sm',
  danger: 'bg-red-50/80 text-red-700 border border-red-200/50 backdrop-blur-sm shadow-sm'
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Specialized badge components for specific types
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const variants: Record<TaskStatus, 'default' | 'warning' | 'success' | 'secondary'> = {
    'todo': 'default',
    'in-progress': 'warning',
    'review': 'secondary',
    'done': 'success'
  };

  const labels: Record<TaskStatus, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'done': 'Done'
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const variants: Record<TaskPriority, 'default' | 'secondary' | 'warning' | 'danger'> = {
    'low': 'secondary',
    'medium': 'default',
    'high': 'warning',
    'urgent': 'danger'
  };

  const labels: Record<TaskPriority, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };

  return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const variants: Record<ProjectStatus, 'default' | 'warning' | 'success' | 'secondary' | 'danger'> = {
    'planning': 'default',
    'active': 'warning',
    'on-hold': 'secondary',
    'completed': 'success',
    'cancelled': 'danger'
  };

  const labels: Record<ProjectStatus, string> = {
    'planning': 'Planning',
    'active': 'Active',
    'on-hold': 'On Hold',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
