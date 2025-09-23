import type { User } from '../types';

export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const canAccessAnalytics = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'project_manager', 'functional_manager']);
};

export const canAccessKanban = (user: User | null): boolean => {
  return hasRole(user, ['employee', 'project_manager', 'functional_manager']);
};

export const canAccessAdminFeatures = (user: User | null): boolean => {
  return hasRole(user, ['admin']);
};

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'functional_manager']);
};

export const canAccessTaskDetails = (user: User | null, task: any): boolean => {
  if (!user) {
    return false;
  }
  
  // Admins and managers (both PM and FM) can see all tasks
  if (hasRole(user, ['admin', 'project_manager', 'functional_manager'])) {
    return true;
  }
  
  // Employees can see tasks assigned to them, created by them, or where they are assigned to checklist items
  if (user.role === 'employee') {
    return isEmployeeAssignedToTask(user, task);
  }
  
  return false;
};

// Helper function to check if an employee is assigned to a task
export const isEmployeeAssignedToTask = (user: User, task: any): boolean => {
  // Check if employee is assigned to the task (single or multiple assignees)
  if (task.assignee?.id === user.id || task.reporter?.id === user.id) {
    return true;
  }
  
  // Check if employee is in the multiple assignees list
  if (task.assignees && Array.isArray(task.assignees)) {
    const isInAssignees = task.assignees.some((assignee: any) => assignee.id === user.id);
    if (isInAssignees) {
      return true;
    }
  }
  
  // Check if employee is assigned to any checklist item (single or multiple assignees)
  if (task.checklist && Array.isArray(task.checklist)) {
    const isAssignedToChecklistItem = task.checklist.some((item: any) => {
      // Check single assignee
      if (item.assignee && item.assignee.id === user.id) {
        return true;
      }
      // Check multiple assignees
      if (item.assignees && Array.isArray(item.assignees)) {
        return item.assignees.some((assignee: any) => assignee.id === user.id);
      }
      return false;
    });
    if (isAssignedToChecklistItem) {
      return true;
    }
  }
  
  return false;
};

// Function to filter tasks based on user access
export const getAccessibleTasks = (user: User | null, tasks: any[]): any[] => {
  if (!user) return [];
  
  // Admins and managers (both PM and FM) can see all tasks
  if (hasRole(user, ['admin', 'project_manager', 'functional_manager'])) {
    return tasks;
  }
  
  // Employees can only see tasks they're assigned to
  if (user.role === 'employee') {
    return tasks.filter(task => isEmployeeAssignedToTask(user, task));
  }
  
  return [];
};

export const canEditTask = (user: User | null, task: any, allUsers: User[] = []): boolean => {
  if (!user) return false;
  
  // Admins can edit all tasks
  if (user.role === 'admin') return true;
  
  // Project managers can edit tasks assigned to people in their department or that they reported
  if (user.role === 'project_manager') {
    if (task.assignee?.id) {
      const assignee = allUsers.find(u => u.id === task.assignee.id);
      return assignee?.department === user.department;
    }
    return task.reporter?.id === user.id;
  }

  // Functional managers generally don't edit task content
  if (user.role === 'functional_manager') {
    return false;
  }
  
  // Employees can edit tasks assigned to them or where they are assigned to checklist items
  if (user.role === 'employee') {
    // Check if employee is assigned to the task (single or multiple assignees)
    if (task.assignee?.id === user.id) {
      return true;
    }
    
    // Check if employee is in the multiple assignees list
    if (task.assignees && Array.isArray(task.assignees)) {
      const isInAssignees = task.assignees.some((assignee: any) => assignee.id === user.id);
      if (isInAssignees) {
        return true;
      }
    }
    
    // Check if employee is assigned to any checklist item (single or multiple assignees)
    if (task.checklist && Array.isArray(task.checklist)) {
      const isAssignedToChecklistItem = task.checklist.some((item: any) => {
        // Check single assignee
        if (item.assignee && item.assignee.id === user.id) {
          return true;
        }
        // Check multiple assignees
        if (item.assignees && Array.isArray(item.assignees)) {
          return item.assignees.some((assignee: any) => assignee.id === user.id);
        }
        return false;
      });
      if (isAssignedToChecklistItem) {
        return true;
      }
    }
    
    return false;
  }
  
  return false;
};

export const canAccessProjects = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'project_manager', 'functional_manager']);
};

export const canAccessProjectDetails = (user: User | null): boolean => {
  if (!user) return false;
  
  // Admins and managers (both PM and FM) can see all projects
  if (hasRole(user, ['admin', 'project_manager', 'functional_manager'])) {
    return true;
  }
  
  // Employees cannot access project details
  return false;
};

export const canCreateProjects = (user: User | null): boolean => {
  // Only admin and project managers can create projects
  return hasRole(user, ['admin', 'project_manager']);
};

export const canEditProjects = (user: User | null): boolean => {
  // Only admin and project managers can edit project details
  return hasRole(user, ['admin', 'project_manager']);
};

export const getAssignableUsers = (currentUser: User | null, allUsers: User[]): User[] => {
  if (!currentUser) return [];
  
  // Admins can assign to anyone
  if (currentUser.role === 'admin') {
    return allUsers;
  }
  
  // Functional managers can assign to anyone except admins
  if (currentUser.role === 'functional_manager') {
    return allUsers.filter(user => user.role !== 'admin');
  }

  // Project managers can assign to employees in their department (and themselves), not admins
  if (currentUser.role === 'project_manager') {
    return allUsers.filter(user => user.role !== 'admin' && (!currentUser.department || user.department === currentUser.department));
  }
  
  // Employees can only assign to themselves (if allowed)
  if (currentUser.role === 'employee') {
    return [currentUser];
  }
  
  return [];
};

// New helpers for capability gating
export const canAssignMembersToProjects = (user: User | null): boolean => {
  // Functional manager or admin
  return hasRole(user, ['admin', 'functional_manager']);
};

export const canEditTaskDependencies = (user: User | null): boolean => {
  // Project manager or admin
  return hasRole(user, ['admin', 'project_manager']);
};

// Document access management functions
export const canManageDocumentAccess = (user: User | null, document?: any): boolean => {
  if (!user) return false;
  
  // Admins can manage all document access
  if (user.role === 'admin') return true;
  
  // Functional managers can manage all document access
  if (user.role === 'functional_manager') return true;
  
  // Document uploaders can manage access to their own documents
  if (document && document.uploadedBy && document.uploadedBy.id === user.id) {
    return true;
  }
  
  return false;
};

export const canAccessDocument = (user: User | null, document: any, project: any): boolean => {
  if (!user) return false;
  
  // Admins can access all documents
  if (user.role === 'admin') return true;
  
  // Document uploaders always have access to their own documents
  if (document.uploadedBy && document.uploadedBy.id === user.id) {
    return true;
  }
  
  // If document is not access restricted, all project members can access it
  if (!document.accessRestricted) {
    return project.members.some((member: User) => member.id === user.id);
  }
  
  // If document is access restricted, check if user is in allowed users list
  if (document.allowedUsers && document.allowedUsers.includes(user.id)) {
    return true;
  }
  
  // Functional managers can access all documents in projects they manage
  if (user.role === 'functional_manager') {
    return project.members.some((member: User) => member.id === user.id);
  }
  
  return false;
};
