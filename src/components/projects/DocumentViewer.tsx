import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image, FileSpreadsheet, FileCode, File, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { canAccessDocument } from '../../utils/roleUtils';
import type { ProjectDocument, Project, User } from '../../types';

interface DocumentViewerProps {
  document: ProjectDocument | null;
  project: Project | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ document, project, currentUser, isOpen, onClose }: DocumentViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !document || !project) return null;

  // Check if user has access to this document
  const hasAccess = canAccessDocument(currentUser, document, project);

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-20 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 shadow-2xl bg-white border border-gray-200">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to view this document.
            </p>
            <Button onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    if (type.includes('text') || type.includes('markdown')) return <FileCode className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // In a real app, this would trigger a proper download
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(document.url, '_blank');
  };

  const canViewInline = document.type.startsWith('image/') || document.type.includes('pdf') || document.type.includes('text');

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(document.size)} • Uploaded by {document.uploadedBy.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-6 overflow-auto">
          {canViewInline ? (
            <div className="w-full h-full">
              {document.type.startsWith('image/') ? (
                <img
                  src={document.url}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              ) : document.type.includes('pdf') ? (
                <iframe
                  src={document.url}
                  className="w-full h-full min-h-[500px] border-0"
                  title={document.name}
                />
              ) : document.type.includes('text') ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">
                    {/* In a real app, you'd fetch and display the text content */}
                    This is a text file preview. Click "Open" to view the full content.
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <Button onClick={handleOpenInNewTab}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Preview not available for this file type</p>
              <div className="space-x-2">
                <Button onClick={handleDownload} disabled={isDownloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          {document.description && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{document.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
