import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { PriorityChip } from '../../components/ui/PriorityChip';
import { useAirflow } from '../../context/AirflowContext';
import { getAssignableUsers } from '../../utils/roleUtils';
import { ChecklistView } from '../../components/checklist/ChecklistView';
import { format } from 'date-fns';
import type { TaskStatus, TaskPriority } from '../../types';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateTask, deleteTask } = useAirflow();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editEstimatedHours, setEditEstimatedHours] = useState('');

  const task = state.tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Task not found</h2>
        <p className="text-gray-600 mt-2">The task you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(task.assignee?.id || '');
    setEditDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
    setEditEstimatedHours(task.estimatedHours?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const assignee = state.users.find(u => u.id === editAssignee);
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      assignee: assignee || undefined,
      dueDate: editDueDate ? new Date(editDueDate) : undefined,
      estimatedHours: editEstimatedHours ? parseInt(editEstimatedHours) : undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(task.assignee?.id || '');
    setEditDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
    setEditEstimatedHours(task.estimatedHours?.toString() || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      navigate('/tasks');
    }
  };

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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const assignableUsers = getAssignableUsers(state.currentUser, state.users);
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...assignableUsers.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/tasks')}
            className="p-2 hover:bg-white/60 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Task Details</h1>
            <p className="text-lg text-gray-600">Manage and track your task</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Title and Description */}
          <Card variant="flat">
            <CardContent className="pt-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title"
                      className="text-2xl font-bold"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Task description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-600"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <StatusToggle
                        status={editStatus}
                        onChange={(status) => setEditStatus(status as TaskStatus)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <PriorityChip
                        priority={editPriority}
                        onChange={(priority) => setEditPriority(priority as TaskPriority)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                      <Select
                        options={assigneeOptions}
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <Input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                      <Input
                        type="number"
                        value={editEstimatedHours}
                        onChange={(e) => setEditEstimatedHours(e.target.value)}
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{task.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h3>
              <ChecklistView task={task} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card variant="flat">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Status</h4>
                  {isEditing ? (
                    <StatusToggle
                      status={editStatus}
                      onChange={(status) => setEditStatus(status as TaskStatus)}
                    />
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : 
                       task.status === 'todo' ? 'To Do' : 
                       task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Priority</h4>
                  {isEditing ? (
                    <PriorityChip
                      priority={editPriority}
                      onChange={(priority) => setEditPriority(priority as TaskPriority)}
                    />
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600">Assignee</h4>
                  {isEditing ? (
                    <Select
                      options={assigneeOptions}
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center space-x-3 mt-1">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900">{task.assignee?.name || 'Unassigned'}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Due Date</h4>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center space-x-3 mt-1">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <p className={`text-gray-900 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Estimated Hours</h4>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editEstimatedHours}
                      onChange={(e) => setEditEstimatedHours(e.target.value)}
                      placeholder="e.g., 8"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 mt-1">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900">{task.estimatedHours ? `${task.estimatedHours}h` : 'Not estimated'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
      </div>
    </div>
  );
}
