
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Project } from '../../types';
import { useAirflow } from '../../context/AirflowContext';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  startDate: z.string(),
  endDate: z.string().optional(),
  color: z.string(),
  members: z.array(z.string()).min(1, 'At least one member is required')
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#06B6D4', label: 'Cyan' }
];

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const { state } = useAirflow();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'planning',
      startDate: project?.startDate ? project.startDate.toISOString().split('T')[0] : '',
      endDate: project?.endDate ? project.endDate.toISOString().split('T')[0] : '',
      color: project?.color || '#3B82F6',
      members: project?.members.map(m => m.id) || [state.currentUser?.id || '']
    }
  });

  const userOptions = state.users.map(user => ({
    value: user.id,
    label: user.name
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Enter project name"
      />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Project description"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
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
          label="Color"
          {...register('color')}
          options={colorOptions}
          error={errors.color?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          {...register('startDate')}
          error={errors.startDate?.message}
        />

        <Input
          label="End Date (Optional)"
          type="date"
          {...register('endDate')}
          error={errors.endDate?.message}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Team Members
        </label>
        <div className="space-y-2">
          {userOptions.map((user) => (
            <label key={user.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={user.value}
                {...register('members')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{user.label}</span>
            </label>
          ))}
        </div>
        {errors.members && (
          <p className="text-sm text-red-600 mt-1">{errors.members.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
