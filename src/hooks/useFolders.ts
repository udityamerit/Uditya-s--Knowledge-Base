import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Folder = Database['public']['Tables']['folders']['Row'] & {
  children?: Folder[];
  depth?: number;
  path?: string;
};

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderTree, setFolderTree] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const buildFolderTree = (folders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];

    // Map all folders by id, initially with empty children array
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Construct the tree by linking children to their parents
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parent_folder_id) {
        const parent = folderMap.get(folder.parent_folder_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    // Sort folders at each level by sort_order then name
    const sortFolders = (folders: Folder[]): Folder[] => {
      return folders
        .sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
          }
          return a.name.localeCompare(b.name);
        })
        .map(folder => ({
          ...folder,
          children: folder.children ? sortFolders(folder.children) : [],
        }));
    };

    return sortFolders(rootFolders);
  };

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      const foldersData = data || [];
      setFolders(foldersData);
      setFolderTree(buildFolderTree(foldersData));
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
    sort_order?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();

      if (error) throw error;
      const updatedFolders = [...folders, data];
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
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
      const updatedFolders = folders.map(folder => folder.id === id ? data : folder);
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Deletes a folder.
   * 
   * @param id - The id of the folder to delete.
   * @param options.deleteChildren - If true (default), deletes all descendants; if false, deletes just this folder and reparents its children as root folders.
   */
  const deleteFolder = async (
    id: string,
    options?: { deleteChildren?: boolean }
  ) => {
    try {
      const deleteDescendants = options?.deleteChildren ?? true;
      let allFolderIds = [id];
      let descendants: Folder[] = [];

      if (deleteDescendants) {
        descendants = getDescendantFolders(id);
        allFolderIds = [id, ...descendants.map(d => d.id)];
      }

      // Delete notes in this folder and descendants
      for (const folderId of allFolderIds) {
        const { error: notesError } = await supabase
          .from('notes')
          .delete()
          .eq('folder_id', folderId);
        if (notesError) throw notesError;
      }

      // If deleting all descendants, delete folders bottom-up
      if (deleteDescendants) {
        for (const descendant of descendants.reverse()) {
          const { error: descendantError } = await supabase
            .from('folders')
            .delete()
            .eq('id', descendant.id);
          if (descendantError) throw descendantError;
        }
      } else {
        // If not deleting descendants, reparent children to root
        const childFolders = folders.filter(f => f.parent_folder_id === id);
        for (const child of childFolders) {
          const { error: updateError } = await supabase
            .from('folders')
            .update({ parent_folder_id: null })
            .eq('id', child.id);
          if (updateError) throw updateError;
        }
      }

      // Delete the selected folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedFolders = folders.filter(folder => !allFolderIds.includes(folder.id));
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Convenience wrapper to delete only this folder and reparent children
  const deleteFolderOnly = async (id: string) => {
    return await deleteFolder(id, { deleteChildren: false });
  };

  const getFoldersByCategory = (categoryId: string) => {
    return folders.filter(folder => folder.category_id === categoryId);
  };

  const getFoldersByParent = (parentId: string | null) => {
    return folders.filter(folder => folder.parent_folder_id === parentId);
  };

  const getFolderPath = (folderId: string): string => {
    const buildPath = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return []; // Avoid cycles
      visited.add(id);

      const folder = folders.find(f => f.id === id);
      if (!folder) return [];

      if (folder.parent_folder_id) {
        const parentPath = buildPath(folder.parent_folder_id, visited);
        return [...parentPath, folder.name];
      }

      return [folder.name];
    };

    return buildPath(folderId).join(' > ');
  };

  const getDescendantFolders = (parentId: string): Folder[] => {
    const descendants: Folder[] = [];
    const visited = new Set<string>();

    const collectDescendants = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const children = folders.filter(f => f.parent_folder_id === id);
      children.forEach(child => {
        descendants.push(child);
        collectDescendants(child.id);
      });
    };

    collectDescendants(parentId);
    return descendants;
  };

  return {
    folders,
    folderTree,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    deleteFolderOnly,
    getFoldersByCategory,
    getFoldersByParent,
    getFolderPath,
    getDescendantFolders,
    refetch: fetchFolders,
  };
}
