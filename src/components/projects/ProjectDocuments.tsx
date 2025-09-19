import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Download, Trash2, MoreVertical, File, Image, FileSpreadsheet, FileCode, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useAirflow } from '../../context/AirflowContext';
import { formatDistanceToNow } from 'date-fns';
import type { Project, ProjectDocument } from '../../types';

interface ProjectDocumentsProps {
  project: Project;
}

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
  const { state, addProjectDocument, deleteProjectDocument } = useAirflow();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState<string | null>(null);
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

  return (
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
            project.documents.map((document) => (
              <div key={document.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  {getFileIcon(document.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(document.size)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Uploaded by {document.uploadedBy.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}</span>
                  </div>
                  {document.description && (
                    <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
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
                  {canDeleteDocument(document) && (
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === document.id ? null : document.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {showActions === document.id && (
                        <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
