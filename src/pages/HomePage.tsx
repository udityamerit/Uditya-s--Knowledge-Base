import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, TrendingUp, Download, Users, Home, ArrowLeft } from 'lucide-react';
import { NoteCard } from '../components/Notes/NoteCard';
import { useNotes } from '../hooks/useNotes';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];

export function HomePage() {
  const { notes, categories, loading, searchNotes } = useNotes();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Navigation */}
      <div className="flex-responsive justify-between">
        <Link
          to="/"
          className="btn-responsive text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 gap-2"
        >
          <Home className="w-4 h-4" />
          <span className="hidden md:inline">Back to Home</span>
          <span className="md:hidden">Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-4 animate-scale-in">
        <h1 className="text-dynamic-3xl font-bold text-gray-900 dark:text-white">
          Free Technical Knowledge Base
        </h1>
        <p className="text-dynamic-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          A curated collection of AI, ML, and computer science knowledge by Uditya Narayan Tiwari. 
          Explore concepts, algorithms, and implementations - completely free with no registration required.
        </p>
        
        {/* Free Access Banner */}
        <div className="inline-flex items-center gap-2 btn-responsive bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-medium shadow-lg animate-bounce-slow">
          <Download className="w-5 h-5" />
          <span>100% Free • Download Anytime</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-auto-fit">
        <div className="card-responsive bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-dynamic-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
              <p className="text-dynamic-sm text-gray-600 dark:text-gray-400">Free Notes Available</p>
            </div>
          </div>
        </div>
        
        <div className="card-responsive bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-dynamic-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
              <p className="text-dynamic-sm text-gray-600 dark:text-gray-400">Topic Categories</p>
            </div>
          </div>
        </div>
        
        <div className="card-responsive bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-dynamic-2xl font-bold text-gray-900 dark:text-white">{stats.recentNotes}</p>
              <p className="text-dynamic-sm text-gray-600 dark:text-gray-400">Updated This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-dynamic-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 focus:shadow-md"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div>
        <div className="flex-responsive justify-between mb-6">
          <h2 className="text-dynamic-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? 'Search Results' : 'Latest Notes'}
          </h2>
          {isSearching && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-dynamic-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes found' : 'No notes available yet'}
            </h3>
            <p className="text-dynamic-base text-gray-600 dark:text-gray-400 px-4">
              {searchQuery 
                ? 'Try a different search term or browse all available notes.' 
                : 'Check back soon for new technical content.'
              }
            </p>
          </div>
        ) : (
          <div className="grid-auto-fit">
            {filteredNotes.map((note, index) => {
              const category = categories.find(cat => cat.id === note.category_id);
              return (
                <div
                  key={note.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NoteCard note={note} category={category} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700 animate-fade-in-up">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-dynamic-xl font-semibold text-gray-900 dark:text-white mb-2">
            Open Knowledge Sharing by Uditya Narayan Tiwari
          </h3>
          <p className="text-dynamic-base text-gray-600 dark:text-gray-400 mb-4 px-4">
            All content is freely available for learning, sharing, and downloading. 
            No registration, no paywalls, no restrictions.
          </p>
          <div className="flex-responsive justify-center text-dynamic-sm text-gray-500 dark:text-gray-400">
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