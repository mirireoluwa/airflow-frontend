import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Download, Trash2, MoreVertical, File, Image, FileSpreadsheet, FileCode, Eye, Lock, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useAirflow } from '../../context/AirflowContext';
import { formatDistanceToNow } from 'date-fns';
import { canManageDocumentAccess, canAccessDocument } from '../../utils/roleUtils';
import { DocumentAccessModal } from './DocumentAccessModal';
import type { Project, ProjectDocument } from '../../types';

interface ProjectDocumentsProps {
  project: Project;
}

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
  const { state, addProjectDocument, deleteProjectDocument, updateDocumentAccess } = useAirflow();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState<string | null>(null);
  const [accessModalOpen, setAccessModalOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type.includes('text') || type.includes('markdown')) return <FileCode className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a mock URL for demo purposes
      const mockUrl = URL.createObjectURL(file);
      
      addProjectDocument(project.id, {
        name: file.name,
        url: mockUrl,
        size: file.size,
        type: file.type,
        uploadedBy: state.currentUser!,
        description: ''
      });
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleViewDocument = (document: ProjectDocument) => {
    navigate(`/projects/${project.id}/documents/${document.id}`);
    setShowActions(null);
  };

  const handleDownload = (document: ProjectDocument) => {
    // In a real app, this would trigger a download
    window.open(document.url, '_blank');
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteProjectDocument(project.id, documentId);
      setShowActions(null);
    }
  };

  const canDeleteDocument = (document: ProjectDocument) => {
    return state.currentUser?.id === document.uploadedBy.id || state.currentUser?.role === 'admin';
  };

  const canManageAccess = (document: ProjectDocument) => {
    return canManageDocumentAccess(state.currentUser, document);
  };

  const canViewDocument = (document: ProjectDocument) => {
    return canAccessDocument(state.currentUser, document, project);
  };

  const handleDocumentClick = (document: ProjectDocument) => {
    if (canViewDocument(document)) {
      handleViewDocument(document);
    }
  };

  const handleAccessManagement = (documentId: string) => {
    setAccessModalOpen(documentId);
    setShowActions(null);
  };

  const handleSaveAccess = (documentId: string, accessRestricted: boolean, allowedUsers: string[]) => {
    updateDocumentAccess(project.id, documentId, accessRestricted, allowedUsers);
    setAccessModalOpen(null);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <span className="text-sm text-gray-500">({project.documents.length})</span>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            multiple={false}
          />

          {/* Documents List */}
          <div className="space-y-3">
            {project.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No documents yet. Upload your first document!</p>
              </div>
            ) : (
              project.documents.map((document) => {
                const hasAccess = canViewDocument(document);
                const isRestricted = document.accessRestricted;
                
                return (
                  <div 
                    key={document.id} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      hasAccess 
                        ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                        : 'bg-gray-100 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => hasAccess && handleDocumentClick(document)}
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium truncate ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                          {document.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.size)}
                        </span>
                        {isRestricted && (
                          <div title="Access Restricted">
                            <Lock className="w-3 h-3 text-red-500" />
                          </div>
                        )}
                      </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Uploaded by {document.uploadedBy.name}</span>
                      {state.currentUser?.id === document.uploadedBy.id && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">(Your upload)</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}</span>
                    </div>
                      {document.description && (
                        <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                      )}
                      {!hasAccess && (
                        <p className="text-xs text-red-600 mt-1">You don't have access to this document</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {hasAccess && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(document)}
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(document)}
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {(canDeleteDocument(document) || canManageAccess(document)) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === document.id ? null : document.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {showActions === document.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              {canManageAccess(document) && (
                                <button
                                  onClick={() => handleAccessManagement(document.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-blue-600 flex items-center space-x-2"
                                >
                                  <Settings className="w-4 h-4" />
                                  <span>Manage Access</span>
                                </button>
                              )}
                              {canDeleteDocument(document) && (
                                <button
                                  onClick={() => handleDeleteDocument(document.id)}
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
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Access Modal */}
      {accessModalOpen && (
        <DocumentAccessModal
          document={project.documents.find(d => d.id === accessModalOpen)!}
          project={project}
          currentUser={state.currentUser}
          isOpen={!!accessModalOpen}
          onClose={() => setAccessModalOpen(null)}
          onSave={handleSaveAccess}
        />
      )}
    </>
  );
}
