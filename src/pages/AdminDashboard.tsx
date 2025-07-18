import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BarChart3, Clock, BookOpen, ArrowLeft, Folder, Tag, AlertTriangle, FolderPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotes } from '../hooks/useNotes';
import { useCategories } from '../hooks/useCategories';
import { useFolders } from '../hooks/useFolders';
import { CategoryEditor } from '../components/Categories/CategoryEditor';
import { FolderEditor } from '../components/Folders/FolderEditor';

export function AdminDashboard() {
  const { notes, loading: notesLoading, deleteNote } = useNotes();
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { folders, createFolder, updateFolder, deleteFolder, getFoldersByCategory } = useFolders();
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [showFolderEditor, setShowFolderEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [selectedCategoryForFolder, setSelectedCategoryForFolder] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [folderLoading, setFolderLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'note' | 'category' | 'folder';
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteNote = async (id: string, title: string) => {
    setDeleteConfirmation({ type: 'note', id, name: title });
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    // Check if category has notes
    const notesInCategory = notes.filter(note => note.category_id === id).length;
    const foldersInCategory = getFoldersByCategory(id).length;
    if (notesInCategory > 0 || foldersInCategory > 0) {
      alert(`Cannot delete category "${name}" because it contains ${notesInCategory} note(s) and ${foldersInCategory} folder(s). Please move or delete them first.`);
      return;
    }
    setDeleteConfirmation({ type: 'category', id, name });
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    // Check if folder has notes
    const notesInFolder = notes.filter(note => note.folder_id === id).length;
    if (notesInFolder > 0) {
      alert(`Cannot delete folder "${name}" because it contains ${notesInFolder} note(s). Please move or delete the notes first.`);
      return;
    }
    setDeleteConfirmation({ type: 'folder', id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === 'note') {
        await deleteNote(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'category') {
        await deleteCategory(deleteConfirmation.id);
      } else if (deleteConfirmation.type === 'folder') {
        await deleteFolder(deleteConfirmation.id);
      }
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleSaveCategory = async (data: { name: string; description: string; color: string }) => {
    setCategoryLoading(true);
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, data);
        if (result.success) {
          setShowCategoryEditor(false);
          setEditingCategory(null);
        }
      } else {
        const result = await createCategory(data);
        if (result.success) {
          setShowCategoryEditor(false);
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSaveFolder = async (data: { name: string; description: string; category_id: string; color: string }) => {
    setFolderLoading(true);
    try {
      if (editingFolder) {
        const result = await updateFolder(editingFolder.id, data);
        if (result.success) {
          setShowFolderEditor(false);
          setEditingFolder(null);
          setSelectedCategoryForFolder('');
        }
      } else {
        const result = await createFolder(data);
        if (result.success) {
          setShowFolderEditor(false);
          setSelectedCategoryForFolder('');
        }
      }
    } catch (error) {
      console.error('Error saving folder:', error);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryEditor(true);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setShowFolderEditor(true);
  };

  const handleCreateFolderForCategory = (categoryId: string) => {
    setSelectedCategoryForFolder(categoryId);
    setShowFolderEditor(true);
  };

  const handleCancelCategoryEditor = () => {
    setShowCategoryEditor(false);
    setEditingCategory(null);
  };

  const handleCancelFolderEditor = () => {
    setShowFolderEditor(false);
    setEditingFolder(null);
    setSelectedCategoryForFolder('');
  };

  const stats = {
    totalNotes: notes.length,
    categories: categories.length,
    folders: folders.length,
    recentNotes: notes.filter(note => 
      new Date(note.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  const loading = notesLoading || categoriesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              Are you sure you want to delete the {deleteConfirmation.type} "{deleteConfirmation.name}"?
              {deleteConfirmation.type === 'note' && (
                <span className="block mt-2 text-sm text-gray-500 dark:text-gray-400">
                  This will permanently remove the note and all its content including any uploaded files.
                </span>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={cancelDelete}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Delete {deleteConfirmation.type === 'note' ? 'Note' : deleteConfirmation.type === 'category' ? 'Category' : 'Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link
              to="/notes"
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Public View</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Content Management Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage your technical notes collection. All changes are immediately visible to the public.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setShowCategoryEditor(true)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            <Tag className="w-4 h-4" />
            <span className="sm:hidden">Category</span>
            <span className="hidden sm:inline">New Category</span>
          </button>
          <Link
            to="/admin/note/new"
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:hidden">Note</span>
            <span className="hidden sm:inline">New Note</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Notes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Folder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.folders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Folders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.recentNotes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Categories & Folders</h2>
            <button
              onClick={() => setShowCategoryEditor(true)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Category</span>
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No categories yet</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Create your first category to organize your notes.</p>
              <button
                onClick={() => setShowCategoryEditor(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors mx-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          ) : (
            categories.map((category) => {
              const notesInCategory = notes.filter(note => note.category_id === category.id).length;
              const categoryFolders = getFoldersByCategory(category.id);
              return (
                <div key={category.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {notesInCategory} {notesInCategory === 1 ? 'note' : 'notes'} • {categoryFolders.length} {categoryFolders.length === 1 ? 'folder' : 'folders'}
                          </p>
                          <Link
                            to={`/category/${category.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            View public page →
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleCreateFolderForCategory(category.id)}
                        className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        title="Add Folder"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Folders in this category */}
                  {categoryFolders.length > 0 && (
                    <div className="mt-4 ml-6 sm:ml-8 space-y-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Folders:</h4>
                      {categoryFolders.map((folder) => {
                        const notesInFolder = notes.filter(note => note.folder_id === folder.id).length;
                        return (
                          <div key={folder.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: folder.color }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{folder.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {notesInFolder} {notesInFolder === 1 ? 'note' : 'notes'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditFolder(folder)}
                                className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Edit Folder"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete Folder"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
            <Link
              to="/admin/note/new"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Note</span>
              <span className="sm:hidden">Note</span>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notes.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Create your first note to get started.</p>
              <Link
                to="/admin/note/new"
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Create Note</span>
              </Link>
            </div>
          ) : (
            notes.slice(0, 10).map((note) => {
              const category = categories.find(cat => cat.id === note.category_id);
              const hasMediaContent = note.content.includes('📄') || note.content.includes('<iframe') || note.content.includes('![') || note.content.includes('data:');
              
              return (
                <div key={note.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                          {note.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {category && (
                            <span
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                          {hasMediaContent && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                              📎 Media Files
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{note.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
                      <Link
                        to={`/notes/${note.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View Note (Public)"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/note/${note.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit Note"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-medium text-orange-800 dark:text-orange-200">
              Enhanced Content Management
            </h3>
            <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">
              You're in admin mode. All content changes are immediately visible to the public. 
              <span className="hidden sm:inline">
                The new upload system embeds files directly into notes using data URLs, ensuring original files are preserved for downloads.
                Users can preview PDFs in full-screen and download the exact files you upload.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Category Editor Modal */}
      {showCategoryEditor && (
        <CategoryEditor
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={handleCancelCategoryEditor}
          loading={categoryLoading}
        />
      )}

      {/* Folder Editor Modal */}
      {showFolderEditor && (
        <FolderEditor
          folder={editingFolder}
          categories={categories}
          selectedCategoryId={selectedCategoryForFolder}
          onSave={handleSaveFolder}
          onCancel={handleCancelFolderEditor}
          loading={folderLoading}
        />
      )}
    </div>
  );
}