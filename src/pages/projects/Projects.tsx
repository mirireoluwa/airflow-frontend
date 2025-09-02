import { useState } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, FolderOpen, CheckSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ProjectStatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ProjectForm } from '../../components/forms/ProjectForm';
import { useAirflow } from '../../context/AirflowContext';
import type { Project, ProjectStatus } from '../../types';
import { format } from 'date-fns';

export function Projects() {
  const { state, addProject, updateProject, deleteProject } = useAirflow();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreateProject = (data: any) => {
    const members = state.users.filter(user => data.members.includes(user.id));
    const owner = state.currentUser;
    if (!owner) return;

    addProject({
      name: data.name,
      description: data.description,
      status: data.status as ProjectStatus,
      owner,
      members,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      progress: 0,
      color: data.color,
      tasks: []
    });

    setIsCreateModalOpen(false);
  };

  const handleUpdateProject = (data: any) => {
    if (!editingProject) return;

    const members = state.users.filter(user => data.members.includes(user.id));

    updateProject(editingProject.id, {
      name: data.name,
      description: data.description,
      status: data.status as ProjectStatus,
      members,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      color: data.color
    });

    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gradient mb-2">Projects</h1>
          <p className="text-lg text-gray-600">Manage your projects and track their progress.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="lg:w-auto w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {state.projects.length === 0 ? (
        <Card variant="flat">
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {state.projects.map((project) => (
            <Card 
              key={project.id} 
              variant="flat"
              className="group cursor-pointer relative overflow-hidden"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              {/* Color accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: project.color }}
              />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="text-xl font-bold text-gray-900">
                        {project.name}
                      </h3>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="p-2 hover:bg-white/60 rounded-xl"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      className="p-2 hover:bg-white/60 rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-xl text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-6">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                    <CheckSquare className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{project.tasks.length}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                    <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{project.members.length}</p>
                    <p className="text-xs text-gray-500">Members</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/30 pt-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Started {format(project.startDate, 'MMM d, yyyy')}</span>
                  </div>
                  {project.endDate && (
                    <span className="font-medium">Due {format(project.endDate, 'MMM d, yyyy')}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        className="max-w-2xl"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        className="max-w-2xl"
      >
        {editingProject && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleUpdateProject}
            onCancel={() => setEditingProject(null)}
          />
        )}
      </Modal>
    </div>
  );
}
