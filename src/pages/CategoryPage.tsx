import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Home, Folder, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoteCard } from '../components/Notes/NoteCard';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategoryAndNotes(id);
    }
  }, [id]);

  const fetchCategoryAndNotes = async (categoryId: string) => {
    try {
      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch notes in this category
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Category not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/notes"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between">
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
            <span>All Notes</span>
          </Link>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
            Free Access
          </span>
        </div>
      </div>

      {/* Notes Grid */}
      <div>
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notes in this category yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new content in {category.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NoteCard note={note} category={category} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Footer */}
      <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Explore More Categories
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Discover more technical content across different topics and domains.
          </p>
          <Link
            to="/notes"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            <span>Browse All Notes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}