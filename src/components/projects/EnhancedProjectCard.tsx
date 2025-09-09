import { useState } from 'react';
import { 
  Calendar, 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ProjectStatusToggle } from '../ui/ProjectStatusToggle';
import { ProgressBar } from '../ui/ProgressBar';
import { useAirflow } from '../../context/AirflowContext';
import { format } from 'date-fns';
import type { Project, ProjectStatus } from '../../types';

interface EnhancedProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onStatusChange?: (projectId: string, status: ProjectStatus) => void;
  className?: string;
}

export function EnhancedProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  className = ""
}: EnhancedProjectCardProps) {
  const { state, updateProject } = useAirflow();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const projectTasks = state.tasks.filter(task => task.projectId === project.id);
  const completedTasks = projectTasks.filter(task => task.status === 'done').length;
  const totalTasks = projectTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const overdueTasks = projectTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length;


  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(project.id, newStatus as ProjectStatus);
    } else {
      updateProject(project.id, { status: newStatus as ProjectStatus });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'planning':
        return 'text-blue-600 bg-blue-50';
      case 'on-hold':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card 
      className={`cursor-pointer group ${className}`}
      onClick={() => onClick?.(project)}
    >
      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <ProjectStatusToggle
              status={project.status}
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
                      <span>Edit Project</span>
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
                      <span>Delete Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-gray-900 font-semibold">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <ProgressBar 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{totalTasks}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{completedTasks}</div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className={`text-lg font-semibold ${overdueTasks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {overdueTasks}
            </div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{project.members.length} members</span>
            </div>
            {project.endDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Due {format(new Date(project.endDate), 'MMM d')}</span>
              </div>
            )}
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status === 'on-hold' ? 'On Hold' : 
             project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
