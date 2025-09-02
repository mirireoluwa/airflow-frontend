import type { Project, Task, User, ProjectStatus, TaskStatus, TaskPriority } from '../types';

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'Engineering',
    auid: '12345678',
    status: 'online',
    interests: ['Project Management', 'Team Leadership', 'System Architecture']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager',
    department: 'Product',
    auid: '87654321',
    status: 'busy',
    interests: ['Product Strategy', 'User Experience', 'Agile Development']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'employee',
    department: 'Engineering',
    auid: '11223344',
    status: 'online',
    interests: ['Frontend Development', 'React', 'UI/UX Design']
  },
  {
    id: '4',
    name: 'Alice Wilson',
    email: 'alice.wilson@example.com',
    role: 'employee',
    department: 'Design',
    auid: '44332211',
    status: 'offline',
    interests: ['Visual Design', 'Brand Identity', 'Creative Direction']
  }
];

export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX principles.',
    status: 'active' as ProjectStatus,
    owner: sampleUsers[0],
    members: [sampleUsers[0], sampleUsers[1], sampleUsers[2]],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-15'),
    progress: 65,
    tasks: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    color: '#3B82F6'
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Develop a cross-platform mobile application for our services.',
    status: 'active' as ProjectStatus,
    owner: sampleUsers[1],
    members: [sampleUsers[1], sampleUsers[2], sampleUsers[3]],
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-01'),
    progress: 30,
    tasks: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20'),
    color: '#10B981'
  },
  {
    id: 'project-3',
    name: 'Database Migration',
    description: 'Migrate legacy database to modern cloud infrastructure.',
    status: 'planning' as ProjectStatus,
    owner: sampleUsers[0],
    members: [sampleUsers[0], sampleUsers[3]],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-01'),
    progress: 15,
    tasks: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
    color: '#F59E0B'
  }
];

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design new homepage layout',
    description: 'Create wireframes and mockups for the new homepage design.',
    status: 'done' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignee: sampleUsers[1],
    reporter: sampleUsers[0],
    projectId: 'project-1',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-02-01'),
    dueDate: new Date('2024-02-01'),
    estimatedHours: 16,
    tags: ['design', 'frontend'],
    comments: []
  },
  {
    id: 'task-2',
    title: 'Implement responsive navigation',
    description: 'Build responsive navigation component with mobile support.',
    status: 'in-progress' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: sampleUsers[2],
    reporter: sampleUsers[0],
    projectId: 'project-1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    dueDate: new Date('2024-02-25'),
    estimatedHours: 12,
    tags: ['frontend', 'react'],
    comments: []
  },
  {
    id: 'task-3',
    title: 'Set up development environment',
    description: 'Configure React Native development environment for iOS and Android.',
    status: 'done' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignee: sampleUsers[2],
    reporter: sampleUsers[1],
    projectId: 'project-2',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    dueDate: new Date('2024-02-05'),
    estimatedHours: 8,
    tags: ['setup', 'mobile'],
    comments: []
  },
  {
    id: 'task-4',
    title: 'Create authentication flow',
    description: 'Implement user authentication with login and registration.',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignee: sampleUsers[3],
    reporter: sampleUsers[1],
    projectId: 'project-2',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    dueDate: new Date('2024-03-01'),
    estimatedHours: 20,
    tags: ['auth', 'backend'],
    comments: []
  },
  {
    id: 'task-5',
    title: 'Research database options',
    description: 'Compare different cloud database solutions for migration.',
    status: 'review' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: sampleUsers[3],
    reporter: sampleUsers[0],
    projectId: 'project-3',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-18'),
    dueDate: new Date('2024-02-28'),
    estimatedHours: 16,
    tags: ['research', 'database'],
    comments: []
  },
  {
    id: 'task-6',
    title: 'Fix header styling issues',
    description: 'Resolve CSS conflicts in the header component.',
    status: 'todo' as TaskStatus,
    priority: 'urgent' as TaskPriority,
    assignee: sampleUsers[2],
    reporter: sampleUsers[0],
    projectId: 'project-1',
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-18'),
    dueDate: new Date('2024-02-22'),
    estimatedHours: 4,
    tags: ['bugfix', 'css'],
    comments: []
  },
  {
    id: 'task-7',
    title: 'Update API documentation',
    description: 'Update API documentation with new endpoints and examples.',
    status: 'in-progress' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: sampleUsers[2],
    reporter: sampleUsers[0],
    projectId: 'project-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    dueDate: new Date('2024-01-30'), // Overdue by several days
    estimatedHours: 8,
    tags: ['documentation', 'api'],
    comments: []
  },
  {
    id: 'task-8',
    title: 'Performance optimization',
    description: 'Optimize database queries and improve application performance.',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignee: sampleUsers[3],
    reporter: sampleUsers[1],
    projectId: 'project-2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-01-25'), // Overdue by many days
    estimatedHours: 24,
    tags: ['performance', 'optimization'],
    comments: []
  },
  {
    id: 'task-9',
    title: 'User testing session',
    description: 'Conduct user testing session for the new mobile app features.',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: sampleUsers[1],
    reporter: sampleUsers[0],
    projectId: 'project-2',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    dueDate: new Date('2024-02-05'), // Recently overdue
    estimatedHours: 6,
    tags: ['testing', 'user-research'],
    comments: []
  }
];
