import React, { useState, useRef } from 'react';
import { Upload, Image, Video, FileText, Link, Trash2, Download, Eye, CheckCircle, AlertCircle, X, Save, Cloud, Loader } from 'lucide-react';
import { storageService, UploadedFile } from '../../lib/storage';

interface MediaFile extends UploadedFile {
  description?: string;
  uploadProgress?: number;
}

interface FileUploadPanelProps {
  onFileInsert: (content: string) => void;
  onClose?: () => void;
}

export function FileUploadPanel({ onFileInsert, onClose }: FileUploadPanelProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList, type: 'image' | 'video' | 'pdf' | 'document') => {
    setUploading(true);
    const newSuccessFiles: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${Date.now()}-${i}`;
        
        // Validate file type
        if (type === 'pdf' && !file.type.includes('pdf')) {
          alert(`Please select a valid PDF file. "${file.name}" is not a PDF.`);
          continue;
        }
        
        if (type === 'document' && !file.name.match(/\.(doc|docx|txt|rtf)$/i)) {
          alert(`Please select a valid document file. "${file.name}" is not supported.`);
          continue;
        }
        
        // Show upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[fileId] || 0;
              if (currentProgress >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return { ...prev, [fileId]: currentProgress + 10 };
            });
          }, 200);

          // Upload to Supabase Storage
          const uploadedFile = await storageService.uploadFile(file, type);
          
          // Complete progress
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

          // Add to media files
          const mediaFile: MediaFile = {
            ...uploadedFile,
            description: '',
          };

          setMediaFiles(prev => [...prev, mediaFile]);
          newSuccessFiles.push(file.name);

          // Remove progress after completion
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        } catch (error) {
          console.error('Error uploading file:', error);
          alert(`Error uploading file: ${file.name}. ${error.message}`);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }

      // Show success message
      if (newSuccessFiles.length > 0) {
        setUploadSuccess(newSuccessFiles);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setUploadSuccess([]);
        }, 3000);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;

    const linkId = `link-${Date.now()}`;
    const mediaFile: MediaFile = {
      id: linkId,
      name: linkDescription || linkInput,
      url: linkInput,
      type: 'link',
      size: 0,
      path: '',
      description: linkDescription
    };

    setMediaFiles(prev => [...prev, mediaFile]);
    setLinkInput('');
    setLinkDescription('');

    // Show success message for link
    setUploadSuccess([linkDescription || 'Link']);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setUploadSuccess([]);
    }, 3000);
  };

  const removeMediaFile = async (file: MediaFile) => {
    try {
      // Delete from Supabase Storage if it's not a link
      if (file.type !== 'link' && file.path) {
        await storageService.deleteFile(file.path);
      }
      
      setMediaFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const downloadOriginalFile = (media: MediaFile) => {
    if (media.type === 'link') {
      window.open(media.url, '_blank');
    } else {
      // Create download link
      const a = document.createElement('a');
      a.href = media.url;
      a.download = media.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const insertMediaIntoContent = (media: MediaFile) => {
    let insertText = '';
    
    switch (media.type) {
      case 'image':
        insertText = `![${media.name}](${media.url})\n\n`;
        break;
      case 'video':
        insertText = `<video controls width="100%" style="max-width: 600px;">
  <source src="${media.url}" type="video/mp4">
  Your browser does not support the video tag.
</video>\n\n`;
        break;
      case 'pdf':
        insertText = `## 📄 ${media.name}

<div class="pdf-container" style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div class="pdf-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
    <div class="pdf-title" style="display: flex; align-items: center; gap: 12px;">
      <div style="padding: 8px; background: #dbeafe; border-radius: 8px;">
        <span style="font-size: 24px;">📄</span>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${media.name}</h4>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">PDF Document • ${storageService.formatFileSize(media.size)}</p>
      </div>
    </div>
    <div class="pdf-actions" style="display: flex; gap: 12px;">
      <a href="${media.url}" target="_blank" class="pdf-preview-btn" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>👁️</span>
        <span>Preview PDF</span>
      </a>
      <a href="${media.url}" download="${media.name}" class="pdf-download-btn" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>⬇️</span>
        <span>Download PDF</span>
      </a>
    </div>
  </div>
  
  <iframe src="${media.url}" width="100%" height="600" class="pdf-iframe" style="border: none; border-radius: 8px; background: white; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);"></iframe>
  
  <div style="margin-top: 16px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
    <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">📋 Document Information</h5>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0369a1; line-height: 1.6;">
      <li><strong>File:</strong> ${media.name}</li>
      <li><strong>Type:</strong> PDF Document</li>
      <li><strong>Size:</strong> ${storageService.formatFileSize(media.size)}</li>
      <li><strong>Access:</strong> Free preview and download available</li>
      <li><strong>Usage:</strong> Educational and reference purposes</li>
    </ul>
  </div>
  
  <div style="margin-top: 12px; padding: 12px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px;">
    <p style="margin: 0; font-size: 13px; color: #065f46;">
      💡 <strong>Tip:</strong> Click "Preview PDF" for full-screen viewing with zoom controls, or "Download PDF" to save the original file locally for offline access.
    </p>
  </div>
</div>

---\n\n`;
        break;
      case 'document':
        insertText = `## 📄 ${media.name}

<div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="padding: 8px; background: #dbeafe; border-radius: 8px;">
        <span style="font-size: 24px;">📄</span>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${media.name}</h4>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Document File • ${storageService.formatFileSize(media.size)}</p>
      </div>
    </div>
    <div style="display: flex; gap: 12px;">
      <a href="${media.url}" download="${media.name}" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>⬇️</span>
        <span>Download Document</span>
      </a>
    </div>
  </div>
  
  <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
    <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${media.name}</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">Click the download button above to access this document</p>
  </div>
  
  <div style="margin-top: 16px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
    <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">📋 Document Information</h5>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0369a1; line-height: 1.6;">
      <li><strong>File:</strong> ${media.name}</li>
      <li><strong>Type:</strong> Document File</li>
      <li><strong>Size:</strong> ${storageService.formatFileSize(media.size)}</li>
      <li><strong>Access:</strong> Free download available</li>
      <li><strong>Usage:</strong> Educational and reference purposes</li>
    </ul>
  </div>
</div>

---\n\n`;
        break;
      case 'link':
        insertText = `🔗 [${media.name}](${media.url})\n\n`;
        break;
    }

    onFileInsert(insertText);
  };

  const insertAllFiles = () => {
    let allContent = '';
    mediaFiles.forEach(media => {
      let insertText = '';
      
      switch (media.type) {
        case 'image':
          insertText = `![${media.name}](${media.url})\n\n`;
          break;
        case 'video':
          insertText = `<video controls width="100%" style="max-width: 600px;">
  <source src="${media.url}" type="video/mp4">
  Your browser does not support the video tag.
</video>\n\n`;
          break;
        case 'pdf':
          insertText = `## 📄 ${media.name}

<div class="pdf-container" style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div class="pdf-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
    <div class="pdf-title" style="display: flex; align-items: center; gap: 12px;">
      <div style="padding: 8px; background: #dbeafe; border-radius: 8px;">
        <span style="font-size: 24px;">📄</span>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${media.name}</h4>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">PDF Document • ${storageService.formatFileSize(media.size)}</p>
      </div>
    </div>
    <div class="pdf-actions" style="display: flex; gap: 12px;">
      <a href="${media.url}" target="_blank" class="pdf-preview-btn" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>👁️</span>
        <span>Preview PDF</span>
      </a>
      <a href="${media.url}" download="${media.name}" class="pdf-download-btn" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>⬇️</span>
        <span>Download PDF</span>
      </a>
    </div>
  </div>
  
  <iframe src="${media.url}" width="100%" height="600" class="pdf-iframe" style="border: none; border-radius: 8px; background: white; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);"></iframe>
  
  <div style="margin-top: 16px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
    <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">📋 Document Information</h5>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0369a1; line-height: 1.6;">
      <li><strong>File:</strong> ${media.name}</li>
      <li><strong>Type:</strong> PDF Document</li>
      <li><strong>Size:</strong> ${storageService.formatFileSize(media.size)}</li>
      <li><strong>Access:</strong> Free preview and download available</li>
      <li><strong>Usage:</strong> Educational and reference purposes</li>
    </ul>
  </div>
  
  <div style="margin-top: 12px; padding: 12px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px;">
    <p style="margin: 0; font-size: 13px; color: #065f46;">
      💡 <strong>Tip:</strong> Click "Preview PDF" for full-screen viewing with zoom controls, or "Download PDF" to save the original file locally for offline access.
    </p>
  </div>
</div>

---\n\n`;
          break;
        case 'document':
          insertText = `## 📄 ${media.name}

<div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="padding: 8px; background: #dbeafe; border-radius: 8px;">
        <span style="font-size: 24px;">📄</span>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${media.name}</h4>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Document File • ${storageService.formatFileSize(media.size)}</p>
      </div>
    </div>
    <div style="display: flex; gap: 12px;">
      <a href="${media.url}" download="${media.name}" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39); transition: all 0.2s ease; text-decoration: none;">
        <span>⬇️</span>
        <span>Download Document</span>
      </a>
    </div>
  </div>
  
  <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
    <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${media.name}</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">Click the download button above to access this document</p>
  </div>
  
  <div style="margin-top: 16px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
    <h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">📋 Document Information</h5>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0369a1; line-height: 1.6;">
      <li><strong>File:</strong> ${media.name}</li>
      <li><strong>Type:</strong> Document File</li>
      <li><strong>Size:</strong> ${storageService.formatFileSize(media.size)}</li>
      <li><strong>Access:</strong> Free download available</li>
      <li><strong>Usage:</strong> Educational and reference purposes</li>
    </ul>
  </div>
</div>

---\n\n`;
          break;
        case 'link':
          insertText = `🔗 [${media.name}](${media.url})\n\n`;
          break;
      }
      
      allContent += insertText;
    });
    
    onFileInsert(allContent);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose?.();
    }, 2000);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-green-500 text-white px-3 sm:px-6 py-2 sm:py-4 rounded-lg shadow-lg flex items-center space-x-2 sm:space-x-3 animate-slide-in-right max-w-xs sm:max-w-none">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm sm:text-base">Upload Successful!</p>
              <p className="text-xs sm:text-sm opacity-90">
                {uploadSuccess.length === 1 
                  ? `${uploadSuccess[0]} uploaded successfully`
                  : `${uploadSuccess.length} files uploaded successfully`
                }
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Upload Content & Media
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Files are stored securely in Supabase Storage
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {/* Save All Button */}
            {mediaFiles.length > 0 && (
              <button
                onClick={insertAllFiles}
                disabled={uploading}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save All ({mediaFiles.length})</span>
                <span className="sm:hidden">Save ({mediaFiles.length})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center p-3 sm:p-6 border-2 border-dashed border-green-300 dark:border-green-600 rounded-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Images</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">JPG, PNG, GIF</span>
            </button>
            
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center p-3 sm:p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Videos</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">MP4, WebM</span>
            </button>
            
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center p-3 sm:p-6 border-2 border-dashed border-red-300 dark:border-red-600 rounded-xl hover:border-red-500 dark:hover:border-red-400 transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">PDFs</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">Documents</span>
            </button>

            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center p-3 sm:p-6 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Documents</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">DOC, TXT</span>
            </button>
            
            <div className="flex flex-col items-center p-3 sm:p-6 border-2 border-dashed border-teal-300 dark:border-teal-600 rounded-xl bg-white dark:bg-gray-800 col-span-2 sm:col-span-1">
              <Link className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Links</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">External URLs</span>
            </div>
          </div>

          {/* Upload Status */}
          {uploading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Uploading files to Supabase Storage...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Please wait while your files are being uploaded securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link Input */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add External Link</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="url"
                  placeholder="Enter URL..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  disabled={uploading}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Link description (optional)..."
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  disabled={uploading}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                disabled={!linkInput.trim() || uploading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
              >
                Add Link
              </button>
            </div>
          </div>

          {/* Media Files List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploaded Files ({mediaFiles.length})
                </h4>
                <button
                  onClick={insertAllFiles}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All to Note</span>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {mediaFiles.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getFileIcon(media.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {media.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{media.type}</span>
                          {media.size > 0 && <span>• {storageService.formatFileSize(media.size)}</span>}
                          <span className="text-green-600 dark:text-green-400">• Stored in Supabase</span>
                        </div>
                        {uploadProgress[media.id] !== undefined && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[media.id]}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => downloadOriginalFile(media)}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title="Download original file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMediaIntoContent(media)}
                        className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Insert into content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMediaFile(media)}
                        disabled={uploading}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  ☁️ Supabase Storage Integration
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <li>• <strong>Secure cloud storage:</strong> Files are stored in Supabase Storage</li>
                  <li>• <strong>Direct downloads:</strong> Users get the exact original files you upload</li>
                  <li>• <strong>Fast delivery:</strong> Global CDN for optimal performance</li>
                  <li>• <strong>Reliable access:</strong> 99.9% uptime guarantee</li>
                  <li>• <strong>Multiple formats:</strong> PDFs, images, videos, documents, and links</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {mediaFiles.length > 0 
                ? `${mediaFiles.length} file(s) ready to be added to your note`
                : 'Upload files to get started'
              }
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {mediaFiles.length > 0 && (
                <button
                  onClick={insertAllFiles}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All to Note</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'pdf')}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".doc,.docx,.txt,.rtf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'document')}
        />
      </div>
    </div>
  );
}