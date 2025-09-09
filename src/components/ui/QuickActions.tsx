import React, { useState } from 'react';
import { Plus, Edit, Trash2, CheckSquare, Calendar, User, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onTaskCreate?: () => void;
  onProjectCreate?: () => void;
  onUserCreate?: () => void;
  className?: string;
}

export function QuickActions({ 
  onTaskCreate, 
  onProjectCreate, 
  onUserCreate,
  className = "" 
}: QuickActionsProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actionOptions = [
    {
      value: 'task',
      label: 'New Task',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Create a new task',
      action: () => {
        if (onTaskCreate) {
          onTaskCreate();
        } else {
          navigate('/tasks/create');
        }
        setIsOpen(false);
      }
    },
    {
      value: 'project',
      label: 'New Project',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Create a new project',
      action: () => {
        if (onProjectCreate) {
          onProjectCreate();
        } else {
          navigate('/projects/create');
        }
        setIsOpen(false);
      }
    },
    {
      value: 'user',
      label: 'Add User',
      icon: <User className="w-4 h-4" />,
      description: 'Add a new team member',
      action: () => {
        if (onUserCreate) {
          onUserCreate();
        } else {
          navigate('/users/create');
        }
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Quick Actions</span>
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {actionOptions.map((option) => (
              <button
                key={option.value}
                onClick={option.action}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center space-x-3"
              >
                <span className="text-gray-600">{option.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
