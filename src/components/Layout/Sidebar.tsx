import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hash, Folder, Clock, BookOpen, Home, Settings, LogIn, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import type { Database } from '../../lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];
type Note = Database['public']['Tables']['notes']['Row'];

interface SidebarProps {
  categories: Category[];
  recentNotes: Note[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ categories, recentNotes, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { folders } = useFolders();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  
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

  const getFoldersByCategory = (categoryId: string) => {
    return folders.filter(folder => folder.category_id === categoryId);
  };

  const linkClasses = (isActive: boolean) =>
    `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 scale-105'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
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
        className={`fixed lg:static inset-y-0 left-0 z-50 sidebar-responsive bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-dynamic space-y-6">
            {/* Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                className={linkClasses(location.pathname === '/')}
                onClick={onClose}
              >
                <Home className="w-4 h-4" />
                <span className="truncate-responsive">Home</span>
              </Link>
              
              <Link
                to="/notes"
                className={linkClasses(location.pathname === '/notes')}
                onClick={onClose}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate-responsive">All Notes</span>
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
                    <span className="truncate-responsive">Manage Content</span>
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
                  <span className="truncate-responsive">Admin Login</span>
                </Link>
              )}
            </nav>

            {/* Categories with Folders */}
            <div>
              <h3 className="text-dynamic-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const categoryFolders = getFoldersByCategory(category.id);
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
                          <span className="truncate-responsive flex-1">{category.name}</span>
                        </Link>
                        {hasFolders && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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
                        <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3 animate-fade-in-up">
                          {categoryFolders.map((folder) => (
                            <Link
                              key={folder.id}
                              to={`/folder/${folder.id}`}
                              className="flex items-center space-x-2 px-2 py-1 text-dynamic-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-200 hover:scale-105"
                              onClick={onClose}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: folder.color }}
                              />
                              <span className="truncate-responsive">{folder.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Notes */}
            <div>
              <h3 className="text-dynamic-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                Recent Notes
              </h3>
              <div className="space-y-1">
                {recentNotes.slice(0, 5).map((note) => (
                  <Link
                    key={note.id}
                    to={isAdminRoute && isAuthenticated ? `/admin/note/${note.id}/edit` : `/notes/${note.id}`}
                    className="block px-3 py-2 text-dynamic-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                    onClick={onClose}
                  >
                    <div className="truncate-responsive font-medium">{note.title}</div>
                    <div className="text-dynamic-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div>
              <h3 className="text-dynamic-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['AI', 'ML', 'React', 'Python', 'Algorithms'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-dynamic-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Admin Status Indicator */}
            {isAuthenticated && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-dynamic-sm font-medium text-orange-800 dark:text-orange-200">
                    Admin Mode Active
                  </span>
                </div>
                <p className="text-dynamic-xs text-orange-700 dark:text-orange-300 mt-1 hidden md:block">
                  You can upload and manage content
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-dynamic border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-dynamic-xs text-gray-500 dark:text-gray-400 truncate-responsive">
                By Uditya Narayan Tiwari
              </p>
              <p className="text-dynamic-xs text-gray-400 dark:text-gray-500 mt-1 hidden md:block">
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