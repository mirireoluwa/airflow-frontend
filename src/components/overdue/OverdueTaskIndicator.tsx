import { AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAirflow } from '../../context/AirflowContext';
import { getOverdueTasksForUser, getOverdueTasksForManager, getOverdueTaskColor } from '../../utils/overdueTasks';
import { canAccessTaskDetails, getAccessibleTasks } from '../../utils/roleUtils';

export function OverdueTaskIndicator() {
  const { state } = useAirflow();
  const navigate = useNavigate();
  
  if (!state.currentUser) return null;

  // Get accessible tasks first, then filter for overdue
  const accessibleTasks = getAccessibleTasks(state.currentUser, state.tasks);
  const overdueTasks = state.currentUser.role === 'employee' 
    ? getOverdueTasksForUser(state.currentUser.id, accessibleTasks, state.users)
    : getOverdueTasksForManager(state.currentUser.id, accessibleTasks, state.users);

  if (overdueTasks.length === 0) return null;

  const totalOverdue = overdueTasks.length;
  const criticalOverdue = overdueTasks.filter(task => task.daysOverdue > 3).length;

  const handleTaskClick = (taskId: string) => {
    if (canAccessTaskDetails(state.currentUser, { id: taskId } as any)) {
      navigate(`/tasks/${taskId}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-xl">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Overdue Tasks Alert</h3>
          <p className="text-sm text-gray-600">
            {state.currentUser.role === 'employee' 
              ? 'You have overdue tasks that need attention'
              : 'Your team has overdue tasks that need attention'
            }
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {overdueTasks.slice(0, 3).map((overdue) => (
          <div 
            key={overdue.task.id}
            className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${getOverdueTaskColor(overdue.daysOverdue)}`}
            onClick={() => handleTaskClick(overdue.task.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTaskClick(overdue.task.id);
              }
            }}
            aria-label={`View details for overdue task: ${overdue.task.title}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{overdue.task.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    {overdue.daysOverdue} day{overdue.daysOverdue > 1 ? 's' : ''} overdue
                  </span>
                  {state.currentUser?.role !== 'employee' && (
                    <span className="text-xs text-gray-500">
                      • {overdue.assignee.name}
                    </span>
                  )}
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                overdue.daysOverdue <= 1 ? 'bg-yellow-100 text-yellow-800' :
                overdue.daysOverdue <= 3 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {overdue.daysOverdue <= 1 ? 'Recent' :
                 overdue.daysOverdue <= 3 ? 'Moderate' : 'Critical'}
              </div>
            </div>
          </div>
        ))}
        
        {totalOverdue > 3 && (
          <div className="text-center pt-2">
            <span className="text-sm text-gray-500">
              +{totalOverdue - 3} more overdue task{totalOverdue - 3 > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-red-600">{criticalOverdue}</span> critical,{' '}
            <span className="font-medium text-orange-600">{totalOverdue - criticalOverdue}</span> moderate
          </div>
          <button
            onClick={() => navigate('/tasks?filter=overdue')}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors touch-target"
          >
            View All Overdue Tasks →
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Overdue:</span>
          <span className="font-semibold text-red-600">{totalOverdue}</span>
        </div>
        {criticalOverdue > 0 && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Critical (&gt;3 days):</span>
            <span className="font-semibold text-red-700">{criticalOverdue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
