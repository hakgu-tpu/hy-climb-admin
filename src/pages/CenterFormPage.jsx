import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import ImageUploader from '@/components/ImageUploader'
import JsonField from '@/components/JsonField'

const emptyCenter = {
  id: '',
  name: '',
  address: '',
  region: '',
  description: '',
  images: [],
  is_affiliated: false,
  naver_place_id: '',
  phone: '',
  prices: null,
  affiliate_prices: null,
  sns_links: null,
  parking: null,
  i18n: null,
}

const CenterFormPage = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyCenter)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false
    supabase
      .from('centers')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setError(error?.message ?? 'Center not found')
        } else {
          setForm({ ...emptyCenter, ...data })
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (
      !form.id.trim() ||
      !form.name.trim() ||
      !form.address.trim() ||
      !form.region.trim() ||
      !form.naver_place_id.trim()
    ) {
      setError('id, name, address, region, and naver_place_id are required.')
      return
    }
    if (form.images.length === 0) {
      setError('At least one image is required.')
      return
    }

    setSaving(true)
    const payload = { ...form }
    delete payload.created_at
    delete payload.updated_at

    const query =
      mode === 'create'
        ? supabase.from('centers').insert(payload)
        : supabase.from('centers').update(payload).eq('id', id)

    const { error } = await query
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/centers')
  }

  if (loading) return <p className="text-sm text-zinc-400">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">
        {mode === 'create' ? 'New center' : `Edit ${id}`}
      </h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">ID (url-safe, e.g. center_12)</label>
        <input
          value={form.id}
          onChange={set('id')}
          disabled={mode === 'edit'}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm disabled:bg-zinc-100"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
        <input value={form.name} onChange={set('name')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Address</label>
        <input value={form.address} onChange={set('address')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Region</label>
        <input value={form.region} onChange={set('region')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" checked={form.is_affiliated} onChange={setChecked('is_affiliated')} />
        Affiliated
      </label>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Naver place id</label>
        <input
          value={form.naver_place_id}
          onChange={set('naver_place_id')}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Phone (optional)</label>
        <input value={form.phone ?? ''} onChange={set('phone')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Images</label>
        <ImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
      </div>

      <div className="pt-2 border-t border-zinc-200">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Advanced (JSON)</p>
        <div className="space-y-3">
          <JsonField
            label="prices"
            value={form.prices}
            onChange={(v) => setForm((f) => ({ ...f, prices: v }))}
            placeholder='[{"name":"일일 이용","nameEn":"Day Pass","price":20000}]'
          />
          <JsonField
            label="affiliate_prices"
            value={form.affiliate_prices}
            onChange={(v) => setForm((f) => ({ ...f, affiliate_prices: v }))}
          />
          <JsonField
            label="sns_links"
            value={form.sns_links}
            onChange={(v) => setForm((f) => ({ ...f, sns_links: v }))}
            placeholder='[{"type":"instagram","url":"https://..."}]'
          />
          <JsonField
            label="parking"
            value={form.parking}
            onChange={(v) => setForm((f) => ({ ...f, parking: v }))}
            placeholder='{"type":"self","description":"..."}'
          />
          <JsonField
            label="i18n"
            value={form.i18n}
            onChange={(v) => setForm((f) => ({ ...f, i18n: v }))}
            placeholder='{"name":"...","address":"...","description":"..."}'
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}

export default CenterFormPage
