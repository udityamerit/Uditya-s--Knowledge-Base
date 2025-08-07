import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hash, Folder, Clock, BookOpen, Home, Settings, LogIn, ChevronDown, ChevronRight, FolderOpen, Brain, Code, Database, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import type { Database as DBType } from '../../lib/supabase';

type Category = DBType['public']['Tables']['categories']['Row'];
type Note = DBType['public']['Tables']['notes']['Row'];
type Folder = DBType['public']['Tables']['folders']['Row'] & {
  children?: Folder[];
  depth?: number;
};

interface SidebarProps {
  categories: Category[];
  recentNotes: Note[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ categories, recentNotes, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { folderTree, getFoldersByCategory } = useFolders();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  
  // Function to get appropriate folder icon based on folder name and content
  const getFolderIcon = (folderName: string, isExpanded: boolean = false) => {
    const name = folderName.toLowerCase();
    
    // AI/ML related folders
    if (name.includes('ai') || name.includes('artificial') || name.includes('intelligence') || 
        name.includes('ml') || name.includes('machine') || name.includes('learning') ||
        name.includes('neural') || name.includes('deep')) {
      return <Brain className="w-4 h-4" />;
    }
    
    // Programming/Code related folders
    if (name.includes('code') || name.includes('programming') || name.includes('python') ||
        name.includes('javascript') || name.includes('react') || name.includes('algorithm') ||
        name.includes('development') || name.includes('software')) {
      return <Code className="w-4 h-4" />;
    }
    
    // Data Science/Analytics related folders
    if (name.includes('data') || name.includes('analytics') || name.includes('statistics') ||
        name.includes('analysis') || name.includes('visualization') || name.includes('science')) {
      return <BarChart3 className="w-4 h-4" />;
    }
    
    // Database related folders
    if (name.includes('database') || name.includes('sql') || name.includes('db') ||
        name.includes('storage') || name.includes('query')) {
      return <Database className="w-4 h-4" />;
    }
    
    // Documentation/Notes related folders
    if (name.includes('doc') || name.includes('note') || name.includes('guide') ||
        name.includes('tutorial') || name.includes('reference') || name.includes('manual')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Research/Theory related folders
    if (name.includes('research') || name.includes('theory') || name.includes('concept') ||
        name.includes('idea') || name.includes('innovation') || name.includes('study')) {
      return <Lightbulb className="w-4 h-4" />;
    }
    
    // Default folder icons based on state
    return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />;
  };

  // Check if we're on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolderTree = (folders: Folder[], depth = 0) => {
    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasChildren = folder.children && folder.children.length > 0;
      const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : '';
      
      return (
        <div key={folder.id}>
          <div className={`flex items-center ${indentClass}`}>
            <Link
              to={`/category/${folder.category_id}?folder=${folder.id}`}
              className={`flex-1 ${linkClasses(location.pathname === `/category/${folder.category_id}` && location.search.includes(`folder=${folder.id}`))}`}
              onClick={onClose}
            >
              <div className="flex items-center space-x-2">
                {getFolderIcon(folder.name, isExpanded)}
                <span className="truncate">{folder.name}</span>
              </div>
            </Link>
            {hasChildren && (
              <button
                onClick={() => toggleFolder(folder.id)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
          
          {/* Render children */}
          {hasChildren && isExpanded && (
            <div className="mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-3 animate-fade-in-up">
              {renderFolderTree(folder.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const linkClasses = (isActive: boolean) =>
    `flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-full sm:w-80 lg:w-64 xl:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Navigation */}
            <nav className="space-y-1 sm:space-y-2">
              <Link
                to="/"
                className={linkClasses(location.pathname === '/')}
                onClick={onClose}
              >
                <Home className="w-4 h-4" />
                <span className="truncate">Home</span>
              </Link>
              
              <Link
                to="/notes"
                className={linkClasses(location.pathname === '/notes')}
                onClick={onClose}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate">All Notes</span>
              </Link>
              
              {/* Admin Access */}
              {isAuthenticated ? (
                /* Show admin dashboard if logged in */
                isAdminRoute && (
                  <Link
                    to="/admin"
                    className={linkClasses(location.pathname === '/admin')}
                    onClick={onClose}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="truncate">Manage Content</span>
                  </Link>
                )
              ) : (
                /* Show admin login if not logged in */
                <Link
                  to="/login"
                  className={linkClasses(location.pathname === '/login')}
                  onClick={onClose}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="truncate">Admin Login</span>
                </Link>
              )}
            </nav>

            {/* Categories with Folders */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                Categories
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => {
                  const categoryFolders = folderTree.filter(folder => folder.category_id === category.id);
                  const isExpanded = expandedCategories.has(category.id);
                  const hasFolders = categoryFolders.length > 0;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        <Link
                          to={`/category/${category.id}`}
                          className={`flex-1 ${linkClasses(location.pathname === `/category/${category.id}`)}`}
                          onClick={onClose}
                        >
                          <div
                            className="w-3 h-3 rounded-full transition-transform duration-200 hover:scale-125"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate flex-1">{category.name}</span>
                        </Link>
                        {hasFolders && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Folders */}
                      {hasFolders && isExpanded && (
                        <div className="ml-4 sm:ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-3 animate-fade-in-up">
                          {renderFolderTree(categoryFolders)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Notes */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                Recent Notes
              </h3>
              <div className="space-y-1">
                {recentNotes.slice(0, 5).map((note) => (
                  <Link
                    key={note.id}
                    to={isAdminRoute && isAuthenticated ? `/admin/note/${note.id}/edit` : `/notes/${note.id}`}
                    className="block px-2 sm:px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="truncate font-medium">{note.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['AI', 'ML', 'React', 'Python', 'Algorithms'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Admin Status Indicator */}
            {isAuthenticated && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 sm:p-3 animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Admin Mode Active
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 hidden sm:block">
                  You can upload and manage content
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                By Uditya Narayan Tiwari
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
                {isAuthenticated && isAdminRoute 
                  ? 'Content Management' 
                  : 'Open Access • No Registration Required'
                }
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}