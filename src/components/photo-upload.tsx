'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PhotoUploadProps {
  imageData: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function PhotoUpload({ imageData, onClose, onUploadComplete }: PhotoUploadProps) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const blob = await (await fetch(imageData)).blob();
      const fileName = `photo_${Date.now()}.jpg`;
      const form = new FormData();
      form.append('image', blob, fileName);
      form.append('caption', caption);

      const response = await fetch('/api/image', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to upload photo.');
      }

      onUploadComplete();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div className="w-full max-w-5xl " initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
        <Card className="w-full h-full max-h-[80vh] overflow-y-auto shadow-2xl rounded-2xl border ">
          <div className="grid md:grid-cols-10 h-full">
            {/* Image Preview Column */}
            <div className="md:col-span-6  flex items-center justify-center p-2 md:ml-6">
              <img src={imageData} alt="Upload preview" className="w-auto h-auto max-h-full object-contain rounded-lg" />
            </div>

            {/* Form Column */}
            <div className="md:col-span-4 p-6 flex flex-col h-full bg-card">

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex-grow flex flex-col space-y-4">
                <label htmlFor="caption" className="block text-sm font-medium text-muted-foreground">
                  Caption (optional)
                </label>
                <Textarea id="caption" placeholder="Describe your moment..." value={caption} onChange={(e) => setCaption(e.target.value)} disabled={uploading} className="flex-grow text-base resize-none min-h-[150px] bg-muted/50" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-6 border-t">
                <Button variant="outline" onClick={onClose} disabled={uploading} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading} className="gap-2 w-full sm:w-36">
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
