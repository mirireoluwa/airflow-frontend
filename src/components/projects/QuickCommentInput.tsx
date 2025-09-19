import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface QuickCommentInputProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (content: string) => void;
}

export function QuickCommentInput({ isOpen, onClose, onAddComment }: QuickCommentInputProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment.trim());
      setComment('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Add Comment</h3>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write your comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!comment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
