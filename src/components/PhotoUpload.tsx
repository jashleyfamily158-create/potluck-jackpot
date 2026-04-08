/**
 * Photo Upload Component
 *
 * Lets users upload a food photo from their camera or photo library.
 * Uploads the image to Supabase Storage, then saves the post to
 * the feed_posts table.
 *
 * Works on both mobile (camera/gallery picker) and desktop (file picker).
 */

'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface PhotoUploadProps {
  potluckId?: string           // Optional — links the photo to a specific potluck
  onUploaded: () => void       // Called after a successful upload so the feed refreshes
  onCancel: () => void
}

export default function PhotoUpload({ potluckId, onUploaded, onCancel }: PhotoUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // When user picks a file, show a preview
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Validate it's an image
    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate size (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setFile(selected)
    setError('')

    // Create a local preview URL
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selected)
  }

  async function handleUpload() {
    if (!file || !user) return
    setUploading(true)
    setError('')

    try {
      // Step 1: Upload the image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Step 2: Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('food-photos')
        .getPublicUrl(filePath)

      // Step 3: Save the post to the feed_posts table
      const { error: postError } = await supabase
        .from('feed_posts')
        .insert({
          user_id: user.id,
          potluck_id: potluckId || null,
          image_url: publicUrl,
          caption: caption.trim() || null,
        })

      if (postError) throw postError

      // Success!
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }

    setUploading(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900">Share a Photo 📸</h3>
        <button onClick={onCancel} className="text-gray-400 text-xl">✕</button>
      </div>

      {/* Photo picker / preview */}
      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
        >
          <span className="text-4xl mb-2">📷</span>
          <span className="text-sm font-medium">Tap to choose a photo</span>
          <span className="text-xs mt-1">Camera or photo library</span>
        </button>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-56 object-cover rounded-xl"
          />
          <button
            onClick={() => { setPreview(null); setFile(null) }}
            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg"
          >
            Change
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Caption */}
      <div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption... (optional)"
          rows={2}
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">{caption.length}/200</p>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40"
        >
          {uploading ? 'Posting...' : 'Post Photo 🎉'}
        </button>
      </div>
    </div>
  )
}
