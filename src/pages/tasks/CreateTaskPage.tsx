import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAirflow } from '../../context/AirflowContext';
import { getAssignableUsers } from '../../utils/roleUtils';
import type { TaskStatus, TaskPriority } from '../../types';

export function CreateTaskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { state, addTask } = useAirflow();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    tags: ''
  });

  const [dueDateError, setDueDateError] = useState('');

  // Get the selected project to validate due date
  const selectedProject = state.projects.find(p => p.id === projectId);

  const validateDueDate = (dueDate: string) => {
    if (!dueDate) {
      setDueDateError('');
      return true;
    }

    if (!selectedProject?.endDate) {
      setDueDateError('');
      return true;
    }

    const taskDueDate = new Date(dueDate);
    const projectEndDate = new Date(selectedProject.endDate);

    if (taskDueDate > projectEndDate) {
      setDueDateError(`Task due date cannot be later than project end date (${projectEndDate.toLocaleDateString()})`);
      return false;
    }

    setDueDateError('');
    return true;
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setFormData(prev => ({ ...prev, dueDate: newDueDate }));
    validateDueDate(newDueDate);
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setFormData(prev => ({ ...prev, projectId: newProjectId }));
    
    // Re-validate due date if project changes
    if (formData.dueDate) {
      validateDueDate(formData.dueDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    // Validate due date before submission
    if (formData.dueDate && !validateDueDate(formData.dueDate)) {
      return;
    }

    const assignee = formData.assigneeId ? state.users.find(u => u.id === formData.assigneeId) : undefined;
    const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    addTask({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      projectId: projectId || '',
      assignee,
      reporter: state.currentUser!,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      tags,
      checklist: []
    });

    navigate(projectId ? `/projects/${projectId}` : '/tasks');
  };

  const handleCancel = () => {
    navigate(projectId ? `/projects/${projectId}` : '/tasks');
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Get assignable users - if projectId is provided, only show project members
  let assignableUsers = getAssignableUsers(state.currentUser, state.users);
  
  if (projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      // Only show project members as assignable users
      assignableUsers = assignableUsers.filter(user => 
        project.members.some(member => member.id === user.id)
      );
    }
  }
  
  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...assignableUsers.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  const projectOptions = [
    { value: '', label: 'No Project' },
    ...state.projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="p-2 hover:bg-white/60 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Create New Task</h1>
            <p className="text-lg text-gray-600">Add a new task to your workflow</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card variant="flat">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  options={statusOptions}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  options={priorityOptions}
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <Select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  options={userOptions}
                />
                {projectId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Only project members can be assigned to this task.
                  </p>
                )}
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <Select
                  value={projectId || ''}
                  onChange={handleProjectChange}
                  options={projectOptions}
                  disabled={!!projectId}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={handleDueDateChange}
                  error={dueDateError}
                  max={selectedProject?.endDate ? new Date(selectedProject.endDate).toISOString().split('T')[0] : undefined}
                />
                {selectedProject?.endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Project ends on {new Date(selectedProject.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
