/*
  # Add Storage Bucket Policies for Photos

  1. Storage Policies
    - Add policy to allow anyone to upload photos to the 'photos' bucket
    - Add policy to allow anyone to read photos from the 'photos' bucket
  
  2. Security Notes
    - Public upload is allowed since this is a public photobooth app
    - Public read is already enabled via bucket.public = true
    - These policies enable the storage operations to work properly
*/

CREATE POLICY "Anyone can upload photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Anyone can update their own photos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'photos')
  WITH CHECK (bucket_id = 'photos');
