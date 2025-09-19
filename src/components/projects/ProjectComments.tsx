import { useState } from 'react';
import { MessageSquare, Send, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { useAirflow } from '../../context/AirflowContext';
import { formatDistanceToNow } from 'date-fns';
import type { Project, Comment } from '../../types';

interface ProjectCommentsProps {
  project: Project;
}

export function ProjectComments({ project }: ProjectCommentsProps) {
  const { state, addProjectComment, updateProjectComment, deleteProjectComment } = useAirflow();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addProjectComment(project.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    setShowActions(null);
  };

  const handleSaveEdit = () => {
    if (editingComment && editContent.trim()) {
      updateProjectComment(project.id, editingComment, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteProjectComment(project.id, commentId);
      setShowActions(null);
    }
  };

  const canEditComment = (comment: Comment) => {
    return state.currentUser?.id === comment.author.id || state.currentUser?.role === 'admin';
  };

  const canDeleteComment = (comment: Comment) => {
    return state.currentUser?.id === comment.author.id || state.currentUser?.role === 'admin';
  };

  return (
    <Card>
      <CardContent className="p-6 pt-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          <span className="text-sm text-gray-500">({project.comments.length})</span>
        </div>

        {/* Add Comment Form */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
            </div>
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {project.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            project.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">
                      {comment.author.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                      {(canEditComment(comment) || canDeleteComment(comment)) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === comment.id ? null : comment.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {showActions === comment.id && (
                            <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              {canEditComment(comment) && (
                                <button
                                  onClick={() => handleEditComment(comment)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                              )}
                              {canDeleteComment(comment) && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
