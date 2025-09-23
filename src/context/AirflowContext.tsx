import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getOverdueTasksForUser, getOverdueTasksForManager } from '../utils/overdueTasks';
import type { AppState, Project, Task, User, Activity, Notification, ChecklistItem, Comment, ProjectDocument } from '../types';

interface AirflowContextType {
  state: AppState;
  dispatch: React.Dispatch<AirflowAction>;
  // Helper functions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  // Auth helpers
  signup: (payload: { name: string; email: string; role: 'employee' | 'admin' | 'project_manager' | 'functional_manager'; department?: string; auid: string; password: string }) => void;
  login: (payload: { email: string; password: string }) => void;
  logout: () => void;
  clearUsers: () => void;
  deleteCurrentUser: () => void;
  // User profile helpers
  updateUserProfile: (updates: Partial<User>) => void;
  updateUserPassword: (currentPassword: string, newPassword: string) => void;
  // Notification helpers
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  // Scope helpers
  getScopedUsers: () => User[];
  getScopedTasks: () => Task[];
  // Checklist helpers
  addChecklistItem: (taskId: string, item: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'dependencies' | 'blockedBy'>) => void;
  updateChecklistItem: (taskId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addChecklistDependency: (taskId: string, fromItemId: string, toItemId: string) => void;
  removeChecklistDependency: (taskId: string, fromItemId: string, toItemId: string) => void;
  validateChecklistDependencies: (taskId: string) => { isValid: boolean; errors: string[] };
  getBlockedChecklistItems: (taskId: string) => ChecklistItem[];
  // Project comments and documents
  addProjectComment: (projectId: string, content: string) => void;
  updateProjectComment: (projectId: string, commentId: string, content: string) => void;
  deleteProjectComment: (projectId: string, commentId: string) => void;
  addProjectDocument: (projectId: string, document: Omit<ProjectDocument, 'id' | 'uploadedAt'>) => void;
  deleteProjectDocument: (projectId: string, documentId: string) => void;
  updateDocumentAccess: (projectId: string, documentId: string, accessRestricted: boolean, allowedUsers: string[]) => void;
}

type AirflowAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_CHECKLIST_ITEM'; payload: { taskId: string; item: ChecklistItem } }
  | { type: 'UPDATE_CHECKLIST_ITEM'; payload: { taskId: string; itemId: string; updates: Partial<ChecklistItem> } }
  | { type: 'DELETE_CHECKLIST_ITEM'; payload: { taskId: string; itemId: string } }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; payload: { taskId: string; itemId: string } }
  | { type: 'ADD_CHECKLIST_DEPENDENCY'; payload: { taskId: string; fromItemId: string; toItemId: string } }
  | { type: 'REMOVE_CHECKLIST_DEPENDENCY'; payload: { taskId: string; fromItemId: string; toItemId: string } }
  | { type: 'ADD_PROJECT_COMMENT'; payload: { projectId: string; comment: Comment } }
  | { type: 'UPDATE_PROJECT_COMMENT'; payload: { projectId: string; commentId: string; content: string } }
  | { type: 'DELETE_PROJECT_COMMENT'; payload: { projectId: string; commentId: string } }
  | { type: 'ADD_PROJECT_DOCUMENT'; payload: { projectId: string; document: ProjectDocument } }
  | { type: 'DELETE_PROJECT_DOCUMENT'; payload: { projectId: string; documentId: string } }
  | { type: 'UPDATE_DOCUMENT_ACCESS'; payload: { projectId: string; documentId: string; accessRestricted: boolean; allowedUsers: string[] } };

const initialState: AppState = {
  projects: [],
  tasks: [],
  users: [],
  activities: [],
  notifications: [],
  currentUser: null
};

function airflowReducer(state: AppState, action: AirflowAction): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates, updatedAt: new Date() }
            : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        tasks: state.tasks.filter(task => task.projectId !== action.payload)
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.updates } : user
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? { ...state.currentUser, ...action.payload.updates } 
          : state.currentUser
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        )
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.userId !== state.currentUser?.id)
      };
    case 'ADD_CHECKLIST_ITEM':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, checklist: [...task.checklist, action.payload.item] }
            : task
        )
      };
    case 'UPDATE_CHECKLIST_ITEM':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                checklist: task.checklist.map(item =>
                  item.id === action.payload.itemId
                    ? { ...item, ...action.payload.updates, updatedAt: new Date() }
                    : item
                )
              }
            : task
        )
      };
    case 'DELETE_CHECKLIST_ITEM':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                checklist: task.checklist.filter(item => item.id !== action.payload.itemId)
              }
            : task
        )
      };
    case 'TOGGLE_CHECKLIST_ITEM':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                checklist: task.checklist.map(item =>
                  item.id === action.payload.itemId
                    ? {
                        ...item,
                        completed: !item.completed,
                        completedBy: !item.completed ? state.currentUser || undefined : undefined,
                        completedAt: !item.completed ? new Date() : undefined,
                        updatedAt: new Date()
                      }
                    : item
                )
              }
            : task
        )
      };
    case 'ADD_CHECKLIST_DEPENDENCY':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                checklist: task.checklist.map(item => {
                  if (item.id === action.payload.toItemId) {
                    return {
                      ...item,
                      dependencies: [...item.dependencies, action.payload.fromItemId],
                      updatedAt: new Date()
                    };
                  } else if (item.id === action.payload.fromItemId) {
                    return {
                      ...item,
                      blockedBy: [...item.blockedBy, action.payload.toItemId],
                      updatedAt: new Date()
                    };
                  }
                  return item;
                })
              }
            : task
        )
      };
    case 'REMOVE_CHECKLIST_DEPENDENCY':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                checklist: task.checklist.map(item => {
                  if (item.id === action.payload.toItemId) {
                    return {
                      ...item,
                      dependencies: item.dependencies.filter(dep => dep !== action.payload.fromItemId),
                      updatedAt: new Date()
                    };
                  } else if (item.id === action.payload.fromItemId) {
                    return {
                      ...item,
                      blockedBy: item.blockedBy.filter(blocked => blocked !== action.payload.toItemId),
                      updatedAt: new Date()
                    };
                  }
                  return item;
                })
              }
            : task
        )
      };
    case 'ADD_PROJECT_COMMENT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                comments: [...project.comments, action.payload.comment],
                updatedAt: new Date()
              }
            : project
        )
      };
    case 'UPDATE_PROJECT_COMMENT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                comments: project.comments.map(comment =>
                  comment.id === action.payload.commentId
                    ? { ...comment, content: action.payload.content, updatedAt: new Date() }
                    : comment
                ),
                updatedAt: new Date()
              }
            : project
        )
      };
    case 'DELETE_PROJECT_COMMENT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                comments: project.comments.filter(comment => comment.id !== action.payload.commentId),
                updatedAt: new Date()
              }
            : project
        )
      };
    case 'ADD_PROJECT_DOCUMENT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                documents: [...project.documents, action.payload.document],
                updatedAt: new Date()
              }
            : project
        )
      };
    case 'DELETE_PROJECT_DOCUMENT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                documents: project.documents.filter(doc => doc.id !== action.payload.documentId),
                updatedAt: new Date()
              }
            : project
        )
      };
    case 'UPDATE_DOCUMENT_ACCESS':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                documents: project.documents.map(doc =>
                  doc.id === action.payload.documentId
                    ? {
                        ...doc,
                        accessRestricted: action.payload.accessRestricted,
                        allowedUsers: action.payload.allowedUsers
                      }
                    : doc
                ),
                updatedAt: new Date()
              }
            : project
        )
      };
    default:
      return state;
  }
}

const AirflowContext = createContext<AirflowContextType | null>(null);

const defaultUser: User = {
  id: 'guest',
  name: 'Guest',
  email: 'guest@example.com',
  role: 'employee'
};

export function AirflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(airflowReducer, initialState);

  // Helper functions
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const project: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: []
    };
    dispatch({ type: 'ADD_PROJECT', payload: project });
    addActivity({
      type: 'project_created',
      title: 'Project Created',
      description: `Created project "${project.name}"`,
      user: state.currentUser ?? defaultUser,
      projectId: project.id
    });
    
    // Add notification for project creation to team members (essential)
    if (state.currentUser?.role === 'admin' || state.currentUser?.role === 'project_manager') {
      const teamMembers = getScopedUsers();
      teamMembers.forEach(member => {
        if (member.id !== state.currentUser?.id) {
          addNotification({
            title: 'New Project Created',
            message: `"${project.name}" project has been created by ${state.currentUser?.name}`,
            type: 'info',
            read: false,
            userId: member.id,
            actionUrl: `/projects/${project.id}`
          });
        }
      });
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
    addActivity({
      type: 'project_updated',
      title: 'Project Updated',
      description: `Updated project details`,
      user: state.currentUser ?? defaultUser,
      projectId: id
    });
  };

  const deleteProject = (id: string) => {
    const project = state.projects.find(p => p.id === id);
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    if (project) {
      addActivity({
        type: 'project_updated',
        title: 'Project Deleted',
        description: `Deleted project "${project.name}"`,
        user: state.currentUser ?? defaultUser,
        projectId: id
      });
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    // Enforce assignment rules
    let enforcedAssignee = taskData.assignee;
    if (state.currentUser?.role === 'employee') {
      enforcedAssignee = state.currentUser;
    }
    
    // Prevent non-admin managers from assigning tasks to admins
    if ((state.currentUser?.role === 'project_manager' || state.currentUser?.role === 'functional_manager') && enforcedAssignee?.role === 'admin') {
      console.warn('Managers cannot assign tasks to admins');
      enforcedAssignee = undefined;
    }
    
    // Department scoping for project managers only (functional managers can cross departments)
    if (state.currentUser && (state.currentUser.role === 'admin' || state.currentUser.role === 'project_manager') && enforcedAssignee) {
      if (state.currentUser.department && enforcedAssignee.department && state.currentUser.department !== enforcedAssignee.department) {
        // If cross-department assignment, block by scoping to same department
        enforcedAssignee = undefined;
      }
    }

    const task: Task = {
      ...taskData,
      assignee: enforcedAssignee,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      checklist: []
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    addActivity({
      type: 'task_created',
      title: 'Task Created',
      description: `Created task "${task.title}"`,
      user: state.currentUser ?? defaultUser,
      taskId: task.id,
      projectId: task.projectId
    });
    
    // Add notification for task assignment (essential)
    if (task.assignee && task.assignee.id !== state.currentUser?.id) {
      addNotification({
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        type: 'info',
        read: false,
        userId: task.assignee.id,
        actionUrl: `/tasks`
      });
    }
    
    // Add notifications for multiple assignees
    if (task.assignees && Array.isArray(task.assignees)) {
      task.assignees.forEach((assignee: any) => {
        if (assignee.id !== state.currentUser?.id) {
          addNotification({
            title: 'New Task Assigned',
            message: `You have been assigned to "${task.title}"`,
            type: 'info',
            read: false,
            userId: assignee.id,
            actionUrl: `/tasks`
          });
        }
      });
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const task = state.tasks.find(t => t.id === id);
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    
    if (task && updates.status === 'done' && task.status !== 'done') {
      addActivity({
        type: 'task_completed',
        title: 'Task Completed',
        description: `Completed task "${task.title}"`,
        user: state.currentUser ?? defaultUser,
        taskId: id,
        projectId: task.projectId
      });
      
      // Add notification for task completion (essential)
      if (task.assignee && task.assignee.id !== state.currentUser?.id) {
        addNotification({
          title: 'Task Completed',
          message: `"${task.title}" has been marked as completed`,
          type: 'success',
          read: false,
          userId: task.assignee.id,
          actionUrl: `/tasks`
        });
      }
    } else {
      addActivity({
        type: 'task_updated',
        title: 'Task Updated',
        description: `Updated task "${task?.title || 'Unknown'}"`,
        user: state.currentUser ?? defaultUser,
        taskId: id,
        projectId: task?.projectId
      });
    }
  };

  const deleteTask = (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    dispatch({ type: 'DELETE_TASK', payload: id });
    if (task) {
      addActivity({
        type: 'task_updated',
        title: 'Task Deleted',
        description: `Deleted task "${task.title}"`,
        user: state.currentUser ?? defaultUser,
        taskId: id,
        projectId: task.projectId
      });
    }
  };

  const addActivity = (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const activity: Activity = {
      ...activityData,
      id: generateId(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  };

  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadData = async () => {
      try {
        const { sampleUsers, sampleProjects, sampleTasks } = await import('../utils/sampleData');
        const storedUsersRaw = localStorage.getItem('airflow_users');
        const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : sampleUsers;
        dispatch({ type: 'SET_USERS', payload: users });
        dispatch({ type: 'SET_PROJECTS', payload: sampleProjects });
        dispatch({ type: 'SET_TASKS', payload: sampleTasks });
        
        // Set default passwords for sample users (demo only)
        if (!storedUsersRaw) {
          const passwords: Record<string, string> = {};
          sampleUsers.forEach(user => {
            passwords[user.email.toLowerCase()] = 'password123';
          });
          localStorage.setItem('airflow_passwords', JSON.stringify(passwords));
          
          // Add sample notifications
          const sampleNotifications = [
            {
              id: generateId(),
              title: 'Welcome to Airflow!',
              message: 'Your account has been successfully created. Start managing your projects and tasks.',
              type: 'success' as const,
              read: false,
              createdAt: new Date(),
              userId: sampleUsers[0].id,
              actionUrl: '/dashboard'
            },
            {
              id: generateId(),
              title: 'New Project Assigned',
              message: 'You have been assigned to the "Mobile App Redesign" project.',
              type: 'info' as const,
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              userId: sampleUsers[0].id,
              actionUrl: '/projects'
            },
            {
              id: generateId(),
              title: 'Task Deadline Approaching',
              message: 'The "User Authentication" task is due in 2 days.',
              type: 'warning' as const,
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              userId: sampleUsers[0].id,
              actionUrl: '/tasks'
            }
          ];
          dispatch({ type: 'SET_NOTIFICATIONS', payload: sampleNotifications });
          localStorage.setItem('airflow_notifications', JSON.stringify(sampleNotifications));
        } else {
          // Load notifications from localStorage
          const storedNotifications = JSON.parse(localStorage.getItem('airflow_notifications') || '[]');
          dispatch({ type: 'SET_NOTIFICATIONS', payload: storedNotifications });
        }
        
        const stored = localStorage.getItem('airflow_current_user');
        if (stored) {
          try {
            const user: User = JSON.parse(stored);
            dispatch({ type: 'SET_CURRENT_USER', payload: user });
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    };
    
    loadData();
  }, []);

  // Auth helpers (client-side demo only)
  const signup: AirflowContextType['signup'] = ({ name, email, role, department, auid, password }) => {
    const newUser: User = {
      id: generateId(),
      name,
      email,
      role,
      department,
      auid
    };
    const updatedUsers = [...state.users, newUser];
    dispatch({ type: 'SET_USERS', payload: updatedUsers });
    localStorage.setItem('airflow_users', JSON.stringify(updatedUsers));
    // store password (demo only - not secure)
    const pwdRaw = localStorage.getItem('airflow_passwords');
    const passwords: Record<string, string> = pwdRaw ? JSON.parse(pwdRaw) : {};
    passwords[email.toLowerCase()] = password;
    localStorage.setItem('airflow_passwords', JSON.stringify(passwords));
    
    // Add welcome notification (essential)
    addNotification({
      title: 'Welcome to Airflow!',
      message: 'Your account has been successfully created. Start exploring the platform!',
      type: 'success',
      read: false,
      userId: newUser.id,
      actionUrl: '/dashboard'
    });
    
    // Don't auto-login after signup - user should login manually
  };

  const login: AirflowContextType['login'] = ({ email, password }) => {
    console.log('Login attempt:', { email, password });
    console.log('Current users in state:', state.users);
    
    // Try to find user in current state first
    let user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If not found in state, try to load from localStorage
    if (!user) {
      console.log('User not found in state, checking localStorage...');
      const storedUsersRaw = localStorage.getItem('airflow_users');
      if (storedUsersRaw) {
        const users = JSON.parse(storedUsersRaw);
        user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        console.log('Found user in localStorage:', user);
      }
    }
    
    console.log('Final user found:', user);
    const pwdRaw = localStorage.getItem('airflow_passwords');
    const passwords: Record<string, string> = pwdRaw ? JSON.parse(pwdRaw) : {};
    console.log('Stored passwords:', passwords);
    const stored = passwords[email.toLowerCase()];
    console.log('Stored password for email:', stored);
    if (!user || !stored || stored !== password) {
      console.log('Login failed - invalid credentials');
      throw new Error('Invalid credentials');
    }
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
    localStorage.setItem('airflow_current_user', JSON.stringify(user));
    
    // Check if this is the user's very first login
    const firstLoginKey = `airflow_first_login_${user.email.toLowerCase()}`;
    const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
    
    // Check if this is the first login of the day
    const today = new Date().toISOString().slice(0, 10);
    const loginKey = `airflow_login_${user.id}_${today}`;
    const hasLoggedInToday = localStorage.getItem(loginKey);
    
          if (!hasLoggedInToday) {
        localStorage.setItem(loginKey, '1');
        
        if (!hasLoggedInBefore) {
          // This is their very first login (essential)
          addNotification({
            title: '🎉 First Time Login!',
            message: `Welcome to Airflow, ${user.name}! This is your first time logging in. Let's get started!`,
            type: 'success',
            read: false,
            userId: user.id,
            actionUrl: '/dashboard'
          });
        }
        // Removed daily login notification - not essential
      }
      
      // Check for overdue tasks and send notifications
      checkAndNotifyOverdueTasks(user);
  };

  const clearUsers: AirflowContextType['clearUsers'] = () => {
    // Removed notification - not essential
    
    dispatch({ type: 'SET_USERS', payload: [] });
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    localStorage.removeItem('airflow_users');
    localStorage.removeItem('airflow_passwords');
    localStorage.removeItem('airflow_current_user');
    
    // Clear all first login flags for development
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('airflow_first_login_') || key.startsWith('airflow_welcome_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const logout: AirflowContextType['logout'] = () => {
    // Removed logout notification - not essential
    
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    localStorage.removeItem('airflow_current_user');
  };

  const deleteCurrentUser: AirflowContextType['deleteCurrentUser'] = () => {
    const user = state.currentUser;
    if (!user) return;

    // Remove user from state
    const remainingUsers = state.users.filter(u => u.id !== user.id);
    dispatch({ type: 'SET_USERS', payload: remainingUsers });

    // Persist users
    localStorage.setItem('airflow_users', JSON.stringify(remainingUsers));

    // Remove stored password for this user
    const pwdRaw = localStorage.getItem('airflow_passwords');
    const passwords: Record<string, string> = pwdRaw ? JSON.parse(pwdRaw) : {};
    if (passwords[user.email.toLowerCase()]) {
      delete passwords[user.email.toLowerCase()];
      localStorage.setItem('airflow_passwords', JSON.stringify(passwords));
    }

    // Remove this user's notifications
    const storedNotifications = JSON.parse(localStorage.getItem('airflow_notifications') || '[]');
    const filteredNotifications = storedNotifications.filter((n: Notification) => n.userId !== user.id);
    localStorage.setItem('airflow_notifications', JSON.stringify(filteredNotifications));
    dispatch({ type: 'SET_NOTIFICATIONS', payload: filteredNotifications });

    // Log out and clear current user
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    localStorage.removeItem('airflow_current_user');
  };



  // User profile helpers
  const updateUserProfile: AirflowContextType['updateUserProfile'] = (updates) => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, updates } });
    // Update localStorage
    const updatedUser = { ...state.currentUser, ...updates };
    localStorage.setItem('airflow_current_user', JSON.stringify(updatedUser));
    // Update users list in localStorage
    const users = JSON.parse(localStorage.getItem('airflow_users') || '[]');
    const updatedUsers = users.map((u: User) => u.id === state.currentUser?.id ? updatedUser : u);
    localStorage.setItem('airflow_users', JSON.stringify(updatedUsers));
    
    // Removed profile update notification - not essential
  };

  const updateUserPassword: AirflowContextType['updateUserPassword'] = (currentPassword, newPassword) => {
    if (!state.currentUser) throw new Error('No user logged in');
    const pwdRaw = localStorage.getItem('airflow_passwords');
    const passwords: Record<string, string> = pwdRaw ? JSON.parse(pwdRaw) : {};
    const stored = passwords[state.currentUser.email.toLowerCase()];
    if (!stored || stored !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    passwords[state.currentUser.email.toLowerCase()] = newPassword;
    localStorage.setItem('airflow_passwords', JSON.stringify(passwords));
    
    // Removed password change notification - not essential
  };

  // Notification helpers
  const addNotification: AirflowContextType['addNotification'] = (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Persist to localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('airflow_notifications') || '[]');
    const updatedNotifications = [notification, ...storedNotifications];
    localStorage.setItem('airflow_notifications', JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead: AirflowContextType['markNotificationAsRead'] = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    
    // Persist to localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('airflow_notifications') || '[]');
    const updatedNotifications = storedNotifications.map((n: Notification) => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('airflow_notifications', JSON.stringify(updatedNotifications));
  };

  const clearNotifications: AirflowContextType['clearNotifications'] = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    
    // Persist to localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('airflow_notifications') || '[]');
    const updatedNotifications = storedNotifications.filter((n: Notification) => n.userId !== state.currentUser?.id);
    localStorage.setItem('airflow_notifications', JSON.stringify(updatedNotifications));
  };

  // Overdue task checking
  const checkAndNotifyOverdueTasks = (user: User) => {
    const today = new Date().toISOString().slice(0, 10);
    const overdueCheckKey = `overdue_check_${user.id}_${today}`;
    const hasCheckedToday = localStorage.getItem(overdueCheckKey);
    
    if (hasCheckedToday) return; // Only check once per day
    
    localStorage.setItem(overdueCheckKey, '1');
    
    if (user.role === 'employee') {
      // Check for employee's overdue tasks
      const overdueTasks = getOverdueTasksForUser(user.id, state.tasks, state.users);
      
      overdueTasks.forEach(overdue => {
        addNotification({
          title: '⚠️ Overdue Task Alert',
          message: `"${overdue.task.title}" is ${overdue.daysOverdue} day${overdue.daysOverdue > 1 ? 's' : ''} overdue. Please prioritize this task.`,
          type: 'warning',
          read: false,
          userId: user.id,
          actionUrl: `/tasks`
        });
      });
    } else if (user.role === 'project_manager' || user.role === 'functional_manager' || user.role === 'admin') {
      // Check for team's overdue tasks
      const overdueTasks = getOverdueTasksForManager(user.id, state.tasks, state.users);
      
      overdueTasks.forEach(overdue => {
        addNotification({
          title: '🚨 Team Overdue Task',
          message: `"${overdue.task.title}" assigned to ${overdue.assignee.name} is ${overdue.daysOverdue} day${overdue.daysOverdue > 1 ? 's' : ''} overdue.`,
          type: 'error',
          read: false,
          userId: user.id,
          actionUrl: `/tasks`
        });
      });
    }
  };

  // Scope helpers
  const getScopedUsers = () => {
    const current = state.currentUser;
    if (!current) return [];
    if (current.role === 'employee') return [current];
    // functional_manager: org-wide; project_manager/admin: department if defined else all
    if (current.role === 'functional_manager') return state.users;
    return current.department ? state.users.filter(u => u.department === current.department) : state.users;
  };

  const getScopedTasks = () => {
    const current = state.currentUser;
    if (!current) return [];
    if (current.role === 'employee') {
      return state.tasks.filter(t => t.assignee?.id === current.id);
    }
    // functional_manager: all tasks; project_manager/admin: tasks within same department by assignee or reporter
    if (current.role === 'functional_manager') {
      return state.tasks;
    }
    if (current.department) {
      return state.tasks.filter(t => (t.assignee && t.assignee.department === current.department) || t.reporter.department === current.department);
    }
    return state.tasks;
  };

  // Checklist helpers
  const addChecklistItem: AirflowContextType['addChecklistItem'] = (taskId, itemData) => {
    const item: ChecklistItem = {
      ...itemData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: [],
      blockedBy: []
    };
    
    dispatch({ type: 'ADD_CHECKLIST_ITEM', payload: { taskId, item } });
    
    addActivity({
      type: 'checklist_item_created',
      title: 'Checklist Item Added',
      description: `Added "${item.title}" to checklist`,
      user: state.currentUser ?? defaultUser,
      taskId,
      checklistItemId: item.id
    });
  };

  const updateChecklistItem: AirflowContextType['updateChecklistItem'] = (taskId, itemId, updates) => {
    // Get the task and current checklist item to check for assignee changes
    const task = state.tasks.find(t => t.id === taskId);
    const currentItem = task?.checklist?.find(item => item.id === itemId);
    
    dispatch({ type: 'UPDATE_CHECKLIST_ITEM', payload: { taskId, itemId, updates } });
    
    // Check if assignees were added and send notifications
    if (updates.assignees && Array.isArray(updates.assignees)) {
      const newAssignees = updates.assignees.filter((newAssignee: any) => 
        !currentItem?.assignees?.some((existingAssignee: any) => existingAssignee.id === newAssignee.id)
      );
      
      newAssignees.forEach((assignee: any) => {
        if (assignee.id !== state.currentUser?.id) {
          addNotification({
            title: '📋 Checklist Item Assigned',
            message: `You have been assigned to "${updates.title || currentItem?.title || 'a checklist item'}" in "${task?.title || 'a task'}"`,
            type: 'info',
            read: false,
            userId: assignee.id,
            actionUrl: `/tasks/${taskId}`
          });
        }
      });
    }
    
    // Check if single assignee was added and send notification
    if (updates.assignee && updates.assignee.id !== state.currentUser?.id) {
      addNotification({
        title: '📋 Checklist Item Assigned',
        message: `You have been assigned to "${updates.title || currentItem?.title || 'a checklist item'}" in "${task?.title || 'a task'}"`,
        type: 'info',
        read: false,
        userId: updates.assignee.id,
        actionUrl: `/tasks/${taskId}`
      });
    }
    
    addActivity({
      type: 'checklist_item_updated',
      title: 'Checklist Item Updated',
      description: `Updated checklist item`,
      user: state.currentUser ?? defaultUser,
      taskId,
      checklistItemId: itemId
    });
  };

  const deleteChecklistItem: AirflowContextType['deleteChecklistItem'] = (taskId, itemId) => {
    dispatch({ type: 'DELETE_CHECKLIST_ITEM', payload: { taskId, itemId } });
    
    addActivity({
      type: 'checklist_item_updated',
      title: 'Checklist Item Deleted',
      description: `Deleted checklist item`,
      user: state.currentUser ?? defaultUser,
      taskId,
      checklistItemId: itemId
    });
  };

  const toggleChecklistItem: AirflowContextType['toggleChecklistItem'] = (taskId, itemId) => {
    const task = state.tasks.find(t => t.id === taskId);
    const item = task?.checklist.find(i => i.id === itemId);
    
    if (!item) return;
    
    const wasCompleted = item.completed;
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: { taskId, itemId } });
    
    // Add activity and notification for completion
    if (!wasCompleted) {
      addActivity({
        type: 'checklist_item_completed',
        title: 'Checklist Item Completed',
        description: `Completed "${item.title}"`,
        user: state.currentUser ?? defaultUser,
        taskId,
        checklistItemId: itemId
      });
      
      // Removed checklist item completion notification - too granular
      
      // Check if this completion unblocks other items
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        const unblockedItems = task.checklist.filter(i => 
          i.dependencies.includes(itemId) && 
          i.dependencies.every(depId => 
            task.checklist.find(dep => dep.id === depId)?.completed
          )
        );
        
        unblockedItems.forEach(unblockedItem => {
          if (unblockedItem.assignee && unblockedItem.assignee.id !== state.currentUser?.id) {
            addNotification({
              title: 'Checklist Item Unblocked',
              message: `"${unblockedItem.title}" is now available to work on`,
              type: 'info',
              read: false,
              userId: unblockedItem.assignee.id,
              actionUrl: `/tasks`
            });
          }
        });
      }
    }
  };

  const addChecklistDependency: AirflowContextType['addChecklistDependency'] = (taskId, fromItemId, toItemId) => {
    // Validate no circular dependency
    const validation = validateChecklistDependencies(taskId);
    if (!validation.isValid) {
      throw new Error(`Cannot add dependency: ${validation.errors.join(', ')}`);
    }
    
    dispatch({ type: 'ADD_CHECKLIST_DEPENDENCY', payload: { taskId, fromItemId, toItemId } });
  };

  const removeChecklistDependency: AirflowContextType['removeChecklistDependency'] = (taskId, fromItemId, toItemId) => {
    dispatch({ type: 'REMOVE_CHECKLIST_DEPENDENCY', payload: { taskId, fromItemId, toItemId } });
  };

  const validateChecklistDependencies: AirflowContextType['validateChecklistDependencies'] = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return { isValid: false, errors: ['Task not found'] };
    
    const errors: string[] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    const hasCycle = (itemId: string): boolean => {
      if (recStack.has(itemId)) return true;
      if (visited.has(itemId)) return false;
      
      visited.add(itemId);
      recStack.add(itemId);
      
      const item = task.checklist.find(i => i.id === itemId);
      if (item) {
        for (const depId of item.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }
      
      recStack.delete(itemId);
      return false;
    };
    
    for (const item of task.checklist) {
      if (hasCycle(item.id)) {
        errors.push(`Circular dependency detected involving "${item.title}"`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const getBlockedChecklistItems: AirflowContextType['getBlockedChecklistItems'] = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return [];
    
    return task.checklist.filter(item => 
      !item.completed && 
      item.dependencies.some(depId => 
        !task.checklist.find(dep => dep.id === depId)?.completed
      )
    );
  };

  // Project comments and documents
  const addProjectComment: AirflowContextType['addProjectComment'] = (projectId, content) => {
    const comment: Comment = {
      id: generateId(),
      content,
      author: state.currentUser ?? defaultUser,
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_PROJECT_COMMENT', payload: { projectId, comment } });
    
    addActivity({
      type: 'comment_added',
      title: 'Project Comment Added',
      description: `Added a comment to project`,
      user: state.currentUser ?? defaultUser,
      projectId
    });

    // Send notifications to all project members (except the comment author)
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.members.forEach(member => {
        if (member.id !== state.currentUser?.id) {
          addNotification({
            title: '💬 New Project Comment',
            message: `${state.currentUser?.name} added a comment to "${project.name}"`,
            type: 'info',
            read: false,
            userId: member.id,
            actionUrl: `/projects/${projectId}`
          });
        }
      });
    }
  };

  const updateProjectComment: AirflowContextType['updateProjectComment'] = (projectId, commentId, content) => {
    dispatch({ type: 'UPDATE_PROJECT_COMMENT', payload: { projectId, commentId, content } });
    
    addActivity({
      type: 'comment_added',
      title: 'Project Comment Updated',
      description: `Updated a comment in project`,
      user: state.currentUser ?? defaultUser,
      projectId
    });
  };

  const deleteProjectComment: AirflowContextType['deleteProjectComment'] = (projectId, commentId) => {
    dispatch({ type: 'DELETE_PROJECT_COMMENT', payload: { projectId, commentId } });
    
    addActivity({
      type: 'comment_added',
      title: 'Project Comment Deleted',
      description: `Deleted a comment from project`,
      user: state.currentUser ?? defaultUser,
      projectId
    });
  };

  const addProjectDocument: AirflowContextType['addProjectDocument'] = (projectId, documentData) => {
    const document: ProjectDocument = {
      ...documentData,
      id: generateId(),
      uploadedAt: new Date()
    };
    
    dispatch({ type: 'ADD_PROJECT_DOCUMENT', payload: { projectId, document } });
    
    addActivity({
      type: 'project_updated',
      title: 'Document Uploaded',
      description: `Uploaded "${document.name}" to project`,
      user: state.currentUser ?? defaultUser,
      projectId
    });

    // Send notifications to all project members (except the uploader)
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.members.forEach(member => {
        if (member.id !== state.currentUser?.id) {
          addNotification({
            title: '📄 New Project Document',
            message: `${state.currentUser?.name} uploaded "${document.name}" to "${project.name}"`,
            type: 'info',
            read: false,
            userId: member.id,
            actionUrl: `/projects/${projectId}`
          });
        }
      });
    }
  };

  const deleteProjectDocument: AirflowContextType['deleteProjectDocument'] = (projectId, documentId) => {
    const project = state.projects.find(p => p.id === projectId);
    const document = project?.documents.find(d => d.id === documentId);
    
    dispatch({ type: 'DELETE_PROJECT_DOCUMENT', payload: { projectId, documentId } });
    
    addActivity({
      type: 'project_updated',
      title: 'Document Deleted',
      description: `Deleted "${document?.name || 'document'}" from project`,
      user: state.currentUser ?? defaultUser,
      projectId
    });
  };

  const updateDocumentAccess: AirflowContextType['updateDocumentAccess'] = (projectId, documentId, accessRestricted, allowedUsers) => {
    const project = state.projects.find(p => p.id === projectId);
    const document = project?.documents.find(d => d.id === documentId);
    
    dispatch({ type: 'UPDATE_DOCUMENT_ACCESS', payload: { projectId, documentId, accessRestricted, allowedUsers } });
    
    addActivity({
      type: 'project_updated',
      title: 'Document Access Updated',
      description: `${accessRestricted ? 'Restricted' : 'Opened'} access to "${document?.name || 'document'}"`,
      user: state.currentUser ?? defaultUser,
      projectId
    });
  };

  return (
    <AirflowContext.Provider
      value={{
        state,
        dispatch,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addActivity,
        signup,
        login,
        logout,
        clearUsers,
        deleteCurrentUser,
        updateUserProfile,
        updateUserPassword,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        getScopedUsers,
        getScopedTasks,
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        toggleChecklistItem,
        addChecklistDependency,
        removeChecklistDependency,
        validateChecklistDependencies,
        getBlockedChecklistItems,
        addProjectComment,
        updateProjectComment,
        deleteProjectComment,
        addProjectDocument,
        deleteProjectDocument,
        updateDocumentAccess
      }}
    >
      {children}
    </AirflowContext.Provider>
  );
}

export function useAirflow() {
  const context = useContext(AirflowContext);
  if (!context) {
    throw new Error('useAirflow must be used within an AirflowProvider');
  }
  return context;
}

// Utility function to generate IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
