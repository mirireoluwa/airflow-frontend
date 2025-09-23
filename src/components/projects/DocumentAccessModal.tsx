import { useState, useEffect } from 'react';
import { X, Lock, Unlock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { MultiSelect } from '../ui/MultiSelect';
import { canManageDocumentAccess } from '../../utils/roleUtils';
import type { ProjectDocument, Project, User } from '../../types';

interface DocumentAccessModalProps {
  document: ProjectDocument;
  project: Project;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentId: string, accessRestricted: boolean, allowedUsers: string[]) => void;
}

export function DocumentAccessModal({
  document,
  project,
  currentUser,
  isOpen,
  onClose,
  onSave
}: DocumentAccessModalProps) {
  const [accessRestricted, setAccessRestricted] = useState(document.accessRestricted || false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>(document.allowedUsers || []);

  useEffect(() => {
    if (isOpen) {
      setAccessRestricted(document.accessRestricted || false);
      setAllowedUsers(document.allowedUsers || []);
    }
  }, [isOpen, document]);

  if (!isOpen || !canManageDocumentAccess(currentUser, document)) {
    return null;
  }

  const handleSave = () => {
    onSave(document.id, accessRestricted, allowedUsers);
    onClose();
  };

  const handleCancel = () => {
    setAccessRestricted(document.accessRestricted || false);
    setAllowedUsers(document.allowedUsers || []);
    onClose();
  };

  // Get only project team members for selection
  const projectTeamMembers = project.members.map(member => ({
    value: member.id,
    label: member.name,
    user: member
  }));

  return (
    <div className="fixed inset-0 backdrop-blur-md  bg-opacity-20 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl bg-white border-2 border-gray-200">
        <CardContent className="p-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {accessRestricted ? (
                <Lock className="w-5 h-5 text-red-500" />
              ) : (
                <Unlock className="w-5 h-5 text-green-500" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">Document Access</h3>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">{document.name}</h4>
              <p className="text-sm text-gray-600">
                {currentUser?.id === document.uploadedBy.id 
                  ? "Manage who can access your uploaded document"
                  : "Manage who can access this document"
                }
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="accessRestricted"
                  checked={accessRestricted}
                  onChange={(e) => setAccessRestricted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accessRestricted" className="text-sm font-medium text-gray-900">
                  Restrict access to specific team members
                </label>
              </div>

              {accessRestricted && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select team members who can access this document
                  </label>
                  <MultiSelect
                    options={projectTeamMembers}
                    value={allowedUsers}
                    onChange={setAllowedUsers}
                    placeholder="Select team members..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only selected team members will be able to view this document
                  </p>
                </div>
              )}

              {!accessRestricted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Unlock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Open Access</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    All project team members can access this document
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
