import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoteView } from '../components/Notes/NoteView';
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
      // If there are Supabase URLs, open the first PDF/document URL
      const pdfUrl = supabaseUrls.find(url => url.includes('.pdf')) || supabaseUrls[0];
      window.open(pdfUrl, '_blank');
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
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link
            to="/notes"
            className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes</span>
          </Link>
        </div>
        
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