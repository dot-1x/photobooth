'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { CameraCapture } from '@/components/camera-capture';
import { PhotoUpload } from '@/components/photo-upload';
import { PhotoFeed } from '@/components/photo-feed';

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // State untuk memicu refresh pada PhotoFeed setelah upload berhasil
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false); // Sembunyikan kamera setelah foto diambil
  };

  const handleUploadComplete = () => {
    setCapturedImage(null); // Tutup komponen upload
    setRefreshKey((prevKey) => prevKey + 1); // Ubah key untuk memuat ulang PhotoFeed
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="sticky top-0 z-40 w-full border-b border-borde bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">PotopotBot</h1>
                <p className="text-sm text-muted-foreground  sm:block">Photobooth ala-ala supaya kalean paham FE BE.</p>
              </div>
              <Button onClick={() => setShowCamera(true)} size="lg" className="hidden sm:inline-flex items-center gap-2 rounded-full font-semibold transition-transform duration-300 hover:scale-105">
                <Camera className="h-5 w-5" />
                Take Photo
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Menggunakan key untuk memicu re-render dan fetch ulang data */}
          <PhotoFeed key={refreshKey} />
        </main>

        {/* Floating Action Button untuk Mobile */}
        <Button
          onClick={() => setShowCamera(true)}
          size="lg"
          className="sm:hidden fixed bottom-6 right-6 z-40 rounded-full w-16 h-16 shadow-2xl shadow-primary/30 flex items-center justify-center transition-transform duration-300 active:scale-90"
          aria-label="Take Photo"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Komponen Modal untuk Kamera dan Upload */}
      {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}

      {capturedImage && <PhotoUpload imageData={capturedImage} onClose={() => setCapturedImage(null)} onUploadComplete={handleUploadComplete} />}
    </>
  );
}
