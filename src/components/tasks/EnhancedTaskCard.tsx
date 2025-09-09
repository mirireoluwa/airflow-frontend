import { useState } from 'react';
import { 
  Calendar, 
  User, 
  MoreVertical, 
  Edit, 
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { StatusToggle } from '../ui/StatusToggle';
import { PriorityChip } from '../ui/PriorityChip';
import { useAirflow } from '../../context/AirflowContext';
import { getOverdueTaskColor } from '../../utils/overdueTasks';
import { format } from 'date-fns';
import type { Task, TaskStatus, TaskPriority } from '../../types';

interface EnhancedTaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void;
  showProject?: boolean;
  className?: string;
}

export function EnhancedTaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  showProject = false,
  className = ""
}: EnhancedTaskCardProps) {
  const { state, updateTask } = useAirflow();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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
  const overdueColor = overdueInfo.isOverdue ? getOverdueTaskColor(overdueInfo.daysOverdue) : '';


  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus as TaskStatus);
    } else {
      updateTask(task.id, { status: newStatus as TaskStatus });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    if (onPriorityChange) {
      onPriorityChange(task.id, newPriority as TaskPriority);
    } else {
      updateTask(task.id, { priority: newPriority as TaskPriority });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const completedChecklistItems = task.checklist?.filter(item => item.completed).length || 0;
  const totalChecklistItems = task.checklist?.length || 0;
  const checklistProgress = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

  return (
    <Card 
      className={`cursor-pointer group border-0 ${
        overdueInfo.isOverdue ? `border-l-4 ${overdueColor}` : ''
      } ${className}`}
      onClick={() => onClick?.(task)}
    >
      <CardContent className="p-5 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {task.title}
            </h3>
            {showProject && project && (
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-xs text-gray-500">{project.name}</span>
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <StatusToggle
              status={task.status}
              onChange={handleStatusChange}
            />
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsActionsOpen(!isActionsOpen);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {isActionsOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {task.assignee && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>
          
          <PriorityChip
            priority={task.priority}
            onChange={handlePriorityChange}
          />
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
            <Calendar className="w-3 h-3" />
            <span className={overdueInfo.isOverdue ? 'text-red-600 font-medium' : ''}>
              Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
              {overdueInfo.isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Checklist Progress */}
        {totalChecklistItems > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Checklist Progress</span>
              <span className="text-gray-900 font-semibold">
                {completedChecklistItems}/{totalChecklistItems}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
