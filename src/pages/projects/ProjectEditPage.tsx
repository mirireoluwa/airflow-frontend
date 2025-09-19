import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { ProjectStatusToggle } from '../../components/ui/ProjectStatusToggle';
import { useAirflow } from '../../context/AirflowContext';
import { getAssignableUsers } from '../../utils/roleUtils';
import { format } from 'date-fns';
import type { ProjectStatus } from '../../types';

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateProject } = useAirflow();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    startDate: '',
    endDate: '',
    color: '#3B82F6',
    members: [] as string[] // Array of user IDs
  });

  const project = state.projects.find(p => p.id === id);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: format(new Date(project.startDate), 'yyyy-MM-dd'),
        endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
        color: project.color,
        members: project.members.map(member => member.id)
      });
    }
  }, [project]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
        <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({
      ...prev,
      status: status as ProjectStatus
    }));
  };

  const handleSave = () => {
    // Get member objects from IDs
    const memberObjects = formData.members
      .map(memberId => state.users.find(user => user.id === memberId))
      .filter(Boolean) as any[];

    updateProject(project.id, {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      color: formData.color,
      members: memberObjects
    });
    navigate(`/projects/${project.id}`);
  };

  const handleCancel = () => {
    navigate(`/projects/${project.id}`);
  };

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#EF4444', label: 'Red' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#06B6D4', label: 'Cyan' },
    { value: '#F97316', label: 'Orange' },
    { value: '#84CC16', label: 'Lime' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="p-2 hover:bg-white/60 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Edit Project</h1>
            <p className="text-lg text-gray-600">Update project details and settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className="text-xl font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-600"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Settings */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <ProjectStatusToggle
                    status={formData.status}
                    onChange={handleStatusChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Color</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: formData.color }}
                    />
                    <Select
                      options={colorOptions}
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manage team members for this project
                </label>
                <MultiSelect
                  options={getAssignableUsers(state.currentUser, state.users).map(user => ({
                    value: user.id,
                    label: user.name,
                    user: user
                  }))}
                  value={formData.members}
                  onChange={(values) => handleInputChange('members', values)}
                  placeholder="Select team members..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Only selected members will be able to be assigned to tasks in this project.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Preview */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <h4 className="font-semibold text-gray-900">{formData.name || 'Project Name'}</h4>
                </div>
                <p className="text-sm text-gray-600">{formData.description || 'Project description'}</p>
                <div className="flex items-center space-x-2">
                  <ProjectStatusToggle
                    status={formData.status}
                    onChange={handleStatusChange}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Start: {formData.startDate ? format(new Date(formData.startDate), 'MMM d, yyyy') : 'Not set'}</p>
                  <p>End: {formData.endDate ? format(new Date(formData.endDate), 'MMM d, yyyy') : 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold">{project.tasks?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Members</span>
                  <span className="font-semibold">{project.members?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold">{project.progress || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
