
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Clock } from 'lucide-react';
import { TaskPriorityBadge } from '../ui/Badge';
import { getOverdueTaskColor } from '../../utils/overdueTasks';
import type { Task } from '../../types';
import { useAirflow } from '../../context/AirflowContext';
import { format } from 'date-fns';

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const { state } = useAirflow();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const project = state.projects.find(p => p.id === task.projectId);
  
  // Check if task is overdue
  const isTaskOverdue = (task: Task): { isOverdue: boolean; daysOverdue: number } => {
    if (!task.dueDate || task.status === 'done') {
      return { isOverdue: false, daysOverdue: 0 };
    }
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { isOverdue: daysOverdue > 0, daysOverdue };
  };
  
  const overdueInfo = isTaskOverdue(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 p-4 cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
        isDragging ? 'opacity-60 scale-105 shadow-2xl' : ''
      } ${
        overdueInfo.isOverdue 
          ? `border-l-4 ${getOverdueTaskColor(overdueInfo.daysOverdue).split(' ')[2]}` 
          : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1">
            {overdueInfo.isOverdue && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                overdueInfo.daysOverdue <= 1 ? 'bg-yellow-100 text-yellow-800' :
                overdueInfo.daysOverdue <= 3 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {overdueInfo.daysOverdue}d
              </span>
            )}
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {task.description}
        </p>

        {/* Project */}
        {project && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            <span>{project.name}</span>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-50/70 backdrop-blur-sm text-red-600 border border-red-200/30 shadow-sm"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{task.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${
                overdueInfo.isOverdue ? 'text-red-600' : ''
              }`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {overdueInfo.isOverdue 
                    ? `${overdueInfo.daysOverdue}d overdue`
                    : format(new Date(task.dueDate), 'MMM d')
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
