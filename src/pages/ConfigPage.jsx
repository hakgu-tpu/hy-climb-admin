import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const ConfigPage = () => {
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('app_config')
      .select('instagram, departure_name, departure_name_en, departure_naver_place_id')
      .eq('id', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setForm(data)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const { error } = await supabase.from('app_config').update(form).eq('id', true)
    setSaving(false)
    if (error) setError(error.message)
    else setSaved(true)
  }

  if (!form) return <p className="text-sm text-zinc-400">{error ?? 'Loading...'}</p>

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">Site config</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved.</p>}

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Instagram URL</label>
        <input
          value={form.instagram ?? ''}
          onChange={set('instagram')}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Departure point</p>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
          <input
            value={form.departure_name ?? ''}
            onChange={set('departure_name')}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Name (EN)</label>
          <input
            value={form.departure_name_en ?? ''}
            onChange={set('departure_name_en')}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Naver place id</label>
          <input
            value={form.departure_naver_place_id ?? ''}
            onChange={set('departure_naver_place_id')}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-400">
        Event and regular meeting banners moved to their own pages —{' '}
        <Link to="/events" className="underline">
          Events
        </Link>{' '}
        and{' '}
        <Link to="/meetings" className="underline">
          Meetings
        </Link>
        .
      </p>

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

export default ConfigPage
