import { Flag, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PriorityChipProps {
  priority: string;
  onChange: (priority: string) => void;
  className?: string;
}

const priorityConfig = {
  'low': {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    activeColor: 'bg-gray-200 text-gray-900'
  },
  'medium': {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    activeColor: 'bg-blue-200 text-blue-900'
  },
  'high': {
    label: 'High',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    activeColor: 'bg-orange-200 text-orange-900'
  },
  'urgent': {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    activeColor: 'bg-red-200 text-red-900'
  }
};

export function PriorityChip({ priority, onChange, className = "" }: PriorityChipProps) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const priorities = Object.keys(priorityConfig);
        const currentIndex = priorities.indexOf(priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        onChange(priorities[nextIndex]);
      }}
      className={cn(
        'inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
        config.color,
        className
      )}
    >
      {priority === 'urgent' ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Flag className="w-3 h-3" />
      )}
      <span>{config.label}</span>
    </button>
  );
}
