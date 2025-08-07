import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Folder, BookOpen, ChevronRight, Brain, Code, Database, BarChart3, FileText, Lightbulb, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoteCard } from '../components/Notes/NoteCard';
import { BackButton } from '../components/Layout/BackButton';
import { useFolders } from '../hooks/useFolders';
import type { Database as DBType } from '../lib/supabase';

type Note = DBType['public']['Tables']['notes']['Row'];
type Category = DBType['public']['Tables']['categories']['Row'];
type Folder = DBType['public']['Tables']['folders']['Row'];

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folder');
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { folders, getFoldersByCategory, getFoldersByParent, getFolderPath } = useFolders();
  
  // Function to get appropriate folder icon based on folder name and content
  const getFolderIcon = (folderName: string) => {
    const name = folderName.toLowerCase();
    
    // AI/ML related folders
    if (name.includes('ai') || name.includes('artificial') || name.includes('intelligence') || 
        name.includes('ml') || name.includes('machine') || name.includes('learning') ||
        name.includes('neural') || name.includes('deep')) {
      return <Brain className="w-5 h-5" />;
    }
    
    // Programming/Code related folders
    if (name.includes('code') || name.includes('programming') || name.includes('python') ||
        name.includes('javascript') || name.includes('react') || name.includes('algorithm') ||
        name.includes('development') || name.includes('software')) {
      return <Code className="w-5 h-5" />;
    }
    
    // Data Science/Analytics related folders
    if (name.includes('data') || name.includes('analytics') || name.includes('statistics') ||
        name.includes('analysis') || name.includes('visualization') || name.includes('science')) {
      return <BarChart3 className="w-5 h-5" />;
    }
    
    // Database related folders
    if (name.includes('database') || name.includes('sql') || name.includes('db') ||
        name.includes('storage') || name.includes('query')) {
      return <Database className="w-5 h-5" />;
    }
    
    // Documentation/Notes related folders
    if (name.includes('doc') || name.includes('note') || name.includes('guide') ||
        name.includes('tutorial') || name.includes('reference') || name.includes('manual')) {
      return <FileText className="w-5 h-5" />;
    }
    
    // Research/Theory related folders
    if (name.includes('research') || name.includes('theory') || name.includes('concept') ||
        name.includes('idea') || name.includes('innovation') || name.includes('study')) {
      return <Lightbulb className="w-5 h-5" />;
    }
    
    // Default folder icon
    return <Folder className="w-5 h-5" />;
  };

  useEffect(() => {
    if (id) {
      fetchCategoryAndNotes(id, folderId);
    }
  }, [id, folderId]);

  const buildBreadcrumb = (folder: Folder | null, category: Category): { name: string; path: string }[] => {
    const breadcrumb = [{ name: category.name, path: `/category/${category.id}` }];
    
    if (folder) {
      const folderPath = getFolderPath(folder.id);
      const pathParts = folderPath.split(' > ');
      
      // Build breadcrumb for nested folders
      let currentPath = `/category/${category.id}`;
      pathParts.forEach((part, index) => {
        const folderForPart = folders.find(f => f.name === part && f.category_id === category.id);
        if (folderForPart) {
          currentPath = `/category/${category.id}?folder=${folderForPart.id}`;
          breadcrumb.push({ name: part, path: currentPath });
        }
      });
    }
    
    return breadcrumb;
  };

  const fetchCategoryAndNotes = async (categoryId: string, folderIdParam?: string | null) => {
    try {
      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch folder details if folder ID is provided
      if (folderIdParam) {
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('*')
          .eq('id', folderIdParam)
          .single();

        if (folderError) throw folderError;
        setSelectedFolder(folderData);
      } else {
        setSelectedFolder(null);
      }
      // Fetch notes in this category/folder
      let notesQuery = supabase
        .from('notes')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .order('title', { ascending: true });
      
      if (folderIdParam) {
        notesQuery = notesQuery.eq('folder_id', folderIdParam);
      } else {
        notesQuery = notesQuery.is('folder_id', null);
      }
      
      const { data: notesData, error: notesError } = await notesQuery;

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get root folders and subfolders for the current folder
  const categoryFolders = category ? getFoldersByCategory(category.id).filter(f => !f.parent_folder_id) : [];
  const subfolders = selectedFolder ? getFoldersByParent(selectedFolder.id) : [];
  const breadcrumb = category ? buildBreadcrumb(selectedFolder, category) : [];

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <BackButton fallbackTo="/notes" />
      </div>

      {/* Category Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: selectedFolder?.color || category.color }}
          >
            <div className="text-white">
              {selectedFolder ? getFolderIcon(selectedFolder.name) : <Folder className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {selectedFolder ? selectedFolder.name : category.name}
            </h1>
            {selectedFolder ? (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-2">
                {selectedFolder.description || `Sub-category in ${category.name}`}
              </p>
            ) : category.description && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Breadcrumb */}
        {breadcrumb.length > 1 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-gray-900 dark:text-white font-medium">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
            Free Access
          </span>
        </div>
        
        {/* Folders */}
        {((selectedFolder && subfolders.length > 0) || (!selectedFolder && categoryFolders.length > 0)) && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {selectedFolder ? 'Subfolders' : 'Folders'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(selectedFolder ? subfolders : categoryFolders).map((folder) => (
                <Link
                  key={folder.id}
                  to={`/category/${category.id}?folder=${folder.id}`}
                  className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="text-gray-600 dark:text-gray-400">
                    {getFolderIcon(folder.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {folder.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div>
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedFolder 
                ? `No notes in this sub-category yet`
                : `No notes in this category yet`
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new content in {selectedFolder?.name || category.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      <div className="text-center py-6 sm:py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Explore More Categories
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
            Discover more technical content across different topics and domains.
          </p>
          <Link
            to="/notes"
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            <BookOpen className="w-5 h-5" />
            <span>Browse All Notes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}