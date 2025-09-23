import { useState } from 'react';
import { Check, Lock, Clock, User, Trash2, Edit3, Link, Unlink } from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import type { ChecklistItem as ChecklistItemType } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ChecklistItemProps {
  taskId: string;
  item: ChecklistItemType;
  allItems: ChecklistItemType[];
  onEdit?: (item: ChecklistItemType) => void;
  onDelete?: (itemId: string) => void;
  onAddDependency?: (fromItemId: string, toItemId: string) => void;
  onRemoveDependency?: (fromItemId: string, toItemId: string) => void;
}

export function ChecklistItemComponent({ 
  taskId, 
  item, 
  allItems, 
  onEdit, 
  onDelete, 
  onAddDependency, 
  onRemoveDependency 
}: ChecklistItemProps) {
  const { toggleChecklistItem, getBlockedChecklistItems } = useAirflow();
  const [showDependencyMenu, setShowDependencyMenu] = useState(false);
  
  const isBlocked = getBlockedChecklistItems(taskId).some(blocked => blocked.id === item.id);
  const canToggle = !isBlocked || item.completed;
  
  const handleToggle = () => {
    if (canToggle) {
      toggleChecklistItem(taskId, item.id);
    }
  };

  const handleAddDependency = (targetItemId: string) => {
    if (onAddDependency) {
      onAddDependency(item.id, targetItemId);
    }
    setShowDependencyMenu(false);
  };

  const handleRemoveDependency = (targetItemId: string) => {
    if (onRemoveDependency) {
      onRemoveDependency(item.id, targetItemId);
    }
  };

  const availableItems = allItems.filter(i => i.id !== item.id && !i.completed);
  const dependentItems = allItems.filter(i => item.dependencies.includes(i.id));

  return (
    <Card className="p-4 mb-2" variant="flat">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={!canToggle}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.completed
              ? 'bg-green-500 border-green-500 text-white'
              : isBlocked
              ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
              : 'border-gray-300 hover:border-green-500 cursor-pointer'
          }`}
        >
          {item.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-xs sm:text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {item.title}
            </h4>
            {isBlocked && !item.completed && (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
            {item.completed && item.completedAt && (
              <span className="text-xs text-gray-500">
                {new Date(item.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {item.description && (
            <p className={`text-xs sm:text-sm text-gray-600 mb-2 ${item.completed ? 'line-through' : ''}`}>
              {item.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {item.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{item.assignee.name}</span>
              </div>
            )}
            {item.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.estimatedHours}h</span>
              </div>
            )}
            {item.completedBy && (
              <div className="flex items-center gap-1">
                <span>Completed by {item.completedBy.name}</span>
              </div>
            )}
          </div>

          {/* Dependencies */}
          {dependentItems.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Depends on:</div>
              <div className="flex flex-wrap gap-1">
                {dependentItems.map(dep => (
                  <span
                    key={dep.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {dep.title}
                    <button
                      onClick={() => handleRemoveDependency(dep.id)}
                      className="hover:text-blue-600"
                    >
                      <Unlink className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Dependency Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDependencyMenu(!showDependencyMenu)}
              className="p-1"
            >
              <Link className="w-4 h-4" />
            </Button>
            
            {showDependencyMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Add dependency to:</div>
                  {availableItems.map(availableItem => (
                    <button
                      key={availableItem.id}
                      onClick={() => handleAddDependency(availableItem.id)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    >
                      {availableItem.title}
                    </button>
                  ))}
                  {availableItems.length === 0 && (
                    <div className="text-xs text-gray-400 px-2 py-1">
                      No available items
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="p-1"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
