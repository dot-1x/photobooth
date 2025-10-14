'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { ImageIcon, MoreHorizontal, Trash2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoLightbox } from './photo-lightbox';

interface Photo {
  id: string;
  image_url: string;
  image_name: string;
  caption: string;
  created_at: string;
}

const SkeletonCard = () => (
    <div className="aspect-square bg-muted animate-pulse  rounded-xl"></div>
    
);

export function PhotoFeed() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // Lacak unduhan berdasarkan ID foto

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/image?t=${new Date().getTime()}`, { cache: 'no-store' });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to load photos');
        }
        const { images } = await response.json();
        setPhotos(images || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const deletePhoto = async (id: string, image_name: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch('/api/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, image_name }),
      });
      if (!response.ok) throw new Error('Failed to delete photo');
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting photo:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (photo: Photo) => {
    if (isDownloading) return;
    setIsDownloading(photo.id);
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileName = photo.caption ? `${photo.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : `photobooth_${photo.id}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 bg-card rounded-2xl border-2 border-dashed">
        <div className="p-6 bg-muted rounded-full mb-6">
          <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Photos Yet</h3>
        <p className="text-muted-foreground max-w-sm">Be the first to capture and share your precious moments!</p>
      </div>
    );
  }

  return (
    <>
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div key={photo.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} exit={{ opacity: 0, scale: 0.8 }} layoutId={photo.id}>
              <AlertDialog>
                <div className="overflow-hidden group rounded-xl bg-card border-2 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    <img src={photo.image_url} alt={photo.caption || 'Photo'} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 w-full text-white">
                      {photo.caption && <p className="font-semibold text-lg mb-1 line-clamp-2 leading-tight">{photo.caption}</p>}
                      <p className="text-xs text-white/80">{formatDistanceToNow(new Date(photo.created_at), { addSuffix: true, locale: id })}</p>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm border hover:bg-background/80">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(photo)} disabled={!!isDownloading} className="cursor-pointer">
                          {isDownloading === photo.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the photo from the server.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deletePhoto(photo.id, photo.image_name)} disabled={isDeleting === photo.id}>
                      {isDeleting === photo.id ? 'Deleting...' : 'Yes, delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <PhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </>
  );
}
