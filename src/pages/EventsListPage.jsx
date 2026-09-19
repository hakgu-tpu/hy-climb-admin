import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const EventsListPage = () => {
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
    if (error) setError(error.message)
    else setEvents(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    setDeletingId(id)
    const { error } = await supabase.from('events').delete().eq('id', id)
    setDeletingId(null)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900">Events</h1>
        <Link to="/events/new" className="bg-zinc-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + New event
        </Link>
      </div>
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {!events ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {events.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  {e.title}
                  {e.active && (
                    <span className="text-[10px] font-bold px-2 py-[2px] rounded-full bg-emerald-100 text-emerald-700">
                      ACTIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400">
                  {e.event_date ?? 'no date'}
                  {e.end_date ? ` – ${e.end_date}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/events/${e.id}`} className="text-xs text-zinc-600 hover:text-zinc-900">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(e.id)}
                  disabled={deletingId === e.id}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="px-4 py-6 text-sm text-zinc-400">No events yet.</p>}
        </div>
      )}
    </div>
  )
}

export default EventsListPage
