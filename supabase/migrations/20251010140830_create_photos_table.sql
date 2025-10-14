/*
  # Create Photos Table for PhotoBooth App

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `image_url` (text) - URL to the stored image
      - `caption` (text) - User-provided caption for the photo
      - `created_at` (timestamptz) - Timestamp when photo was uploaded
  
  2. Security
    - Enable RLS on `photos` table
    - Add policy for anyone to read all photos (public feed)
    - Add policy for anyone to insert photos (no auth required for this app)
  
  3. Storage
    - Create a storage bucket for photo uploads
    - Set bucket to public access for easy retrieval
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  image_name text NOT NULL,
  caption text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos"
  ON photos
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload photos"
  ON photos
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anyone can delete"
  ON "public"."photos"
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ( true );

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;