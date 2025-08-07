import React, { useState, useEffect } from 'react';
import { Save, X, Folder, Palette } from 'lucide-react';
import { BackButton } from '../Layout/BackButton';
import type { Database } from '../../lib/supabase';

type Folder = Database['public']['Tables']['folders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface FolderEditorProps {
  folder?: Folder;
  categories: Category[];
  selectedCategoryId?: string;
  parentFolderId?: string;
  onSave: (data: {
    name: string;
    description: string;
    category_id: string;
    color: string;
    parent_folder_id?: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

import { useFolders } from '../../hooks/useFolders';

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

export function FolderEditor({ folder, categories, selectedCategoryId, parentFolderId, onSave, onCancel, loading }: FolderEditorProps) {
  const { folders, getFoldersByCategory, getFolderPath, getDescendantFolders } = useFolders();
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [categoryId, setCategoryId] = useState(folder?.category_id || selectedCategoryId || '');
  const [selectedParentId, setSelectedParentId] = useState(folder?.parent_folder_id || parentFolderId || '');
  const [color, setColor] = useState(folder?.color || '#6B7280');

  // Get available parent folders (exclude self and descendants to prevent circular references)
  const getAvailableParentFolders = () => {
    if (!categoryId) return [];
    
    let availableFolders = getFoldersByCategory(categoryId);
    
    if (folder) {
      // Exclude the folder itself
      availableFolders = availableFolders.filter(f => f.id !== folder.id);
      
      // Exclude all descendant folders to prevent circular references
      const descendants = getDescendantFolders(folder.id);
      const descendantIds = new Set(descendants.map(d => d.id));
      availableFolders = availableFolders.filter(f => !descendantIds.has(f.id));
    }
    
    return availableFolders;
  };

  const availableParentFolders = getAvailableParentFolders();

  // Reset parent folder when category changes
  useEffect(() => {
    if (categoryId !== folder?.category_id) {
      setSelectedParentId('');
    }
  }, [categoryId, folder?.category_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    await onSave({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId,
      color,
      parent_folder_id: selectedParentId || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {folder ? 'Edit Folder' : 'Create New Folder'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Enter folder name..."
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Folder */}
          {categoryId && (
            <div>
              <label htmlFor="parentFolder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Folder (Optional)
              </label>
              <select
                id="parentFolder"
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              >
                <option value="">No parent folder (root level)</option>
                {availableParentFolders.map((parentFolder) => (
                  <option key={parentFolder.id} value={parentFolder.id}>
                    {getFolderPath(parentFolder.id)}
                  </option>
                ))}
              </select>
              {availableParentFolders.length === 0 && categoryId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No available parent folders in this category. This folder will be created at the root level.
                </p>
              )}
              {folder && selectedParentId && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  💡 Moving this folder will also move all its subfolders and notes.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
              placeholder="Enter folder description..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Folder Color
            </label>
            <div className="space-y-3">
              {/* Selected Color Preview */}
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {color}
                </span>
              </div>
              
              {/* Color Grid */}
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      color === presetColor 
                        ? 'border-gray-900 dark:border-white shadow-lg' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
              
              {/* Custom Color Input */}
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Custom color</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !categoryId}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}