import React, { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { KanbanColumn } from '../../components/kanban/KanbanColumn';
import { KanbanCard } from '../../components/kanban/KanbanCard';
import { useAirflow } from '../../context/AirflowContext';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from '../../types';

export function Kanban() {
  const { state, updateTask } = useAirflow();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Create columns with tasks
  const columns: KanbanColumnType[] = useMemo(() => {
    const columnDefinitions = [
      { id: 'todo' as TaskStatus, title: 'To Do' },
      { id: 'in-progress' as TaskStatus, title: 'In Progress' },
      { id: 'review' as TaskStatus, title: 'Review' },
      { id: 'done' as TaskStatus, title: 'Done' }
    ];

    return columnDefinitions.map(col => ({
      ...col,
      tasks: state.tasks.filter(task => task.status === col.id)
    }));
  }, [state.tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask(taskId, { status: newStatus });
    }

    setActiveTask(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center lg:text-left mb-4 pb-4">
        <h1 className="text-4xl font-bold text-gradient mb-2">Kanban Board</h1>
        <p className="text-lg text-gray-600">Drag and drop tasks to update their status.</p>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-white rounded-lg border border-gray-200 p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">
              {column.tasks.length}
            </div>
            <div className="text-sm text-gray-600">{column.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
