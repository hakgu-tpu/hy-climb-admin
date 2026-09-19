import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import MeetingFields from '@/components/MeetingFields'

function dbToForm(row) {
  return {
    active: row.active,
    centerId: row.center_id ?? '',
    date: row.meeting_date ?? '',
    time: row.meeting_time ? row.meeting_time.slice(0, 5) : '',
  }
}

function formToDb(form) {
  return {
    active: form.active,
    center_id: form.centerId || null,
    meeting_date: form.date || null,
    meeting_time: form.time || null,
  }
}

const emptyForm = { active: false, centerId: '', date: '', time: '' }

const MeetingFormPage = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('centers')
      .select('id, name')
      .order('id')
      .then(({ data }) => setCenters(data ?? []))
  }, [])

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false
    supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) setError(error?.message ?? 'Meeting not found')
        else setForm(dbToForm(data))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    if (form.active) {
      let deactivateQuery = supabase.from('meetings').update({ active: false }).eq('active', true)
      if (mode === 'edit') deactivateQuery = deactivateQuery.neq('id', id)
      const { error: deactivateError } = await deactivateQuery
      if (deactivateError) {
        setSaving(false)
        setError(deactivateError.message)
        return
      }
    }

    const payload = formToDb(form)
    const query =
      mode === 'create'
        ? supabase.from('meetings').insert(payload)
        : supabase.from('meetings').update(payload).eq('id', id)

    const { error } = await query
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/meetings')
  }

  if (loading) return <p className="text-sm text-zinc-400">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">{mode === 'create' ? 'New meeting' : `Edit meeting #${id}`}</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <MeetingFields value={form} centers={centers} onChange={setForm} />
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

export default MeetingFormPage
