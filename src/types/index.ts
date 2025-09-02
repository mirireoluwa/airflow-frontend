export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

export type UserStatus = 'online' | 'busy' | 'offline' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'employee' | 'admin' | 'manager';
  department?: string;
  auid?: string; // 8-digit Airtel User ID
  interests?: string[];
  status?: UserStatus;
  customStatus?: string; // For custom status with emojis
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  reporter: User;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments?: string[];
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: User;
  members: User[];
  startDate: Date;
  endDate?: Date;
  progress: number; // 0-100
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  color: string; // For visual differentiation
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'project_updated' | 'comment_added';
  title: string;
  description: string;
  user: User;
  taskId?: string;
  projectId?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  projectId?: string;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  userId: string;
  actionUrl?: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  users: User[];
  activities: Activity[];
  notifications: Notification[];
  currentUser: User | null;
}
