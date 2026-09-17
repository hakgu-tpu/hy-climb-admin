import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import JsonField from '@/components/JsonField'

const ConfigPage = () => {
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('app_config')
      .select('*')
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
    const { error } = await supabase
      .from('app_config')
      .update({
        departure: form.departure,
        instagram: form.instagram,
        event: form.event,
        meeting: form.meeting,
      })
      .eq('id', true)
    setSaving(false)
    if (error) setError(error.message)
    else setSaved(true)
  }

  if (!form) return <p className="text-sm text-zinc-400">{error ?? 'Loading...'}</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">Site config</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved.</p>}

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Instagram URL</label>
        <input
          value={form.instagram ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <JsonField
        label="departure"
        value={form.departure}
        onChange={(v) => setForm((f) => ({ ...f, departure: v }))}
        placeholder='{"name":"...","nameEn":"...","naverPlaceId":"..."}'
      />
      <JsonField
        label="event"
        value={form.event}
        onChange={(v) => setForm((f) => ({ ...f, event: v }))}
        placeholder='{"active":false,"title":"...","date":"2026-05-16"}'
      />
      <JsonField
        label="meeting"
        value={form.meeting}
        onChange={(v) => setForm((f) => ({ ...f, meeting: v }))}
        placeholder='{"active":false,"centerId":"","date":"2026-05-29","time":"17:00"}'
      />

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
