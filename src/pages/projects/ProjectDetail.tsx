import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckSquare,
  Plus,
  List,
  LayoutGrid,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EnhancedTaskCard } from '../../components/tasks/EnhancedTaskCard';
import { canAccessTaskDetails } from '../../utils/roleUtils';
import type { TaskStatus, TaskPriority, Task } from '../../types';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAirflow();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  // Removed modal states - using pages instead

  const project = state.projects.find(p => p.id === id);
  const projectTasks = useMemo(() => {
    if (!project) return [];
    return state.tasks.filter(task => task.projectId === project.id);
  }, [state.tasks, project]);

  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectTasks, searchTerm, statusFilter, priorityFilter]);

  // Removed page view notification - not essential

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

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const taskStats = {
    total: projectTasks.length,
    completed: projectTasks.filter(t => t.status === 'done').length,
    inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
    overdue: projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
  };

  const handleCreateTask = () => {
    navigate(`/tasks/create?projectId=${project!.id}`);
  };

  const handleTaskClick = (task: Task) => {
    if (canAccessTaskDetails(state.currentUser, task)) {
      navigate(`/tasks/${task.id}`);
    }
  };

  const handleEditTask = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-white/60 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">{project.name}</h1>
            <p className="text-lg text-gray-600">{project.description}</p>
          </div>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 rounded-xl">
                <CheckSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Start Date</p>
              <p className="text-gray-900">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">End Date</p>
              <p className="text-gray-900">
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-gray-900">{project.members.length} members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <div className="flex items-center space-x-4">
            <Button variant="primary" onClick={handleCreateTask}>
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </Button>
            
            {/* View Toggle */}
            <div className="relative flex items-center bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-1 h-9 w-28 sm:h-9 sm:w-32 overflow-hidden">
              <span
                className={`absolute top-1 bottom-1 w-[calc(50%-0.5rem)] bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm transition-all duration-300 ease-out z-10 ${
                  viewMode === 'list' ? 'left-1' : 'left-[calc(50%+0.25rem)]'
                }`}
              />
              <div className="grid grid-cols-2 place-items-center w-full h-full relative z-20">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="w-full h-full flex items-center justify-center text-xs font-medium"
                >
                  <List className={`h-4 w-4 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-500'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="w-full h-full flex items-center justify-center text-xs font-medium"
                >
                  <LayoutGrid className={`h-4 w-4 transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card variant="flat">
          <CardContent className="pt-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              />
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              />
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List/Grid */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {projectTasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-gray-600">
                {projectTasks.length === 0 
                  ? 'Get started by creating your first task for this project.'
                  : 'Try adjusting your search terms or filters.'}
              </p>
              {projectTasks.length === 0 && (
                <Button variant="primary" className="mt-4">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredTasks.map((task) => (
              <EnhancedTaskCard 
                key={task.id} 
                task={task} 
                onClick={handleTaskClick}
                onEdit={handleEditTask}
                showProject={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* All modals removed - using pages instead */}
    </div>
  );
}
