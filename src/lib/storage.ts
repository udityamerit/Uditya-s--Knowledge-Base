import { supabase } from './supabase';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  path: string;
}

export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(file: File, folder: string = 'general'): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return {
        id: data.id || fileName,
        name: file.name,
        url: publicUrl,
        type: this.getFileType(file.type),
        size: file.size,
        path: filePath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<UploadedFile[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType === 'text/plain' || mimeType === 'application/rtf') return 'document';
    return 'file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'document': return '📝';
      default: return '📎';
    }
  }
}

export const storageService = StorageService.getInstance();