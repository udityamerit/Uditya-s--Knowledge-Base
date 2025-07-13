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
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo and Brand */}
          <div className="flex items-center gap-dynamic">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-dynamic-sm">TN</span>
              </div>
              <span className="text-dynamic-lg font-bold text-gray-900 dark:text-white hidden md:block">
                Tech Notes
              </span>
              <span className="text-dynamic-base font-bold text-gray-900 dark:text-white md:hidden">
                TN
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          {onSearchChange && (
            <div className="flex-1 max-w-sm lg:max-w-lg mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="form-responsive pl-10 lg:pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="btn-responsive !p-2 !min-h-auto rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              <div className="flex items-center gap-2">
                {!isAdminRoute && (
                  <Link
                    to="/admin"
                    className="btn-responsive bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin Panel</span>
                    <span className="lg:hidden">Admin</span>
                  </Link>
                )}
                {isAdminRoute && (
                  <Link
                    to="/notes"
                    className="btn-responsive bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <span className="hidden lg:inline">Public View</span>
                    <span className="lg:hidden">Public</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn-responsive bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <span className="hidden lg:inline">Sign Out</span>
                  <span className="lg:hidden">Out</span>
                </button>
                <div className="btn-responsive bg-orange-600 text-white rounded-lg hidden xl:flex">
                  Admin Mode
                </div>
              </div>
            ) : (
              /* Public user - show admin login option */
              <div className="flex items-center gap-2">
                {/* Free Download Badge */}
                <div className="hidden lg:flex items-center gap-2 btn-responsive bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                  <Download className="w-4 h-4" />
                  <span>Free Access</span>
                </div>
                
                {/* Admin Login Button */}
                <Link
                  to="/login"
                  className="btn-responsive bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin Login</span>
                  <span className="lg:hidden">Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}