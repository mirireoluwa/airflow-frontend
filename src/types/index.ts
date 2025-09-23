export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

export type UserStatus = 'online' | 'busy' | 'offline' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'employee' | 'admin' | 'project_manager' | 'functional_manager';
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
  assignee?: User; // Keep for backward compatibility
  assignees?: User[]; // New: multiple assignees
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
  checklist: ChecklistItem[];
  isBlocked?: boolean; // Computed property - true if any checklist items are blocked
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
  comments: Comment[];
  documents: ProjectDocument[];
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

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // MIME type
  uploadedBy: User;
  uploadedAt: Date;
  description?: string;
  accessRestricted?: boolean; // Whether access is restricted to specific team members
  allowedUsers?: string[]; // Array of user IDs who can access this document
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedBy?: User;
  completedAt?: Date;
  assignee?: User; // Keep for backward compatibility
  assignees?: User[]; // New: multiple assignees
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // IDs of other checklist items that must be completed first
  blockedBy: string[]; // IDs of checklist items that are blocking this one
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistDependency {
  id: string;
  fromItemId: string; // The item that must be completed first
  toItemId: string;   // The item that depends on the first
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'project_updated' | 'comment_added' | 'checklist_item_created' | 'checklist_item_completed' | 'checklist_item_updated';
  title: string;
  description: string;
  user: User;
  taskId?: string;
  projectId?: string;
  checklistItemId?: string;
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
