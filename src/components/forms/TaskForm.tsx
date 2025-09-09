
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { getAssignableUsers } from '../../utils/roleUtils';
import type { Task } from '../../types';
import { useAirflow } from '../../context/AirflowContext';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  tags: z.string()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  defaultAssignee?: any;
  showAssignee?: boolean;
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export function TaskForm({ task, onSubmit, onCancel, defaultAssignee, showAssignee = true }: TaskFormProps) {
  const { state } = useAirflow();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      projectId: task?.projectId || '',
      assigneeId: task?.assignee?.id || defaultAssignee?.id || '',
      dueDate: task?.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      estimatedHours: task?.estimatedHours || undefined,
      tags: task?.tags.join(', ') || ''
    }
  });

  const projectOptions = [
    { value: '', label: 'Select a project' },
    ...state.projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  const assignableUsers = getAssignableUsers(state.currentUser, state.users);
  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...assignableUsers.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      ...data,
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Enter task title"
      />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          className="w-full h-24 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300/50 focus:bg-white/90 transition-all duration-200 resize-none shadow-sm"
          placeholder="Describe your task in detail..."
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Project"
          {...register('projectId')}
          options={projectOptions}
          error={errors.projectId?.message}
        />

        {showAssignee && (
          <Select
            label="Assignee"
            {...register('assigneeId')}
            options={userOptions}
            error={errors.assigneeId?.message}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          {...register('status')}
          options={statusOptions}
          error={errors.status?.message}
        />

        <Select
          label="Priority"
          {...register('priority')}
          options={priorityOptions}
          error={errors.priority?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Due Date (Optional)"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />

        <Input
          label="Estimated Hours (Optional)"
          type="number"
          min="0"
          step="0.5"
          {...register('estimatedHours', { valueAsNumber: true })}
          error={errors.estimatedHours?.message}
          placeholder="e.g., 8"
        />
      </div>

      <Input
        label="Tags (Optional)"
        {...register('tags')}
        error={errors.tags?.message}
        placeholder="Comma-separated tags (e.g., frontend, urgent, bug)"
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
