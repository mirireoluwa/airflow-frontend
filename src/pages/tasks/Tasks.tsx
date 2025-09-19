import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, CheckSquare, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EnhancedTaskCard } from '../../components/tasks/EnhancedTaskCard';
import { useAirflow } from '../../context/AirflowContext';
import { canAccessTaskDetails, canEditTask, getAccessibleTasks } from '../../utils/roleUtils';
import type { Task, TaskStatus, TaskPriority } from '../../types';

export function Tasks() {
  const { state, deleteTask } = useAirflow();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'overdue') {
      setOverdueFilter(true);
    }
  }, [searchParams]);

  // Filter tasks based on current filters and user access
  const filteredTasks = useMemo(() => {
    // First, get only tasks the user can access
    const accessibleTasks = getAccessibleTasks(state.currentUser, state.tasks);
    
    return accessibleTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesProject = !projectFilter || task.projectId === projectFilter;
      
      // Check if task is overdue
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
      const matchesOverdue = !overdueFilter || isOverdue;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesOverdue;
    });
  }, [state.tasks, state.currentUser, searchTerm, statusFilter, priorityFilter, projectFilter, overdueFilter]);

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  const handleEditTask = (task: Task) => {
    navigate(`/tasks/${task.id}?edit=true`);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (canAccessTaskDetails(state.currentUser, task)) {
      navigate(`/tasks/${task.id}`);
    }
  };

  const handleOverdueFilterToggle = () => {
    setOverdueFilter(!overdueFilter);
    // Update URL parameters
    const newParams = new URLSearchParams(searchParams);
    if (!overdueFilter) {
      newParams.set('filter', 'overdue');
    } else {
      newParams.delete('filter');
    }
    setSearchParams(newParams);
  };

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

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...state.projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  // Helper function to check if a task is overdue

  // Removed loading state that was interfering with display

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-gradient">
              {overdueFilter ? 'Overdue Tasks' : 'Tasks'}
            </h1>
            {overdueFilter && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <button
                  onClick={handleOverdueFilterToggle}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors touch-target"
                  aria-label="Clear overdue filter"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {overdueFilter 
              ? 'Tasks that are past their due date and need attention'
              : 'Manage and track all your tasks.'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <div className="relative w-28 sm:w-32 h-9 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 p-1 overflow-hidden">
              <div
                className={`${
                  'absolute top-1 h-7 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-md transition-all duration-300 ease-out w-[calc(50%-0.5rem)] z-10 pointer-events-none'
                } ${viewMode === 'grid' ? 'left-[calc(50%+0.25rem)]' : 'left-1'}`}
              />
              <div className="relative z-20 h-full grid grid-cols-2 place-items-center">
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
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="flat">
        <CardContent className="pt-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
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
            <Select
              options={projectOptions}
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            />
            <Button 
              variant={overdueFilter ? "apple-primary" : "outline"}
              onClick={handleOverdueFilterToggle}
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{overdueFilter ? 'Hide Overdue' : 'Show Overdue'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setProjectFilter('');
                setOverdueFilter(false);
                setSearchParams(new URLSearchParams());
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Card variant="flat">
          <CardContent className="text-center py-12 pt-16">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {state.tasks.length === 0 
                ? 'Get started by creating your first task.' 
                : 'Try adjusting your search criteria.'}
            </p>
            {state.tasks.length === 0 && (
              <Button onClick={() => navigate('/tasks/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <EnhancedTaskCard 
              key={task.id} 
              task={task} 
              onClick={handleTaskClick}
              onEdit={canEditTask(state.currentUser, task, state.users) ? handleEditTask : undefined}
              onDelete={handleDeleteTask}
              showProject={true}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <EnhancedTaskCard 
              key={task.id} 
              task={task} 
              onClick={handleTaskClick}
              onEdit={canEditTask(state.currentUser, task, state.users) ? handleEditTask : undefined}
              onDelete={handleDeleteTask}
              showProject={true}
            />
          ))}
        </div>
      )}

      {/* All modals removed - using pages instead */}
    </div>
  );
}
