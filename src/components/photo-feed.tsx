"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Image as ImageIcon } from "lucide-react"

interface Photo {
  id: string
  image_url: string
  caption: string
  created_at: string
}

export function PhotoFeed() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/image", { cache: "no-store" })
      const { images, error } = await response.json()
      if (!response.ok) throw new Error("Failed to fetch photos\n" + error)

      setPhotos(images || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching photos:", err)
      setError("Failed to load photos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
          <p className="text-gray-500">Be the first to capture a moment!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <Card
          key={photo.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative aspect-square bg-gray-100">
            <img
              src={photo.image_url}
              alt={photo.caption || "Photo"}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            {photo.caption && (
              <p className="text-sm mb-2 line-clamp-3">{photo.caption}</p>
            )}
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(photo.created_at), {
                addSuffix: true,
              })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
