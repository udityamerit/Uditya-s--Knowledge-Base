/*
  # Create Tech Notes Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `color` (text)
      - `created_at` (timestamp)
    - `notes`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `category_id` (uuid, foreign key)
      - `tags` (text array)
      - `is_archived` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage content
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to categories and notes
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read non-archived notes"
  ON notes
  FOR SELECT
  TO anon, authenticated
  USING (NOT is_archived);

-- Create policies for authenticated users (admin) to manage content
CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('Artificial Intelligence', 'AI concepts, algorithms, and implementations', '#8B5CF6'),
  ('Machine Learning', 'ML models, training, and data science', '#10B981'),
  ('Web Development', 'Frontend, backend, and full-stack development', '#F59E0B'),
  ('Data Science', 'Data analysis, visualization, and statistics', '#EF4444'),
  ('Computer Science', 'Algorithms, data structures, and theory', '#3B82F6'),
  ('DevOps', 'Deployment, CI/CD, and infrastructure', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notes table
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();