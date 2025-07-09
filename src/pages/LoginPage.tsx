import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div>
      <LoginForm onSuccess={() => window.location.href = '/admin'} />
      
      {/* Public Access Notice */}
      <div className="fixed bottom-4 left-4 max-w-sm">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-3 rounded-lg text-xs">
          <p className="font-medium mb-1">📚 Public Access Available</p>
          <p>All content remains freely accessible to everyone. Admin login is only for content management.</p>
        </div>
      </div>

      {/* Admin Access Notice */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="bg-gray-800 text-white p-3 rounded-lg text-xs opacity-75">
          <p className="font-medium mb-1">🔐 Admin Access</p>
          <p>This page is for content management only. All content remains freely accessible to everyone.</p>
        </div>
      </div>
    </div>
  );
}