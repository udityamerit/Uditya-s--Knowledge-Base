import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoteView } from '../components/Notes/NoteView';
import { BackButton } from '../components/Layout/BackButton';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export function NotePage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNote(id);
    }
  }, [id]);

  const fetchNote = async (noteId: string) => {
    try {
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('is_archived', false)
        .single();

      if (noteError) throw noteError;
      setNote(noteData);

      if (noteData.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', noteData.category_id)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!note) return;

    // Check if note contains Supabase URLs and extract them
    const supabaseUrls = note.content.match(/https:\/\/[^"'\s]+supabase[^"'\s]+/g) || [];
    
    if (supabaseUrls.length > 0) {
      // If there are Supabase URLs, show them in a new tab with the URL displayed
      const fileUrl = supabaseUrls.find(url => url.includes('.pdf')) || supabaseUrls[0];
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Download - ${note.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
              .container { max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .url-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px; }
              .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px 0 0; border: none; cursor: pointer; }
              .btn:hover { background: #0056b3; }
              .btn-success { background: #28a745; }
              .btn-success:hover { background: #1e7e34; }
              .btn-info { background: #17a2b8; }
              .btn-info:hover { background: #138496; }
              .info-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>📄 File Download - ${note.title}</h2>
              <div class="info-box">
                <p><strong>💡 How to access your file:</strong></p>
                <ol>
                  <li>Click "Open File" to view/download the original file</li>
                  <li>Copy the URL below to share or bookmark</li>
                  <li>The file is hosted securely on Supabase Storage</li>
                </ol>
              </div>
              <p><strong>Direct Supabase Storage URL:</strong></p>
              <div class="url-box" id="urlBox">${fileUrl}</div>
              <a href="${fileUrl}" target="_blank" class="btn btn-success">🔗 Open File</a>
              <button onclick="copyUrl()" class="btn btn-info">📋 Copy URL</button>
              <button onclick="window.close()" class="btn" style="background: #6c757d;">✖️ Close</button>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
                <p><strong>About this file:</strong></p>
                <ul>
                  <li>Hosted on Supabase Storage (secure cloud storage)</li>
                  <li>Direct access - no registration required</li>
                  <li>Original file format preserved</li>
                  <li>Free educational content by Uditya Narayan Tiwari</li>
                </ul>
              </div>
            </div>
            <script>
              function copyUrl() {
                const url = '${fileUrl}';
                navigator.clipboard.writeText(url).then(() => {
                  alert('✅ URL copied to clipboard!');
                }).catch(() => {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = url;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('✅ URL copied to clipboard!');
                });
              }
              
              // Auto-select URL on click
              document.getElementById('urlBox').onclick = function() {
                const range = document.createRange();
                range.selectNode(this);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !note) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div className="animate-fade-in">
      {/* Enhanced Navigation */}
      <div className="flex items-center justify-between mb-6">
        <BackButton fallbackTo="/notes" />
        
        {/* Author Credit */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
          <span>By Uditya Narayan Tiwari</span>
        </div>
      </div>

      <NoteView 
        note={note} 
        category={category || undefined} 
        onExport={handleExport}
      />
    </div>
  );
}