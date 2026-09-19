import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import JsonField from '@/components/JsonField'
import EventFields from '@/components/EventFields'
import MeetingFields from '@/components/MeetingFields'

const ConfigPage = () => {
  const [form, setForm] = useState(null)
  const [centers, setCenters] = useState([])
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
    supabase
      .from('centers')
      .select('id, name')
      .order('id')
      .then(({ data }) => setCenters(data ?? []))
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

      <EventFields value={form.event} onChange={(event) => setForm((f) => ({ ...f, event }))} />

      <MeetingFields
        value={form.meeting}
        centers={centers}
        onChange={(meeting) => setForm((f) => ({ ...f, meeting }))}
      />

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
