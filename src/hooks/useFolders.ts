import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Folder = Database['public']['Tables']['folders']['Row'];

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (folder: { 
    name: string; 
    description: string; 
    category_id: string; 
    color: string;
    parent_folder_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => prev.map(folder => folder.id === id ? data : folder));
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFolders(prev => prev.filter(folder => folder.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const getFoldersByCategory = (categoryId: string) => {
    return folders.filter(folder => folder.category_id === categoryId);
  };

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    getFoldersByCategory,
    refetch: fetchFolders
  };
}