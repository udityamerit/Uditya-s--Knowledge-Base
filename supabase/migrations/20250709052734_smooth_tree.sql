/*
  # Add folder functionality to categories

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `category_id` (uuid, foreign key to categories)
      - `parent_folder_id` (uuid, foreign key to folders - for nested folders)
      - `color` (text)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Schema Changes
    - Add `folder_id` to notes table to link notes to folders
    - Update existing policies for folder access

  3. Security
    - Enable RLS on folders table
    - Add policies for public read access and admin management
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  color text DEFAULT '#6B7280',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add folder_id to notes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE notes ADD COLUMN folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to folders
CREATE POLICY "Public can read folders"
  ON folders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for authenticated users (admin) to manage folders
CREATE POLICY "Authenticated users can manage folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_category_id ON folders(category_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_folder_id ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_sort_order ON folders(sort_order);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);

-- Insert some example folders for existing categories
INSERT INTO folders (name, description, category_id, color, sort_order)
SELECT 
  'Fundamentals',
  'Basic concepts and foundations',
  c.id,
  '#3B82F6',
  1
FROM categories c
WHERE c.name = 'Artificial Intelligence'
ON CONFLICT DO NOTHING;

INSERT INTO folders (name, description, category_id, color, sort_order)
SELECT 
  'Advanced Topics',
  'Complex algorithms and implementations',
  c.id,
  '#8B5CF6',
  2
FROM categories c
WHERE c.name = 'Artificial Intelligence'
ON CONFLICT DO NOTHING;

INSERT INTO folders (name, description, category_id, color, sort_order)
SELECT 
  'Supervised Learning',
  'Classification and regression techniques',
  c.id,
  '#10B981',
  1
FROM categories c
WHERE c.name = 'Machine Learning'
ON CONFLICT DO NOTHING;

INSERT INTO folders (name, description, category_id, color, sort_order)
SELECT 
  'Unsupervised Learning',
  'Clustering and dimensionality reduction',
  c.id,
  '#F59E0B',
  2
FROM categories c
WHERE c.name = 'Machine Learning'
ON CONFLICT DO NOTHING;