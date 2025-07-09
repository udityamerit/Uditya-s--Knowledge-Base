import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, Download, Settings, LogIn } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearchChange, searchQuery }: HeaderProps) {
  const { isDark, toggle } = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  
  // Check if we're on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TN</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Tech Notes
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          {onSearchChange && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Authentication Status */}
            {isAuthenticated ? (
              /* Admin is logged in */
              <div className="flex items-center space-x-2">
                {!isAdminRoute && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {isAdminRoute && (
                  <Link
                    to="/notes"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Public View
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Sign Out
                </button>
                <div className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm">
                  Admin Mode
                </div>
              </div>
            ) : (
              /* Public user - show admin login option */
              <div className="flex items-center space-x-2">
                {/* Free Download Badge */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  <Download className="w-4 h-4" />
                  <span>Free Access</span>
                </div>
                
                {/* Admin Login Button */}
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}