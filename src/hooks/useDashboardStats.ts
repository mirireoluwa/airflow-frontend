import { useMemo } from 'react';
import { useAirflow } from '../context/AirflowContext';
import type { DashboardStats, TaskStatus, TaskPriority } from '../types';

export function useDashboardStats(): DashboardStats {
  const { state } = useAirflow();

  return useMemo(() => {
    const totalProjects = state.projects.length;
    const activeProjects = state.projects.filter(p => p.status === 'active').length;
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'done').length;
    
    const now = new Date();
    const overdueTasks = state.tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'done'
    ).length;

    const tasksByStatus = state.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    // Ensure all statuses are included
    const completeTasksByStatus: Record<TaskStatus, number> = {
      'todo': tasksByStatus['todo'] || 0,
      'in-progress': tasksByStatus['in-progress'] || 0,
      'review': tasksByStatus['review'] || 0,
      'done': tasksByStatus['done'] || 0
    };

    const tasksByPriority = state.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

    // Ensure all priorities are included
    const completeTasksByPriority: Record<TaskPriority, number> = {
      'low': tasksByPriority['low'] || 0,
      'medium': tasksByPriority['medium'] || 0,
      'high': tasksByPriority['high'] || 0,
      'urgent': tasksByPriority['urgent'] || 0
    };

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus: completeTasksByStatus,
      tasksByPriority: completeTasksByPriority
    };
  }, [state.projects, state.tasks]);
}
