
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumn as KanbanColumnType } from '../../types';

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map(task => task.id);

  return (
    <div className="flex flex-col w-80 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{column.title}</h3>
        <span className="bg-gradient-to-r from-red-500/10 to-red-600/10 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-semibold border border-red-200/30">
          {column.tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-4 min-h-[400px] p-2 transition-all duration-200 ${
          isOver
            ? 'bg-red-50/50 border-2 border-dashed border-red-300 rounded-lg' 
            : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
