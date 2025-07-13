import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useNotes } from '../../hooks/useNotes';

interface LayoutProps {
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function Layout({ showSearch, onSearchChange, searchQuery }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notes, categories } = useNotes();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <Header
        onSearchChange={showSearch ? onSearchChange : undefined}
        searchQuery={searchQuery}
      />
      
      <div className="flex relative">
        <Sidebar
          categories={categories}
          recentNotes={notes}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-0 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-40 btn-responsive !p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="container-responsive py-dynamic">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}