import React from 'react';
import { CheckSquare, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChecklistView } from '../checklist/ChecklistView';
import { format } from 'date-fns';
import type { Task } from '../../types';

interface TaskDetailProps {
  task: Task;
  onShowChecklist: (task: Task) => void;
  onClose: () => void;
}

export function TaskDetail({ task, onShowChecklist, onClose }: TaskDetailProps) {
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

  // Checklist progress is now handled by ChecklistView component

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'in-progress' ? 'In Progress' : 
               task.status === 'todo' ? 'To Do' : 
               task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task Description */}
      <Card variant="flat">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-600 leading-relaxed">{task.description}</p>
        </CardContent>
      </Card>

      {/* Task Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="flat">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="space-y-4">
              {task.assignee && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assignee</p>
                    <p className="text-gray-900">{task.assignee.name}</p>
                  </div>
                </div>
              )}
              
              {task.dueDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due Date</p>
                    <p className="text-gray-900">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              
              {task.estimatedHours && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estimated Hours</p>
                    <p className="text-gray-900">{task.estimatedHours}h</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="flat">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h3>
            <ChecklistView task={task} />
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <Card variant="flat">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-600 border border-red-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
