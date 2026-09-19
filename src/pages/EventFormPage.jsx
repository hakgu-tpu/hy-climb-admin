import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import EventFields from '@/components/EventFields'

function dbToForm(row) {
  return {
    active: row.active,
    title: row.title ?? '',
    titleEn: row.title_en ?? '',
    description: row.description ?? '',
    descriptionEn: row.description_en ?? '',
    date: row.event_date ?? '',
    endDate: row.end_date ?? '',
    linkUrl: row.link_url ?? '',
    linkLabel: row.link_label ?? '',
    linkLabelEn: row.link_label_en ?? '',
  }
}

function formToDb(form) {
  return {
    active: form.active,
    title: form.title,
    title_en: form.titleEn || null,
    description: form.description || null,
    description_en: form.descriptionEn || null,
    event_date: form.date || null,
    end_date: form.endDate || null,
    link_url: form.linkUrl || null,
    link_label: form.linkLabel || null,
    link_label_en: form.linkLabelEn || null,
  }
}

const emptyForm = {
  active: false,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  date: '',
  endDate: '',
  linkUrl: '',
  linkLabel: '',
  linkLabelEn: '',
}

const EventFormPage = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) setError(error?.message ?? 'Event not found')
        else setForm(dbToForm(data))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setError(null)
    setSaving(true)

    if (form.active) {
      let deactivateQuery = supabase.from('events').update({ active: false }).eq('active', true)
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
      mode === 'create' ? supabase.from('events').insert(payload) : supabase.from('events').update(payload).eq('id', id)

    const { error } = await query
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/events')
  }

  if (loading) return <p className="text-sm text-zinc-400">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">{mode === 'create' ? 'New event' : `Edit event #${id}`}</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <EventFields value={form} onChange={setForm} />
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

export default EventFormPage
