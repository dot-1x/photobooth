"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
// import { PhotoUpload } from "@/components/photo-upload"
import { PhotoFeed } from "@/components/photo-feed"

export default function Home() {
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setShowCamera(false)
  }

  const handleUploadComplete = () => {
    setCapturedImage(null)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Next PhotoBooth
            </h1>
            <p className="text-gray-600 mt-2">Capture and share your moments</p>
          </div>
          <Button
            onClick={() => setShowCamera(true)}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Camera className="h-5 w-5" />
            Take Photo
          </Button>
        </div>

        <PhotoFeed key={refreshKey} />
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* {capturedImage && (
        <PhotoUpload
          imageData={capturedImage}
          onClose={() => setCapturedImage(null)}
          onUploadComplete={handleUploadComplete}
        />
      )} */}
    </div>
  )
}
