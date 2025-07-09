/*
  # Update database for public access

  1. Security Changes
    - Update RLS policies to allow public read access
    - Keep admin functionality for content management
    - Remove authentication requirements for viewing content

  2. Policy Updates
    - Allow anonymous users to read all notes and categories
    - Maintain admin-only write access for content management
*/

-- Update notes policies for public read access
DROP POLICY IF EXISTS "Anyone can read non-archived notes" ON notes;
CREATE POLICY "Public can read all notes"
  ON notes
  FOR SELECT
  TO anon, authenticated
  USING (NOT is_archived);

-- Update categories policies for public read access  
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep admin write policies unchanged
-- Notes management remains admin-only
-- Categories management remains admin-only