"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PhotoUploadProps {
  imageData: string
  onClose: () => void
  onUploadComplete: () => void
}

export function PhotoUpload({
  imageData,
  onClose,
  onUploadComplete,
}: PhotoUploadProps) {
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    setUploading(true)
    setError(null)

    try {
      const blob = await (await fetch(imageData)).blob()
      const fileName = `photo_${Date.now()}.jpg`
      const form = new FormData()
      form.append("image", blob, fileName)
      form.append("caption", caption)

      await fetch("/api/image", {
        method: "POST",
        body: form,
      })

      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from("photos")
      //   .upload(fileName, blob, {
      //     contentType: "image/jpeg",
      //     cacheControl: "3600",
      //   })

      // if (uploadError) throw uploadError

      // const { data: urlData } = supabase.storage
      //   .from("photos")
      //   .getPublicUrl(fileName)

      // const { error: insertError } = await supabase.from("photos").insert({
      //   image_url: urlData.publicUrl,
      //   caption: caption.trim(),
      // })

      // if (insertError) throw insertError

      onUploadComplete()
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Add Caption & Upload</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={imageData}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>

            <div>
              <label
                htmlFor="caption"
                className="block text-sm font-medium mb-2"
              >
                Caption
              </label>
              <Textarea
                id="caption"
                placeholder="Add a caption to your photo..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
                className="min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
