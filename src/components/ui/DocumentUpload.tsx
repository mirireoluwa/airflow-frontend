import { useState, useRef } from 'react';
import { Upload, X, File, FileText, Image, FileSpreadsheet, FileCode } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import type { ProjectDocument } from '../../types';

interface DocumentUploadProps {
  documents: ProjectDocument[];
  onDocumentsChange: (documents: ProjectDocument[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export function DocumentUpload({
  documents,
  onDocumentsChange,
  maxFiles = 10,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className = ''
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed maxFiles
    if (documents.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      const newDocuments: ProjectDocument[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }

        // Check for duplicate names
        if (documents.some(doc => doc.name === file.name)) {
          alert(`${file.name}: File with this name already exists`);
          continue;
        }

        // Create a mock URL for the file (in a real app, this would upload to a server)
        const mockUrl = URL.createObjectURL(file);
        
        const document: ProjectDocument = {
          id: Date.now().toString() + Math.random().toString(36).substr(2),
          name: file.name,
          url: mockUrl,
          size: file.size,
          type: file.type,
          uploadedBy: { id: 'current-user', name: 'Current User' } as any, // Will be updated by parent
          uploadedAt: new Date(),
          description: ''
        };

        newDocuments.push(document);
      }

      onDocumentsChange([...documents, ...newDocuments]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveDocument = (documentId: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== documentId));
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Max {maxFiles} files, {maxSize}MB each
        </p>
        <Button
          type="button"
          variant="apple-secondary"
          onClick={handleFileInputClick}
          disabled={uploading || documents.length >= maxFiles}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Select Files'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Documents ({documents.length})</h4>
          {documents.map((document) => (
            <Card key={document.id} variant="flat">
              <CardContent className="p-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(document.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(document.size)} • {document.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(document.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
