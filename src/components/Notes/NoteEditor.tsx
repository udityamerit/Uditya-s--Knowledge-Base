import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Eye, EyeOff, Upload, Plus } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { FileUploadPanel } from './FileUploadPanel';
import type { Database } from '../../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface NoteEditorProps {
  note?: Note;
  categories: Category[];
  onSave: (data: {
    title: string;
    content: string;
    category_id?: string;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function NoteEditor({ note, categories, onSave, onCancel, loading }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [categoryId, setCategoryId] = useState(note?.category_id || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileInsert = (insertText: string) => {
    setContent(prev => prev + insertText);
    setShowUploadPanel(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await onSave({
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId || undefined,
      tags
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              title="Upload Files & Media"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Content</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-200 mb-1">
                🚀 Enhanced Content Upload System
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Upload PDFs, images, videos, documents, and links. All files preserve original format for proper downloads.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Content</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            placeholder="Enter note title..."
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
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="space-y-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Add tags (press Enter or comma to add)"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              data-color-mode={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              preview={previewMode ? 'preview' : 'edit'}
              height={window.innerWidth < 640 ? 300 : 400}
              visibleDragBar={false}
            />
          </div>
          <div className="mt-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium mb-2">
              💡 <strong>Pro Tip:</strong> Use the "Upload Content" button to add professional file presentations
            </p>
            <ul className="text-xs sm:text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• <strong>PDFs:</strong> Interactive preview with download buttons</li>
              <li>• <strong>Images & Videos:</strong> Embedded with proper formatting</li>
              <li>• <strong>Documents:</strong> Professional download cards</li>
              <li>• <strong>Links:</strong> Clean reference formatting</li>
            </ul>
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
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Note'}</span>
          </button>
        </div>
      </form>

      {/* Upload Panel Modal */}
      {showUploadPanel && (
        <FileUploadPanel
          onFileInsert={handleFileInsert}
          onClose={() => setShowUploadPanel(false)}
        />
      )}
    </div>
  );
}