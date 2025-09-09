import { CheckSquare, Clock, Eye, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatusToggleProps {
  status: string;
  onChange: (status: string) => void;
  className?: string;
}

const statusConfig = {
  'todo': {
    label: 'To Do',
    icon: CheckSquare,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    activeColor: 'bg-gray-200 text-gray-900'
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    activeColor: 'bg-blue-200 text-blue-900'
  },
  'review': {
    label: 'Review',
    icon: Eye,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    activeColor: 'bg-yellow-200 text-yellow-900'
  },
  'done': {
    label: 'Done',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    activeColor: 'bg-green-200 text-green-900'
  }
};

export function StatusToggle({ status, onChange, className = "" }: StatusToggleProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.todo;
  const Icon = config.icon;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const statuses = Object.keys(statusConfig);
        const currentIndex = statuses.indexOf(status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        onChange(statuses[nextIndex]);
      }}
      className={cn(
        'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
        config.color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </button>
  );
}
