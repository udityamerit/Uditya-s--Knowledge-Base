import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoteEditor } from '../components/Notes/NoteEditor';
import { BackButton } from '../components/Layout/BackButton';
import { useNotes } from '../hooks/useNotes';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, createNote, updateNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isEditing = id && id !== 'new';

  useEffect(() => {
    if (isEditing) {
      fetchNote(id);
    } else {
      setInitialLoading(false);
    }
  }, [id, isEditing]);

  const fetchNote = async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) throw error;
      setNote(data);
    } catch (err: any) {
      console.error('Error fetching note:', err);
      navigate('/admin');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (data: {
    title: string;
    content: string;
    category_id?: string;
    tags: string[];
  }) => {
    setLoading(true);
    try {
      if (isEditing && note) {
        const result = await updateNote(note.id, data);
        if (result.success) {
          // Show success message
          setShowSuccessMessage(true);
          
          // Redirect to admin after 2 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        }
      } else {
        const result = await createNote(data);
        if (result.success && result.data) {
          // Show success message
          setShowSuccessMessage(true);
          
          // Redirect to admin after 2 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation */}
      <div className="mb-6">
        <BackButton fallbackTo="/admin" />
      </div>
      
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isEditing ? 'Note Updated Successfully!' : 'Note Created Successfully!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your content has been saved and is now available to everyone. Redirecting to admin dashboard...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      <NoteEditor
        note={note || undefined}
        categories={categories}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}