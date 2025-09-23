import React, { useState, useEffect, useRef } from 'react';
import { CheckSquare, Plus, Trash2, Edit, Save, X, AlertCircle, Clock, User, Check, Link, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAirflow } from '../../context/AirflowContext';
import { canEditTaskDependencies, canAssignMembersToProjects, getAssignableUsers } from '../../utils/roleUtils';
import type { Task } from '../../types';

interface ChecklistViewProps {
  task: Task;
  onClose?: () => void;
}

export function ChecklistView({ task }: ChecklistViewProps) {
  const { state, addChecklistItem, updateChecklistItem, deleteChecklistItem, toggleChecklistItem, getBlockedChecklistItems, addChecklistDependency, removeChecklistDependency } = useAirflow();
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showDependencyMenu, setShowDependencyMenu] = useState<string | null>(null);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checklist = task.checklist || [];
  const blockedItems = getBlockedChecklistItems(task.id);
  const canManageDependencies = canEditTaskDependencies(state.currentUser);
  const canAssign = canAssignMembersToProjects(state.currentUser);
  const assignableUsers = getAssignableUsers(state.currentUser, state.users);

  const humanizeRole = (role: string) => role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addChecklistItem(task.id, {
        title: newItemTitle.trim(),
        description: undefined,
        completed: false,
        assignee: state.currentUser || undefined
      });
      setNewItemTitle('');
      setShowAddItem(true); // Show another add item bar
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = checklist.find(i => i.id === itemId);
    if (item) {
      setEditingItem(itemId);
      setEditTitle(item.title);
      setEditDescription(item.description || '');
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editingItem) {
      updateChecklistItem(task.id, editingItem, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setEditingItem(null);
      setEditTitle('');
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this checklist item?')) {
      deleteChecklistItem(task.id, itemId);
    }
  };

  const handleToggleItem = (itemId: string) => {
    toggleChecklistItem(task.id, itemId);
  };

  const handleShowAddItem = () => {
    setShowAddItem(true);
  };

  const handleCancelAddItem = () => {
    setShowAddItem(false);
    setNewItemTitle('');
  };

  const handleAddDependency = (fromItemId: string, toItemId: string) => {
    try {
      addChecklistDependency(task.id, fromItemId, toItemId);
      setShowDependencyMenu(null);
    } catch (error) {
      console.error('Failed to add dependency:', error);
      alert('Cannot add dependency: ' + (error as Error).message);
    }
  };

  const handleRemoveDependency = (fromItemId: string, toItemId: string) => {
    removeChecklistDependency(task.id, fromItemId, toItemId);
  };

  const handleAssignUser = (itemId: string, userId: string) => {
    const user = assignableUsers.find(u => u.id === userId);
    if (user) {
      updateChecklistItem(task.id, itemId, { assignee: user });
      setShowAssigneeMenu(null);
    }
  };

  const getAvailableDependencies = (currentItemId: string) => {
    return checklist.filter(item => 
      item.id !== currentItemId && 
      !item.completed &&
      !checklist.find(i => i.id === currentItemId)?.dependencies.includes(item.id)
    );
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDependencyMenu(null);
        setShowAssigneeMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Progress</span>
        <span className="text-sm font-semibold text-gray-900">
          {completedCount} / {totalCount}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-1">
        {checklist.map((item) => {
          const isBlocked = blockedItems.some(blocked => blocked.id === item.id);
          const isEditing = editingItem === item.id;
          
          return (
            <div key={item.id} className={`group flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 ${
              isBlocked ? 'opacity-60' : ''
            }`}>
              {/* Checkbox */}
              <button
                onClick={() => handleToggleItem(item.id)}
                disabled={isBlocked}
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : isBlocked
                    ? 'border-gray-300 bg-gray-100'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {item.completed && <Check className="w-3 h-3" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Item title"
                      className="text-sm"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className={`text-xs sm:text-sm font-medium ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className={`text-xs sm:text-sm mt-1 ${
                        item.completed ? 'line-through text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    )}
                    
                    {/* Item Details */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {item.assignee && (
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{item.assignee.name}</span>
                        </span>
                      )}
                      {item.estimatedHours && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.estimatedHours}h</span>
                        </span>
                      )}
                      {item.dependencies.length > 0 && (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <Link className="w-3 h-3" />
                          <span>{item.dependencies.length} {item.dependencies.length > 1 ? 'dependencies' : 'dependency'}</span>
                        </span>
                      )}
                      {isBlocked && (
                        <span className="flex items-center space-x-1 text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Blocked</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Dependency Management - Only for project managers and admins */}
                  {canManageDependencies && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDependencyMenu(showDependencyMenu === item.id ? null : item.id)}
                        disabled={isBlocked}
                        title="Manage dependencies"
                      >
                        <Link className="w-3 h-3" />
                      </Button>
                      
                      {showDependencyMenu === item.id && (
                        <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="p-3">
                            <div className="text-xs font-medium text-gray-500 mb-2">Add dependency to:</div>
                            {getAvailableDependencies(item.id).map(depItem => (
                              <button
                                key={depItem.id}
                                onClick={() => handleAddDependency(item.id, depItem.id)}
                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                              >
                                <span className="truncate">{depItem.title}</span>
                                {depItem.assignee && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    {depItem.assignee.name}
                                  </span>
                                )}
                              </button>
                            ))}
                            {getAvailableDependencies(item.id).length === 0 && (
                              <div className="text-xs text-gray-400 px-2 py-1">
                                No available items to depend on
                              </div>
                            )}
                            
                            {/* Show current dependencies */}
                            {item.dependencies.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-500 mb-2">Current dependencies:</div>
                                {item.dependencies.map(depId => {
                                  const depItem = checklist.find(i => i.id === depId);
                                  return depItem ? (
                                    <div key={depId} className="flex items-center justify-between px-2 py-1 text-sm bg-gray-50 rounded">
                                      <span className="truncate">{depItem.title}</span>
                                      <button
                                        onClick={() => handleRemoveDependency(item.id, depId)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        title="Remove dependency"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assign User - Only for functional managers and admins */}
                  {canAssign && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAssigneeMenu(showAssigneeMenu === item.id ? null : item.id)}
                        disabled={isBlocked}
                        title="Assign user"
                      >
                        <Users className="w-3 h-3" />
                      </Button>
                      
                      {showAssigneeMenu === item.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 mb-2">Assign to:</div>
                            {assignableUsers.map(user => (
                              <button
                                key={user.id}
                                onClick={() => handleAssignUser(item.id, user.id)}
                                className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center justify-between ${
                                  item.assignee?.id === user.id ? 'bg-blue-50 text-blue-700' : ''
                                }`}
                              >
                                <span>{user.name}</span>
                                <span className="text-xs text-gray-400">{humanizeRole(user.role)}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => handleAssignUser(item.id, '')}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-gray-500"
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item.id)}
                    disabled={isBlocked}
                    title="Edit item"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={isBlocked}
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Item Button */}
        {!showAddItem && (
          <div className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={handleShowAddItem}>
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <Plus className="w-3 h-3 text-gray-400" />
            </div>
            <div className="flex-1 text-gray-500 text-sm">
              Add a new item...
            </div>
          </div>
        )}

        {/* Add New Item Input */}
        {showAddItem && (
          <div className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <Plus className="w-3 h-3 text-gray-400" />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Add a new item..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  } else if (e.key === 'Escape') {
                    handleCancelAddItem();
                  }
                }}
                className="text-sm border-0 bg-transparent focus:ring-0 focus:border-0 p-0 placeholder-gray-400"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleAddItem}
                disabled={!newItemTitle.trim()}
                className="text-green-600 hover:text-green-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelAddItem}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {checklist.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No checklist items yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}