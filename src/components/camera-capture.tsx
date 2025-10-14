'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, RotateCcw, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Syarat (constraints) yang lebih fleksibel
      const constraints: MediaStreamConstraints = {
        video: {
          // Tidak lagi menggunakan 'exact' agar browser lebih leluasa
          facingMode: facingMode,
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      console.error('KESALAHAN DETAIL KAMERA:', err); // Log error lengkap untuk debug

      if (err.name === 'OverconstrainedError') {
        setError(`Kamera tidak mendukung pengaturan yang diminta (misal: kamera belakang tidak ada). Coba ganti kamera.`);
      } else if (err.name === 'NotAllowedError') {
        setError('Anda belum memberikan izin akses kamera. Mohon izinkan di pengaturan browser Anda.');
      } else if (err.name === 'NotFoundError') {
        setError('Tidak ada kamera yang ditemukan di perangkat ini. Pastikan kamera terhubung.');
      } else if (err.name === 'NotReadableError') {
        setError('Kamera sedang digunakan oleh aplikasi lain atau terjadi masalah pada hardware.');
      } else {
        setError('Gagal mengakses kamera karena alasan teknis. Coba muat ulang halaman.');
      }
    }
  }, [facingMode, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Balik gambar jika menggunakan kamera depan
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleCaptureClick = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      capturePhoto();
    }, 3000);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div className="w-full max-w-3xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
        <Card className="bg-card border shadow-2xl rounded-2xl">
          <CardContent className="p-2 sm:p-4">
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video mb-6 shadow-lg">
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-3 right-3 z-30 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20 transition-all">
                <X className="h-5 w-5" />
              </Button>

              <AnimatePresence>
                {!capturedImage ? (
                  <motion.video key="video" ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                ) : (
                  <motion.img key="image" src={capturedImage} alt="Captured" className="w-full h-full object-cover" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} />
                )}
              </AnimatePresence>

              {countdown !== null && (
                <motion.div
                  key={countdown}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-9xl font-bold text-foreground" style={{ textShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
                    {countdown}
                  </p>
                </motion.div>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Kesalahan Kamera</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center justify-center min-h-[90px]">
              <AnimatePresence mode="wait">
                {!capturedImage ? (
                  <motion.div key="capture" className="flex w-full justify-around items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <div className="w-20"></div> {/* Spacer */}
                    <button
                      onClick={handleCaptureClick}
                      disabled={!!error || countdown !== null}
                      className="w-20 h-20 rounded-full bg-foreground ring-8 ring-foreground/20 ring-offset-4 ring-offset-background flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Capture Photo"
                    >
                      <motion.div className="w-16 h-16 rounded-full bg-background border-4 border-foreground/10" whileTap={{ scale: 0.9 }}></motion.div>
                    </button>
                    <Button onClick={toggleFacingMode} variant="outline" size="icon" className="rounded-full w-14 h-14 bg-transparent" disabled={!!error}>
                      <RefreshCw className="h-6 w-6" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="confirm" className="flex w-full justify-around items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.1 } }} exit={{ opacity: 0, y: 20 }}>
                    <motion.div>
                      <Button onClick={retakePhoto} variant="outline" size="lg" className="gap-2 rounded-full px-8 py-7 text-base font-medium bg-transparent">
                        <RotateCcw className="h-5 w-5" />
                        Ulangi
                      </Button>
                    </motion.div>
                    <motion.div>
                      <Button onClick={handleUsePhoto} variant="default" size="lg" className="rounded-full px-8 py-7 text-base font-medium">
                        <Check className="h-6 w-6" />
                        Gunakan Foto
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
