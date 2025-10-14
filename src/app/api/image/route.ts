import { supabase } from "@/lib/supabase"
import { SupabaseImage } from "@/types/image"

type SupabaseResponse = { data: SupabaseImage[] | null; error: any }

export async function GET() {
  const { data, error }: SupabaseResponse = await supabase
    .from("photos")
    .select("*")
  console.log("data", data, error)
  if (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch images from supabase",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    )
  }
  return new Response(
    JSON.stringify({
      images: data ?? [],
      error: null,
      details: "successfully retrieved images from supabase",
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  )
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get("image")
    const caption = formData.get("caption")?.toString() ?? ""

    if (!image || !(image instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Missing image file (field name: "image")' }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      )
    }

    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer) // raw image bytes

    // metadata you can use
    const filename = (image as File).name || "upload"
    const mime = (image as any).type || "application/octet-stream"
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}-${filename}`

    const { error } = await supabase.storage
      .from("photos")
      .upload(uniqueName, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: mime,
      })
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(uniqueName)

    const { error: insertError } = await supabase.from("photos").insert({
      image_url: urlData.publicUrl,
      caption: caption.trim(),
    })

    if (error || insertError) {
      return new Response(
        JSON.stringify({
          error: "Upload failed",
          details: error?.message || insertError?.message,
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      )
    }
    // Placeholder: return metadata and size. Replace with storage/processing logic.
    return new Response(
      JSON.stringify({
        message: "ok",
        filename,
        mime,
        size: buffer.length,
        caption,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to parse request",
        details: String(err),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    )
  }
}
