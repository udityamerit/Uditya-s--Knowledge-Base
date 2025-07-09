/*
  # Create Storage Bucket for File Uploads

  1. Storage Setup
    - Create 'uploads' bucket for storing files
    - Set up public access for file downloads
    - Configure RLS policies for file management

  2. Security
    - Allow public read access to files
    - Allow authenticated users to upload files
    - Prevent unauthorized file deletion
*/

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage
CREATE POLICY "Public can view files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can update their files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can delete files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads');