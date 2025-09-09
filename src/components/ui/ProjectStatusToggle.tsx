import { Settings, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProjectStatusToggleProps {
  status: string;
  onChange: (status: string) => void;
  className?: string;
}

const statusConfig = {
  'planning': {
    label: 'Planning',
    icon: Settings,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    activeColor: 'bg-blue-200 text-blue-900'
  },
  'active': {
    label: 'Active',
    icon: Clock,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    activeColor: 'bg-green-200 text-green-900'
  },
  'on-hold': {
    label: 'On Hold',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    activeColor: 'bg-yellow-200 text-yellow-900'
  },
  'completed': {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    activeColor: 'bg-gray-200 text-gray-900'
  }
};

export function ProjectStatusToggle({ status, onChange, className = "" }: ProjectStatusToggleProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
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
