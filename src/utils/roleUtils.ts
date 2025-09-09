import type { User } from '../types';

export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const canAccessAnalytics = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'manager']);
};

export const canAccessKanban = (user: User | null): boolean => {
  return hasRole(user, ['employee', 'manager']);
};

export const canAccessAdminFeatures = (user: User | null): boolean => {
  return hasRole(user, ['admin']);
};

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'manager']);
};

export const canAccessTaskDetails = (user: User | null, task: any): boolean => {
  if (!user) return false;
  
  // Admins and managers can see all tasks
  if (hasRole(user, ['admin', 'manager'])) return true;
  
  // Employees can see tasks assigned to them or created by them
  if (user.role === 'employee') {
    return task.assignee?.id === user.id || task.reporter?.id === user.id;
  }
  
  return false;
};

export const getAssignableUsers = (currentUser: User | null, allUsers: User[]): User[] => {
  if (!currentUser) return [];
  
  // Admins can assign to anyone
  if (currentUser.role === 'admin') {
    return allUsers;
  }
  
  // Managers can assign to employees and other managers, but NOT to admins
  if (currentUser.role === 'manager') {
    return allUsers.filter(user => user.role !== 'admin');
  }
  
  // Employees can only assign to themselves (if allowed)
  if (currentUser.role === 'employee') {
    return [currentUser];
  }
  
  return [];
};
