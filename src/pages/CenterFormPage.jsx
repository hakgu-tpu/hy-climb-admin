import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import ImageUploader from '@/components/ImageUploader'
import PriceListEditor from '@/components/PriceListEditor'
import SnsLinksEditor from '@/components/SnsLinksEditor'

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
  parking_type: '',
  parking_description: '',
}

const emptyTranslation = { name: '', address: '', description: '', parking_description: '' }

const CENTER_SELECT = `
  *,
  center_prices ( is_affiliate, name, name_en, price, sort_order ),
  center_sns_links ( type, url, sort_order ),
  center_translations ( locale, name, address, description, parking_description )
`

const CenterFormPage = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyCenter)
  const [prices, setPrices] = useState([])
  const [affiliatePrices, setAffiliatePrices] = useState([])
  const [snsLinks, setSnsLinks] = useState([])
  const [translation, setTranslation] = useState(emptyTranslation)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false
    supabase
      .from('centers')
      .select(CENTER_SELECT)
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setError(error?.message ?? 'Center not found')
          setLoading(false)
          return
        }
        const { center_prices, center_sns_links, center_translations, ...center } = data
        setForm({ ...emptyCenter, ...center })
        setPrices(
          (center_prices ?? [])
            .filter((p) => !p.is_affiliate)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => ({ name: p.name, name_en: p.name_en ?? '', price: p.price }))
        )
        setAffiliatePrices(
          (center_prices ?? [])
            .filter((p) => p.is_affiliate)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => ({ name: p.name, name_en: p.name_en ?? '', price: p.price }))
        )
        setSnsLinks(
          (center_sns_links ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((s) => ({ type: s.type, url: s.url }))
        )
        const en = (center_translations ?? []).find((t) => t.locale === 'en')
        setTranslation(
          en
            ? {
                name: en.name ?? '',
                address: en.address ?? '',
                description: en.description ?? '',
                parking_description: en.parking_description ?? '',
              }
            : emptyTranslation
        )
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))
  const setTranslationField = (key) => (e) => setTranslation((t) => ({ ...t, [key]: e.target.value }))

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
    for (const p of [...prices, ...affiliatePrices]) {
      if (!p.name.trim() || p.price === '' || Number.isNaN(Number(p.price))) {
        setError('Every price row needs a name and a numeric price.')
        return
      }
    }
    for (const s of snsLinks) {
      if (!s.url.trim()) {
        setError('Every SNS row needs a URL.')
        return
      }
    }

    setSaving(true)

    const centerPayload = {
      id: form.id,
      name: form.name,
      address: form.address,
      region: form.region,
      description: form.description,
      images: form.images,
      is_affiliated: form.is_affiliated,
      naver_place_id: form.naver_place_id,
      phone: form.phone || null,
      parking_type: form.parking_type || null,
      parking_description: form.parking_description || null,
    }

    const centerQuery =
      mode === 'create'
        ? supabase.from('centers').insert(centerPayload)
        : supabase.from('centers').update(centerPayload).eq('id', id)

    const { error: centerError } = await centerQuery
    if (centerError) {
      setSaving(false)
      setError(centerError.message)
      return
    }

    const centerId = form.id

    const { error: deletePricesError } = await supabase.from('center_prices').delete().eq('center_id', centerId)
    const { error: deleteSnsError } = await supabase.from('center_sns_links').delete().eq('center_id', centerId)
    const relatedDeleteError = deletePricesError ?? deleteSnsError
    if (relatedDeleteError) {
      setSaving(false)
      setError(relatedDeleteError.message)
      return
    }

    const priceRows = [
      ...prices.map((p, i) => ({
        center_id: centerId,
        is_affiliate: false,
        name: p.name,
        name_en: p.name_en || null,
        price: Number(p.price),
        sort_order: i,
      })),
      ...affiliatePrices.map((p, i) => ({
        center_id: centerId,
        is_affiliate: true,
        name: p.name,
        name_en: p.name_en || null,
        price: Number(p.price),
        sort_order: i,
      })),
    ]
    if (priceRows.length) {
      const { error } = await supabase.from('center_prices').insert(priceRows)
      if (error) {
        setSaving(false)
        setError(error.message)
        return
      }
    }

    const snsRows = snsLinks.map((s, i) => ({
      center_id: centerId,
      type: s.type,
      url: s.url,
      sort_order: i,
    }))
    if (snsRows.length) {
      const { error } = await supabase.from('center_sns_links').insert(snsRows)
      if (error) {
        setSaving(false)
        setError(error.message)
        return
      }
    }

    const hasTranslation =
      translation.name.trim() ||
      translation.address.trim() ||
      translation.description.trim() ||
      translation.parking_description.trim()

    if (hasTranslation) {
      const { error } = await supabase.from('center_translations').upsert(
        {
          center_id: centerId,
          locale: 'en',
          name: translation.name || null,
          address: translation.address || null,
          description: translation.description || null,
          parking_description: translation.parking_description || null,
        },
        { onConflict: 'center_id,locale' }
      )
      if (error) {
        setSaving(false)
        setError(error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('center_translations')
        .delete()
        .eq('center_id', centerId)
        .eq('locale', 'en')
      if (error) {
        setSaving(false)
        setError(error.message)
        return
      }
    }

    setSaving(false)
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

      <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Parking</p>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Type</label>
          <select value={form.parking_type} onChange={set('parking_type')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
            <option value="">(none)</option>
            <option value="self">self</option>
            <option value="nearby">nearby</option>
            <option value="none">none</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
          <input
            value={form.parking_description ?? ''}
            onChange={set('parking_description')}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl p-4">
        <PriceListEditor label="Regular prices" items={prices} onChange={setPrices} />
      </div>

      <div className="border border-zinc-200 rounded-xl p-4">
        <PriceListEditor label="Affiliate (club member) prices" items={affiliatePrices} onChange={setAffiliatePrices} />
      </div>

      <div className="border border-zinc-200 rounded-xl p-4">
        <SnsLinksEditor items={snsLinks} onChange={setSnsLinks} />
      </div>

      <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-zinc-900">English translation</p>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
          <input value={translation.name} onChange={setTranslationField('name')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Address</label>
          <input value={translation.address} onChange={setTranslationField('address')} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
          <textarea
            value={translation.description}
            onChange={setTranslationField('description')}
            rows={3}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Parking description</label>
          <input
            value={translation.parking_description}
            onChange={setTranslationField('parking_description')}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
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
