import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, TrendingUp, Download, Users, ChevronRight, Folder, Brain, Code, Database as DatabaseIcon, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { NoteCard } from '../components/Notes/NoteCard';
import { BackButton } from '../components/Layout/BackButton';
import { useNotes } from '../hooks/useNotes';
import { useFolders } from '../hooks/useFolders';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];

export function HomePage() {
  const { notes, categories, loading, searchNotes } = useNotes();
  const { folders, getFoldersByCategory } = useFolders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
        const results = await searchNotes(searchQuery);
        setFilteredNotes(results);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes, searchNotes]);

  const stats = {
    totalNotes: notes.length,
    categories: categories.length,
    recentNotes: notes.filter(note => 
      new Date(note.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  // Function to get appropriate folder icon based on folder name and content
  const getFolderIcon = (folderName: string) => {
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
      return <DatabaseIcon className="w-4 h-4" />;
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
    
    // Default folder icon
    return <Folder className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up w-full max-w-none">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <BackButton fallbackTo="/" showHomeButton={false} />
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 animate-scale-in px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          Free Technical Knowledge Base
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A curated collection of AI, ML, and computer science knowledge by Uditya Narayan Tiwari. 
          Explore concepts, algorithms, and implementations - completely free with no registration required.
        </p>
        
        {/* Free Access Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-medium shadow-lg animate-bounce-slow text-sm">
          <Download className="w-5 h-5" />
          <span>100% Free • Download Anytime</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Notes Available</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left rounded-lg" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Topic Categories</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left rounded-lg sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.recentNotes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Updated This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Browse by Category
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length} categories available
          </div>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => {
                const categoryNotes = notes.filter(note => note.category_id === category.id);
                const categoryFolders = getFoldersByCategory(category.id);
                
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full transition-transform duration-200 group-hover:scale-125"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{categoryNotes.length} notes</span>
                        <span>{categoryFolders.length} folders</span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                    </div>
                    
                    {/* Show top folders if available */}
                    {categoryFolders.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-wrap gap-2">
                          {categoryFolders.slice(0, 3).map((folder) => (
                            <div
                              key={folder.id}
                              className="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"
                            >
                              {getFolderIcon(folder.name)}
                              <span className="truncate max-w-20">{folder.name}</span>
                            </div>
                          ))}
                          {categoryFolders.length > 3 && (
                            <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-500">
                              +{categoryFolders.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '0.5s' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 focus:shadow-md"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? 'Search Results' : 'Latest Notes'}
          </h2>
          {isSearching && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 sm:py-12 animate-fade-in-up px-4">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes found' : 'No notes available yet'}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'Try a different search term or browse all available notes.' 
                : 'Check back soon for new technical content.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4">
            {filteredNotes.slice(0, 10).map((note, index) => {
              const category = categories.find(cat => cat.id === note.category_id);
              return (
                <div
                  key={note.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(index * 100) + 600}ms` }}
                >
                  <NoteCard note={note} category={category} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="text-center py-6 sm:py-8 border-t border-gray-200 dark:border-gray-700 animate-fade-in-up px-4">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Open Knowledge Sharing by Uditya Narayan Tiwari
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
            All content is freely available for learning, sharing, and downloading. 
            No registration, no paywalls, no restrictions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Open Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Free Downloads</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>No Registration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}