'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface Photo {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

interface PhotoLightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!photo) return;
    setIsDownloading(true);
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Buat nama file yang bersih dari caption atau gunakan nama default
      const fileName = photo.caption ? `${photo.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : `photobooth_${photo.id}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Opsional: tampilkan pesan error kepada pengguna
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isDownloading} className="rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors" aria-label="Download photo">
              {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors" aria-label="Close lightbox">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <motion.div
            layoutId={photo.id}
            className="relative w-full h-full max-w-screen-lg max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat mengklik gambar
          >
            <img src={photo.image_url} alt={photo.caption || 'Photo'} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
