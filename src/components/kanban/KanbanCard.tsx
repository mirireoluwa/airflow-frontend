
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageCircle, FileText, MoreVertical } from 'lucide-react';
import { getOverdueTaskColor } from '../../utils/overdueTasks';
import type { Task } from '../../types';
import { useAirflow } from '../../context/AirflowContext';

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const { } = useAirflow();
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

  // Priority badge colors matching the image
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for comments and files (you can replace with real data)
  const commentCount = Math.floor(Math.random() * 15) + 1;
  const fileCount = Math.floor(Math.random() * 5);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-2xl border border-gray-200 p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${
        isDragging ? 'opacity-60 scale-105 shadow-2xl' : ''
      } ${
        overdueInfo.isOverdue 
          ? `border-l-4 ${getOverdueTaskColor(overdueInfo.daysOverdue).split(' ')[2]}` 
          : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header with Priority and Options */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {task.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {task.description}
        </p>

        {/* Assigned Users - Avatar style */}
        {task.assignee && (
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              {/* Add more avatars if there are multiple assignees */}
              {task.assignee.name === 'John Doe' && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  J
                </div>
              )}
              {task.assignee.name === 'Jane Smith' && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                  J
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with Comments and Files */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{commentCount} comments</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{fileCount} files</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
