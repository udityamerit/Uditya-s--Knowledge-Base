import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  fallbackTo?: string;
  showHomeButton?: boolean;
  className?: string;
}

export function BackButton({ fallbackTo = '/', showHomeButton = true, className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback navigation
      navigate(fallbackTo);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 text-sm touch-target"
        title="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </button>
      
      {showHomeButton && location.pathname !== '/' && (
        <button
          onClick={handleHome}
          className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 text-sm touch-target"
          title="Go to home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
      )}
    </div>
  );
}