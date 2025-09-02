import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, User, LayoutGrid, List, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TaskStatusBadge, TaskPriorityBadge } from '../../components/ui/Badge';
import { TaskForm } from '../../components/forms/TaskForm';
import { Loading, SkeletonList } from '../../components/ui/Loading';
import { useAirflow } from '../../context/AirflowContext';
import { getOverdueTaskColor } from '../../utils/overdueTasks';
import type { Task, TaskStatus, TaskPriority } from '../../types';
import { format } from 'date-fns';

export function Tasks() {
  const { state, addTask, updateTask, deleteTask } = useAirflow();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesProject = !projectFilter || task.projectId === projectFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [state.tasks, searchTerm, statusFilter, priorityFilter, projectFilter]);

  const handleCreateTask = (data: any) => {
    const assignee = data.assigneeId ? state.users.find(u => u.id === data.assigneeId) : undefined;
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

    addTask({
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      projectId: data.projectId,
      assignee,
      reporter: state.currentUser!,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      estimatedHours: data.estimatedHours,
      tags
    });

    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = (data: any) => {
    if (!editingTask) return;

    const assignee = data.assigneeId ? state.users.find(u => u.id === data.assigneeId) : undefined;
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

    updateTask(editingTask.id, {
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      projectId: data.projectId,
      assignee,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      estimatedHours: data.estimatedHours,
      tags
    });

    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
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
  const isTaskOverdue = (task: Task): { isOverdue: boolean; daysOverdue: number } => {
    if (!task.dueDate || task.status === 'done') {
      return { isOverdue: false, daysOverdue: 0 };
    }
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { isOverdue: daysOverdue > 0, daysOverdue };
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gradient mb-2">Tasks</h1>
            <p className="text-lg text-gray-600">Manage and track all your tasks.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Loading text="Loading tasks..." />
          </div>
        </div>

        {/* Loading Filters */}
        <Card variant="flat">
          <CardContent className="pt-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Tasks */}
        <SkeletonList />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gradient mb-2">Tasks</h1>
          <p className="text-lg text-gray-600">Manage and track all your tasks.</p>
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
          <Button onClick={() => setIsCreateModalOpen(true)} className="sm:w-auto w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Task
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
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setProjectFilter('');
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
          <CardContent className="text-center py-12">
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
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card variant="flat">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const project = state.projects.find(p => p.id === task.projectId);
                const overdueInfo = isTaskOverdue(task);
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 hover:bg-gray-50 ${
                      overdueInfo.isOverdue 
                        ? `border-l-4 ${getOverdueTaskColor(overdueInfo.daysOverdue).split(' ')[2]}` 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h3>
                          <TaskStatusBadge status={task.status} />
                          <TaskPriorityBadge priority={task.priority} />
                          {overdueInfo.isOverdue && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              overdueInfo.daysOverdue <= 1 ? 'bg-yellow-100 text-yellow-800' :
                              overdueInfo.daysOverdue <= 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {overdueInfo.daysOverdue} day{overdueInfo.daysOverdue > 1 ? 's' : ''} overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          {project && (
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                              <span>{project.name}</span>
                            </span>
                          )}
                          {task.assignee && (
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee.name}</span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const project = state.projects.find(p => p.id === task.projectId);
            const overdueInfo = isTaskOverdue(task);
            return (
              <Card 
                key={task.id} 
                variant="flat"
                className={`hover:shadow-md transition-shadow ${
                  overdueInfo.isOverdue 
                    ? `border-l-4 ${getOverdueTaskColor(overdueInfo.daysOverdue).split(' ')[2]}` 
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        {overdueInfo.isOverdue && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            overdueInfo.daysOverdue <= 1 ? 'bg-yellow-100 text-yellow-800' :
                            overdueInfo.daysOverdue <= 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {overdueInfo.daysOverdue} day{overdueInfo.daysOverdue > 1 ? 's' : ''} overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </p>

                  {project && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                      <span>{project.name}</span>
                    </div>
                  )}

                  {task.assignee && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{task.assignee.name}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50/80 text-gray-600 border border-gray-200/50 backdrop-blur-sm shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        className="max-w-2xl"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        className="max-w-2xl"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>
    </div>
  );
}
