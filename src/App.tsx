import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { IntroPage } from './pages/IntroPage';
import { HomePage } from './pages/HomePage';
import { NotePage } from './pages/NotePage';
import { CategoryPage } from './pages/CategoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Routes>
          {/* Intro page */}
          <Route path="/" element={<IntroPage />} />
          
          {/* Admin login page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Public routes with full access */}
          <Route path="/notes" element={<Layout showSearch />}>
            <Route index element={<HomePage />} />
            <Route path=":id" element={<NotePage />} />
          </Route>
          
          {/* Category pages */}
          <Route path="/category/:id" element={<Layout />}>
            <Route index element={<CategoryPage />} />
          </Route>
          
          {/* Protected admin routes - authentication required */}
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="note/new" element={<NoteEditorPage />} />
            <Route path="note/:id/edit" element={<NoteEditorPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;