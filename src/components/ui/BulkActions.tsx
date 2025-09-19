import React, { useState } from 'react';
import { Check, X, Trash2, Edit, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (selectedIds: string[]) => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedItems: string[];
  totalItems: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  className?: string;
}

export function BulkActions({
  selectedItems,
  totalItems,
  actions,
  onClearSelection,
  onSelectAll,
  className = ''
}: BulkActionsProps) {
  const [showActions, setShowActions] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const allSelected = selectedItems.length === totalItems;
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <Card variant="apple" className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Selection Info */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} selected
              </span>
              {someSelected && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Select all {totalItems}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant={action.variant === 'danger' ? 'danger' : 'apple-secondary'}
                    size="sm"
                    onClick={() => {
                      action.action(selectedItems);
                      setShowActions(false);
                    }}
                    disabled={action.disabled}
                    className="touch-target"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </Button>
                );
              })}

              {/* More Actions */}
              {actions.length > 3 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActions(!showActions)}
                    className="touch-target"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>

                  {showActions && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {actions.slice(3).map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                action.action(selectedItems);
                                setShowActions(false);
                              }}
                              disabled={action.disabled}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="touch-target"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing bulk selections
export function useBulkSelection<T extends { id: string }>(
  items: T[],
  initialSelected: string[] = []
) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  const allSelected = selectedIds.length === items.length && items.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected
  };
}

// Checkbox component for bulk selection
interface BulkCheckboxProps {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
  className?: string;
}

export function BulkCheckbox({ 
  checked, 
  onChange, 
  indeterminate = false,
  className = '' 
}: BulkCheckboxProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
      />
    </div>
  );
}
