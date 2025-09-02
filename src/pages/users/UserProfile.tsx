import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Building, 
  User as UserIcon, 
  Calendar, 
  CheckSquare, 
  Clock,
  Plus,
  Edit,
  Wifi,
  WifiOff,
  AlertTriangle,
  Smile
} from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TaskForm } from '../../components/forms/TaskForm';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { format } from 'date-fns';
import type { Task, UserStatus } from '../../types';

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { state, addTask, addNotification } = useAirflow();
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);

  const user = state.users.find(u => u.id === userId);

  useEffect(() => {
    if (!user) {
      navigate('/search');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/search')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = state.currentUser;
  const canAssignTasks = currentUser && 
    (currentUser.role === 'admin' || currentUser.role === 'manager') &&
    currentUser.department === user.department;

  const userTasks = state.tasks.filter(task => task.assignee?.id === user.id);
  const completedTasks = userTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
  const completionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'busy': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'custom': return <Smile className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'busy': return 'text-red-600';
      case 'offline': return 'text-gray-600';
      case 'custom': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleAssignTask = (data: any) => {
    const project = state.projects.find(p => p.id === data.projectId);
    if (!project) return;

    addTask({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'todo',
      projectId: data.projectId,
      assignee: user,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      estimatedHours: data.estimatedHours,
      tags: data.tags || []
    });

    addNotification({
      title: 'Task Assigned',
      message: `Assigned "${data.title}" to ${user.name}`,
      type: 'success',
      read: false,
      userId: currentUser?.id || '',
      actionUrl: '/tasks'
    });

    setIsAssignTaskModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          onClick={() => navigate('/search')} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gradient">User Profile</h1>
          <p className="text-lg text-gray-600">View user information and manage tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <Card variant="flat">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo & Basic Info */}
              <div className="text-center">
                <div className="h-24 w-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    user.name.split(' ').map(n => n[0]).join('') || 'U'
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                {/* Status */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`${getStatusColor(user.status || 'offline')}`}>
                    {getStatusIcon(user.status || 'offline')}
                  </div>
                  <span className="text-sm font-medium capitalize">
                    {user.status === 'custom' ? user.customStatus || 'Custom' : user.status || 'Offline'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{user.department || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>

                {user.auid && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">AUID</p>
                      <p className="font-medium font-mono">{user.auid}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {canAssignTasks && (
                <Button 
                  onClick={() => setIsAssignTaskModalOpen(true)}
                  variant="primary"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Task
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Statistics & Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Statistics */}
          <Card variant="flat">
            <CardHeader>
              <CardTitle>Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <UserIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{userTasks.length}</p>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-bold text-gray-900">{Math.round(completionRate)}%</span>
                </div>
                <ProgressBar 
                  value={completionRate} 
                  variant={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'default'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card variant="flat">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {userTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                  <p className="text-gray-600">
                    {canAssignTasks ? 'Assign a task to get started.' : 'This user has no assigned tasks.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTasks.slice(0, 5).map((task) => {
                    const project = state.projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">{project?.name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.status === 'done' ? 'bg-green-100 text-green-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {userTasks.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        onClick={() => navigate('/tasks')} 
                        variant="outline" 
                        size="sm"
                      >
                        View All Tasks
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        title={`Assign Task to ${user.name}`}
        className="max-w-2xl"
      >
        <TaskForm
          onSubmit={handleAssignTask}
          onCancel={() => setIsAssignTaskModalOpen(false)}
          defaultAssignee={user}
          showAssignee={false} // Hide assignee field since we're assigning to this user
        />
      </Modal>
    </div>
  );
}
