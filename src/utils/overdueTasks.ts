import type { Task, User } from '../types';

export interface OverdueTaskInfo {
  task: Task;
  assignee: User;
  daysOverdue: number;
}

export function getOverdueTasks(tasks: Task[], users: User[]): OverdueTaskInfo[] {
  const now = new Date();
  const overdueTasks: OverdueTaskInfo[] = [];

  tasks.forEach(task => {
    if (task.dueDate && task.status !== 'done') {
      const dueDate = new Date(task.dueDate);
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue > 0) {
        const assignee = users.find(user => user.id === task.assignee?.id);
        if (assignee) {
          overdueTasks.push({
            task,
            assignee,
            daysOverdue
          });
        }
      }
    }
  });

  return overdueTasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function getOverdueTasksForUser(userId: string, tasks: Task[], users: User[]): OverdueTaskInfo[] {
  return getOverdueTasks(tasks, users).filter(overdue => overdue.assignee.id === userId);
}

export function getOverdueTasksForManager(managerId: string, tasks: Task[], users: User[]): OverdueTaskInfo[] {
  const manager = users.find(user => user.id === managerId);
  if (!manager) return [];

  // Get all users under this manager's supervision
  const supervisedUsers = users.filter(user => {
    if (manager.role === 'admin') return true; // Admin sees all
    if ((manager.role === 'project_manager' || manager.role === 'functional_manager') && user.department === manager.department) return true;
    return false;
  });

  const supervisedUserIds = supervisedUsers.map(user => user.id);
  
  return getOverdueTasks(tasks, users).filter(overdue => 
    supervisedUserIds.includes(overdue.assignee.id)
  );
}

export function getOverdueTaskColor(daysOverdue: number): string {
  if (daysOverdue <= 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (daysOverdue <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function getOverdueTaskBadgeColor(daysOverdue: number): string {
  if (daysOverdue <= 1) return 'bg-yellow-500';
  if (daysOverdue <= 3) return 'bg-orange-500';
  return 'bg-red-500';
}
