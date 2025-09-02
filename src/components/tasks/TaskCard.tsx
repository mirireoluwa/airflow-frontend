import { Calendar, User, Clock, Flag } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'review':
        return 'text-purple-600 bg-purple-50';
      case 'todo':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        onClick ? 'hover:shadow-xl' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-4 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
            {task.title}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {task.description}
        </p>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status === 'in-progress' ? 'In Progress' : 
             task.status === 'todo' ? 'To Do' : 
             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          
          {task.dueDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {task.assignee ? (
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-xs text-gray-600">{task.assignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}

          {task.estimatedHours && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-600">
                +{task.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
