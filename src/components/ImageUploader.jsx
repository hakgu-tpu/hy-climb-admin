import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const BUCKET = 'center-images'

function resolveSrc(value) {
  return /^https?:\/\//.test(value) ? value : `/images/centers/${value}`
}

const ImageUploader = ({ images, onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFiles = async (files) => {
    setError(null)
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const path = `${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (i) => onChange(images.filter((_, idx) => idx !== i))

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 group bg-zinc-100"
          >
            <img
              src={resolveSrc(src)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
              <button type="button" onClick={() => move(i, -1)} className="text-white text-xs w-5 h-5">
                ‹
              </button>
              <button type="button" onClick={() => removeAt(i)} className="text-white text-xs w-5 h-5">
                ✕
              </button>
              <button type="button" onClick={() => move(i, 1)} className="text-white text-xs w-5 h-5">
                ›
              </button>
            </div>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => e.target.files.length && handleFiles(Array.from(e.target.files))}
        className="text-xs"
      />
      {uploading && <p className="text-xs text-zinc-400 mt-1">Uploading...</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[11px] text-zinc-400 mt-1">
        Legacy bundled images (plain file names) won't preview here — this app doesn't serve
        public/images/centers. They'll still work on the public site.
      </p>
    </div>
  )
}

export default ImageUploader
