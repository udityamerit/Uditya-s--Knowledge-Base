import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Hash, Edit, Download, ArrowLeft, Share2, Eye, ExternalLink, FileText, X, ZoomIn, ZoomOut, Copy, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';
import type { Database } from '../../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface NoteViewProps {
  note: Note;
  category?: Category;
  onExport?: () => void;
}

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
}

interface DownloadUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

function DownloadUrlModal({ isOpen, onClose, fileUrl, fileName }: DownloadUrlModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenFile = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📥 Download File
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{fileName}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              📋 How to Download
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              Click the link below to open and download the file:
            </p>
          </div>

          {/* Direct Download Link */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200 mb-3">
              💡 <strong>Click this link to open and download the file:</strong>
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ExternalLink className="w-5 h-5" />
              <span>🔗 Click Here to Download {fileName}</span>
            </a>
          </div>

          {/* URL Display */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              📎 Or copy this URL and paste it in your browser:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={fileUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono select-all"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={handleCopyUrl}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              🎯 File hosted on Supabase Storage
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleOpenFile}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PDFViewerModal({ isOpen, onClose, pdfUrl, fileName }: PDFViewerModalProps) {
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 pdf-modal-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col pdf-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">PDF Document Preview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 zoom-controls rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 pdf-download-btn text-white rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            {/* Open in New Tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 pdf-preview-btn text-white rounded-lg transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>New Tab</span>
            </a>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${pdfUrl}#zoom=${zoom}`}
            className="w-full h-full border-none pdf-iframe"
            title={fileName}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Use Ctrl+F to search within the document, or download for offline access
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-2 pdf-download-btn text-white rounded-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Original PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NoteView({ note, category, onExport }: NoteViewProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; url: string; fileName: string }>({
    isOpen: false,
    url: '',
    fileName: ''
  });
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean; url: string; fileName: string }>({
    isOpen: false,
    url: '',
    fileName: ''
  });
  const [copiedUrl, setCopiedUrl] = useState('');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: `Check out this technical note: ${note.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // Enhanced PDF download function that creates a proper markdown file
  const handlePDFDownload = () => {
    // Check if note contains Supabase URLs and extract them
    const supabaseUrls = note.content.match(/https:\/\/[^"'\s]+supabase[^"'\s]+/g) || [];
    
    if (supabaseUrls.length > 0) {
      // If there are Supabase URLs, show them in a modal for user to access
      const pdfUrl = supabaseUrls.find(url => url.includes('.pdf')) || supabaseUrls[0];
      const fileName = pdfUrl.split('/').pop() || 'document.pdf';
      setDownloadModal({ isOpen: true, url: pdfUrl, fileName });
    } else {
      // Fallback to markdown export if no Supabase URLs found
      const pdfContent = `# ${note.title}

**Category:** ${category?.name || 'Uncategorized'}
**Last Updated:** ${new Date(note.updated_at).toLocaleDateString()}
**Tags:** ${note.tags?.join(', ') || 'None'}

---

${note.content}

---

*Downloaded from Uditya's Technical Knowledge Base*
*Free educational content by Uditya Narayan Tiwari*
      `.trim();

      const blob = new Blob([pdfContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openPDFModal = (url: string, fileName: string) => {
    setPdfModal({ isOpen: true, url, fileName });
  };

  const closePDFModal = () => {
    setPdfModal({ isOpen: false, url: '', fileName: '' });
  };

  const openDownloadModal = (url: string, fileName: string) => {
    setDownloadModal({ isOpen: true, url, fileName });
  };

  const closeDownloadModal = () => {
    setDownloadModal({ isOpen: false, url: '', fileName: '' });
  };

  // Function to handle file downloads - shows URL modal
  const handleFileDownload = (url: string, fileName: string) => {
    // Show the download modal with the Supabase URL
    setDownloadModal({ isOpen: true, url, fileName });
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Note Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {note.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </span>
              </div>
              
              {category && (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Link
                    to={`/category/${category.id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </div>
              )}

              {!isAdminRoute && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                    Free Access
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Share Button - Only on public routes */}
            {!isAdminRoute && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Share Note"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Enhanced Download Button - Only on public routes - ALWAYS VISIBLE */}
            {!isAdminRoute && (
              <button
                onClick={handlePDFDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
                title="Download Complete Note"
              >
                <Download className="w-4 h-4" />
                <span>Download Note</span>
              </button>
            )}
            
            {/* Edit Button - Only on admin routes */}
            {isAdminRoute && (
              <Link
                to={`/admin/note/${note.id}/edit`}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Edit Note"
              >
                <Edit className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Note Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code
                    className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {children}
                    </table>
                  </div>
                );
              },
              // Enhanced handling for Supabase Storage links
              a({ href, children, ...props }) {
                // Check if it's a Supabase Storage URL
                if (href?.includes('supabase') && href?.includes('storage')) {
                  const fileName = href.split('/').pop() || 'file';
                  
                  // Check if it's a PDF preview button
                  if (children?.toString().includes('Preview PDF')) {
                    return (
                      <button
                        onClick={() => openPDFModal(href, fileName)}
                        className="pdf-preview-btn inline-flex items-center space-x-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 mr-3 mb-3 shadow-lg"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Preview PDF</span>
                      </button>
                    );
                  }
                  
                  // Check if it's a download button
                  if (children?.toString().includes('Download')) {
                    return (
                      <div className="inline-flex items-center space-x-2 mb-3">
                        <button
                          onClick={() => setDownloadModal({ isOpen: true, url: href, fileName })}
                          className="pdf-download-btn inline-flex items-center space-x-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                        >
                          <Download className="w-5 h-5" />
                          <span>Download File</span>
                        </button>
                        <button
                          onClick={() => handleCopyUrl(href)}
                          className={`inline-flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${
                            copiedUrl === href 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {copiedUrl === href ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  }
                }
                
                // Regular links
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              iframe({ src, width, height, style, ...props }) {
                const fileName = src?.split('/').pop() || 'document.pdf';
                return (
                  <div className="my-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="pdf-header">
                      <div className="pdf-title">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Document Preview
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {fileName}
                          </p>
                        </div>
                      </div>
                      <div className="pdf-actions">
                        <button
                          onClick={() => openPDFModal(src || '', fileName)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Full Screen</span>
                        </button>
                        <button
                          onClick={() => handleFileDownload(src || '', fileName)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>New Tab</span>
                        </a>
                      </div>
                    </div>
                    <div className="relative">
                      <iframe
                        src={src}
                        width={width || '100%'}
                        height={height || '600px'}
                        className="pdf-iframe w-full shadow-inner"
                        style={{ minHeight: '600px', ...style }}
                        {...props}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent dark:from-gray-800/50 pointer-events-none rounded-lg"></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Click "Open Original" to view the file in a new tab
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setDownloadModal({ isOpen: true, url: src || '', fileName })}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handleCopyUrl(src || '')}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            copiedUrl === src 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {copiedUrl === src ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              },
              // Handle images from Supabase Storage
              img({ src, alt, ...props }) {
                return (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    {...props}
                  />
                );
              },
              // Handle videos from Supabase Storage
              video({ src, children, ...props }) {
                return (
                  <video
                    controls
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    {...props}
                  >
                    {children}
                  </video>
                );
              },
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Enhanced Footer - Only on public routes */}
      {!isAdminRoute && (
        <div className="mt-8">
          {/* Download CTA */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 text-center border border-green-200 dark:border-green-800 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Free Educational Content
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              This content is freely available for download, sharing, and educational use. 
              All files are stored securely and can be accessed directly without restrictions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handlePDFDownload}
                className="flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download Complete Note</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>Share This Note</span>
              </button>
            </div>
          </div>

          {/* Author Credit */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created by <span className="font-medium text-gray-700 dark:text-gray-300">Uditya Narayan Tiwari</span> • 
              Part of the free technical knowledge base
            </p>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfModal.isOpen}
        onClose={closePDFModal}
        pdfUrl={pdfModal.url}
        fileName={pdfModal.fileName}
      />

      {/* Download URL Modal */}
      <DownloadUrlModal
        isOpen={downloadModal.isOpen}
        onClose={closeDownloadModal}
        fileUrl={downloadModal.url}
        fileName={downloadModal.fileName}
      />
    </div>
  );
}