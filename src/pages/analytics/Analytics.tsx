import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatsCard } from '../../components/charts/StatsCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAirflow } from '../../context/AirflowContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { TrendingUp, Clock, CheckSquare, AlertTriangle } from 'lucide-react';

const COLORS = ['#E60000', '#10B981', '#F59E0B', '#EF4444'];

export function Analytics() {
  const { state, addNotification } = useAirflow();
  const stats = useDashboardStats();

  // Add notification when analytics are viewed (only once per session)
  useEffect(() => {
    if (state.currentUser) {
      const notificationKey = `analytics_viewed_${state.currentUser.id}`;
      const hasViewed = sessionStorage.getItem(notificationKey);
      
      if (!hasViewed) {
        addNotification({
          title: 'Analytics Viewed',
          message: 'You viewed the analytics dashboard',
          type: 'info',
          read: false,
          userId: state.currentUser.id,
          actionUrl: '/analytics'
        });
        sessionStorage.setItem(notificationKey, 'true');
      }
    }
  }, [state.currentUser]);

  // Prepare data for charts
  const statusData = [
    { name: 'To Do', value: stats.tasksByStatus.todo },
    { name: 'In Progress', value: stats.tasksByStatus['in-progress'] },
    { name: 'Review', value: stats.tasksByStatus.review },
    { name: 'Done', value: stats.tasksByStatus.done }
  ];

  const priorityData = [
    { name: 'Low', value: stats.tasksByPriority.low },
    { name: 'Medium', value: stats.tasksByPriority.medium },
    { name: 'High', value: stats.tasksByPriority.high },
    { name: 'Urgent', value: stats.tasksByPriority.urgent }
  ];

  // Project progress data
  const projectProgressData = state.projects.map(project => ({
    name: project.name,
    progress: project.progress,
    tasks: state.tasks.filter(task => task.projectId === project.id).length
  }));

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const overdueRate = stats.totalTasks > 0 ? (stats.overdueTasks / stats.totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center lg:text-left mb-4 pb-1">
        <h1 className="text-4xl font-bold text-gradient mb-2 pb-2">Analytics</h1>
        <p className="text-lg text-gray-600">Track your team's performance and project insights.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Completion Rate"
          value={`${Math.round(completionRate)}%`}
          change={completionRate > 75 ? "Above target" : "Below target"}
          changeType={completionRate > 75 ? "positive" : "negative"}
          icon={CheckSquare}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Overdue Rate"
          value={`${Math.round(overdueRate)}%`}
          change={overdueRate < 10 ? "Within target" : "Needs attention"}
          changeType={overdueRate < 10 ? "positive" : "negative"}
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Avg. Project Progress"
          value={`${Math.round(state.projects.reduce((sum, p) => sum + p.progress, 0) / (state.projects.length || 1))}%`}
          icon={TrendingUp}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Total Hours Estimated"
          value={`${state.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}h`}
          icon={Clock}
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card variant="flat">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Task Status Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card variant="flat">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Task Priority Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#E60000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card variant="flat">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        </CardHeader>
        <CardContent>
          {state.projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects to analyze</p>
          ) : (
            <div className="space-y-6">
              {state.projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{state.tasks.filter(task => task.projectId === project.id).length} tasks</span>
                      <span>{project.progress}%</span>
                    </div>
                  </div>
                  <ProgressBar 
                    value={project.progress}
                    variant={project.progress === 100 ? 'success' : 'default'}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card variant="flat">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.users.map((user) => {
              const userTasks = state.tasks.filter(task => task.assignee?.id === user.id);
              const completedTasks = userTasks.filter(task => task.status === 'done').length;
              const completionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;

              return (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {completedTasks}/{userTasks.length} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(completionRate)}%
                    </span>
                    <ProgressBar 
                      value={completionRate} 
                      className="w-24"
                      variant={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'default'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
