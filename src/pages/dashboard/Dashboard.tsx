import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  CheckSquare, 
  TrendingUp,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatsCard } from '../../components/charts/StatsCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TaskStatusBadge, TaskPriorityBadge } from '../../components/ui/Badge';
import { OverdueTaskIndicator } from '../../components/overdue/OverdueTaskIndicator';
import { SkeletonCard } from '../../components/ui/Loading';
import { useAirflow } from '../../context/AirflowContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { canAccessProjects, getAccessibleTasks } from '../../utils/roleUtils';
import { format } from 'date-fns';

export function Dashboard() {
  const { state } = useAirflow();
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const recentActivities = state.activities.slice(0, 5);
  const recentTasks = getAccessibleTasks(state.currentUser, state.tasks)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const activeProjects = state.projects.filter(p => p.status === 'active').slice(0, 3);

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleTasksClick = () => {
    navigate('/tasks');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            {canAccessProjects(state.currentUser) 
              ? "Welcome back! Here's what's happening with your projects."
              : "Welcome back! Here's what's happening with your tasks."
            }
          </p>
        </div>

        {/* Loading Stats Grid */}
        <div className={`grid gap-6 ${canAccessProjects(state.currentUser) ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {[...Array(canAccessProjects(state.currentUser) ? 4 : 2)].map((_, i) => (
            <SkeletonCard key={i} variant="stats" />
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 apple-stagger-animation">
      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-large-title font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-body text-gray-600">
          {canAccessProjects(state.currentUser) 
            ? "Welcome back! Here's what's happening with your projects."
            : "Welcome back! Here's what's happening with your tasks."
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-6 ${canAccessProjects(state.currentUser) ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {canAccessProjects(state.currentUser) && (
          <>
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FolderOpen}
              iconColor="text-red-600"
              onClick={handleProjectsClick}
            />
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={TrendingUp}
              iconColor="text-green-600"
              onClick={handleProjectsClick}
            />
          </>
        )}
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckSquare}
          iconColor="text-red-600"
          onClick={handleTasksClick}
        />
        <StatsCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={AlertTriangle}
          iconColor="text-red-600"
          onClick={handleTasksClick}
        />
      </div>

      {/* Overdue Tasks Alert */}
      <OverdueTaskIndicator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Overview */}
        <Card variant="apple">
          <CardHeader>
            <h3 className="text-title-3 font-semibold text-gray-900">Task Status Overview</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">To Do</span>
                <span className="text-sm font-medium">{stats.tasksByStatus.todo}</span>
              </div>
              <ProgressBar 
                value={(stats.tasksByStatus.todo / stats.totalTasks) * 100} 
                variant="apple"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium">{stats.tasksByStatus['in-progress']}</span>
              </div>
              <ProgressBar 
                value={(stats.tasksByStatus['in-progress'] / stats.totalTasks) * 100} 
                variant="apple"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Review</span>
                <span className="text-sm font-medium">{stats.tasksByStatus.review}</span>
              </div>
              <ProgressBar 
                value={(stats.tasksByStatus.review / stats.totalTasks) * 100} 
                variant="apple"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">{stats.tasksByStatus.done}</span>
              </div>
              <ProgressBar 
                value={(stats.tasksByStatus.done / stats.totalTasks) * 100} 
                variant="apple"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card variant="apple">
          <CardHeader>
            <h3 className="text-title-3 font-semibold text-gray-900">Recent Activities</h3>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/80 transition-all duration-200">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {format(activity.createdAt, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-6 ${canAccessProjects(state.currentUser) ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Active Projects - Only for admins and managers */}
        {canAccessProjects(state.currentUser) && (
          <Card variant="apple">
            <CardHeader>
              <h3 className="text-title-3 font-semibold text-gray-900">Active Projects</h3>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active projects</p>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/80 transition-all duration-200 group">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project.color }}
                          />
                          <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          {project.tasks.length} tasks • {project.members.length} members
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-sm font-semibold text-gray-700">{project.progress}%</span>
                        <ProgressBar 
                          value={project.progress} 
                          className="w-24" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Tasks */}
        <Card variant="apple">
          <CardHeader>
            <h3 className="text-title-3 font-semibold text-gray-900">Recent Tasks</h3>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks yet</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/80 transition-all duration-200 group">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-400">Due Date</p>
                        <p className="text-sm font-semibold text-gray-600">
                          {format(new Date(task.dueDate), 'MMM d')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
