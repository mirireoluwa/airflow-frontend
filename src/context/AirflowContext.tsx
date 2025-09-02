import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getOverdueTasksForUser, getOverdueTasksForManager } from '../utils/overdueTasks';
import type { AppState, Project, Task, User, Activity, Notification } from '../types';

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
  signup: (payload: { name: string; email: string; role: 'employee' | 'admin' | 'manager'; department?: string; auid: string; password: string }) => void;
  login: (payload: { email: string; password: string }) => void;
  logout: () => void;
  clearUsers: () => void;
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
  | { type: 'CLEAR_NOTIFICATIONS' };

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
    if (state.currentUser?.role === 'admin' || state.currentUser?.role === 'manager') {
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
    if (state.currentUser && (state.currentUser.role === 'admin' || state.currentUser.role === 'manager') && enforcedAssignee) {
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
      comments: []
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
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const pwdRaw = localStorage.getItem('airflow_passwords');
    const passwords: Record<string, string> = pwdRaw ? JSON.parse(pwdRaw) : {};
    const stored = passwords[email.toLowerCase()];
    if (!user || !stored || stored !== password) {
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
    
    // Add notification for profile update (essential)
    addNotification({
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      type: 'success',
      read: false,
      userId: state.currentUser.id,
      actionUrl: '/settings'
    });
    
    // Removed excessive profile update notifications - not essential
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
  };

  const markNotificationAsRead: AirflowContextType['markNotificationAsRead'] = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    
    // Removed notification read notification - not essential
  };

  const clearNotifications: AirflowContextType['clearNotifications'] = () => {
    // Removed notification clear notification - not essential
    
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
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
    } else if (user.role === 'manager' || user.role === 'admin') {
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
    // admin/manager: users within same department if defined, else all
    return current.department ? state.users.filter(u => u.department === current.department) : state.users;
  };

  const getScopedTasks = () => {
    const current = state.currentUser;
    if (!current) return [];
    if (current.role === 'employee') {
      return state.tasks.filter(t => t.assignee?.id === current.id);
    }
    // admin/manager: tasks within same department by assignee or reporter
    if (current.department) {
      return state.tasks.filter(t => (t.assignee && t.assignee.department === current.department) || t.reporter.department === current.department);
    }
    return state.tasks;
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
        updateUserProfile,
        updateUserPassword,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        getScopedUsers,
        getScopedTasks
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
