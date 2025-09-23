import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText, Image, FileSpreadsheet, FileCode, File, Lock, Settings } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAirflow } from '../../context/AirflowContext';
import { formatDistanceToNow } from 'date-fns';
import { canAccessDocument, canManageDocumentAccess } from '../../utils/roleUtils';
import { DocumentAccessModal } from '../../components/projects/DocumentAccessModal';

export function DocumentPage() {
  const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
  const navigate = useNavigate();
  const { state, updateDocumentAccess } = useAirflow();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const project = state.projects.find(p => p.id === projectId);
  const document = project?.documents.find(d => d.id === documentId);

  useEffect(() => {
    if (!project || !document) {
      navigate('/projects');
    }
  }, [project, document, navigate]);

  if (!project || !document) {
    return null;
  }

  // Check if user has access to this document
  const hasAccess = canAccessDocument(state.currentUser, document, project);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to view this document.
            </p>
            <Button onClick={() => navigate(`/projects/${project.id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
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

  const handleManageAccess = () => {
    setShowAccessModal(true);
  };

  const handleSaveAccess = (documentId: string, accessRestricted: boolean, allowedUsers: string[]) => {
    updateDocumentAccess(project!.id, documentId, accessRestricted, allowedUsers);
    setShowAccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              {getFileIcon(document.type)}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{document.name}</h1>
                <p className="text-sm text-gray-500">
                  {formatFileSize(document.size)} • Uploaded by {document.uploadedBy.name}
                  {state.currentUser?.id === document.uploadedBy.id && (
                    <span className="text-blue-600 font-medium"> (Your upload)</span>
                  )}
                  {' • '}{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {canManageDocumentAccess(state.currentUser, document) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageAccess}
                className="rounded-full w-10 h-10 p-0"
                title="Manage Access"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-full w-10 h-10 p-0"
              title={isDownloading ? 'Downloading...' : 'Download'}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="rounded-full w-10 h-10 p-0"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 p-6">
        <Card className="h-full">
          <CardContent className="pt-6 p-0 h-full">
            <div className="w-full h-full min-h-[calc(100vh-200px)]">
              
              {(() => {
                const isImage = document.type.startsWith('image/') || !!document.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/);
                const isPdf = document.type.includes('pdf') || document.name.toLowerCase().endsWith('.pdf');
                const isText = document.type.includes('text') || document.type.includes('markdown') || !!document.name.toLowerCase().match(/\.(txt|md|markdown|csv|json|xml|html|css|js|ts|py|java|cpp|c|h)$/);
                
                
                if (isImage) {
                  return (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <img
                        src={document.url}
                        alt={document.name}
                        className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                        onError={(e) => {
                          // If image fails to load, show a fallback
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-center p-8">
                        <Image className="w-24 h-24 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Preview</h3>
                        <p className="text-gray-600 mb-4">Click below to view or download the image</p>
                        <div className="space-x-3">
                          <Button onClick={handleOpenInNewTab}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Image
                          </Button>
                          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                } else if (isPdf) {
                  return (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center p-8">
                        <FileText className="w-24 h-24 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Document</h3>
                        <p className="text-gray-600 mb-4">Click below to view or download the PDF</p>
                        <div className="space-x-3">
                          <Button onClick={handleOpenInNewTab}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open PDF
                          </Button>
                          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                } else if (isText) {
                  return (
                    <div className="h-full bg-white">
                      <div className="p-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileCode className="w-5 h-5 text-blue-500" />
                            <span className="font-medium text-gray-900">Text Document Preview</span>
                          </div>
                          <p className="text-sm text-gray-600">This is a preview of the text content</p>
                        </div>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                          <pre className="whitespace-pre-wrap">
{`// Sample text content preview
// This would show the actual file content in a real implementation

Document: ${document.name}
Size: ${formatFileSize(document.size)}
Type: ${document.type}

This is a preview of the text file content.
In a real application, this would display the actual
file contents here.

You can click "Open in New Tab" to view the full content
or "Download" to save it to your device.`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center p-8">
                        <File className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Preview</h3>
                        <p className="text-gray-600 mb-2">File: {document.name}</p>
                        <p className="text-gray-600 mb-4">Type: {document.type || 'Unknown'}</p>
                        <div className="space-x-3">
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
                    </div>
                  );
                }
              })()}
            </div>

            {document.description && (
              <div className="p-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{document.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Access Modal */}
      {showAccessModal && (
        <DocumentAccessModal
          document={document}
          project={project}
          currentUser={state.currentUser}
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          onSave={handleSaveAccess}
        />
      )}
    </div>
  );
}
