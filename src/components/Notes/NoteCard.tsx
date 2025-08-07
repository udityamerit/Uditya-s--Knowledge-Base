import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Hash, Eye, Edit, Download, FileText, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '../../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface NoteCardProps {
  note: Note;
  category?: Category;
}

export function NoteCard({ note, category }: NoteCardProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const getPreview = (content: string) => {
    // Remove markdown formatting for preview
    const cleanContent = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
    return cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
  };

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if note contains Supabase URLs and extract them
    const supabaseUrls = note.content.match(/https:\/\/[^"'\s]+supabase[^"'\s]+/g) || [];
    
    if (supabaseUrls.length > 0) {
      // If there are Supabase URLs, open the first one in a new tab to show the URL
      const fileUrl = supabaseUrls[0];
      // Create a simple page that shows the URL and opens the file
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>File Access - ${note.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .url-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; }
              .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px 0 0; }
              .btn:hover { background: #0056b3; }
              .btn-success { background: #28a745; }
              .btn-success:hover { background: #1e7e34; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>📄 File Access</h2>
              <p><strong>Note:</strong> ${note.title}</p>
              <p>Here is the direct Supabase URL to access your file:</p>
              <div class="url-box">${fileUrl}</div>
              <a href="${fileUrl}" target="_blank" class="btn btn-success">🔗 Open File in New Tab</a>
              <button onclick="navigator.clipboard.writeText('${fileUrl}').then(() => alert('URL copied to clipboard!'))" class="btn">📋 Copy URL</button>
              <button onclick="window.close()" class="btn" style="background: #6c757d;">✖️ Close</button>
            </div>
            <script>
              // Auto-focus and select the URL for easy copying
              window.onload = function() {
                console.log('File URL: ${fileUrl}');
              }
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else {
      // Fallback to markdown export if no Supabase URLs found
      const content = `# ${note.title}\n\n${note.content}`;
      const blob = new Blob([content], { type: 'text/markdown' });
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

  // Check if note contains PDF content
  const hasPDFContent = note.content.includes('📄') || note.content.includes('.pdf');
  const hasMediaContent = note.content.includes('<iframe') || note.content.includes('![') || hasPDFContent;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link
              to={isAdminRoute ? `/admin/note/${note.id}/edit` : `/notes/${note.id}`}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {note.title}
              </h3>
            </Link>
            
            {category && (
              <div className="flex items-center space-x-2 mt-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Content Type Indicators */}
            {hasPDFContent && (
              <div className="p-2 text-red-500 transition-all duration-200" title="Contains PDF">
                <FileText className="w-4 h-4" />
              </div>
            )}
            
            {/* Free Download Button - Only visible on public routes and ALWAYS VISIBLE */}
            {!isAdminRoute && (
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110 bg-green-50 dark:bg-green-900/20 rounded-lg"
                title="Download Note"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {/* Edit Button - Only visible on admin routes */}
            {isAdminRoute && (
              <Link
                to={`/admin/note/${note.id}/edit`}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                title="Edit Note"
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Content Preview */}

        {/* Media Content Indicator */}
        {hasMediaContent && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Contains downloadable content
            </span>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isAdminRoute && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                Free
              </span>
            )}
            <Link
              to={isAdminRoute ? `/admin/note/${note.id}/edit` : `/notes/${note.id}`}
              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105"
            >
              {isAdminRoute ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isAdminRoute ? 'Edit' : 'Read'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}