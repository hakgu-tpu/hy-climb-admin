import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const MeetingsListPage = () => {
  const [meetings, setMeetings] = useState(null)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, centers ( name )')
      .order('meeting_date', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
    if (error) setError(error.message)
    else setMeetings(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return
    setDeletingId(id)
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    setDeletingId(null)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900">Meetings</h1>
        <Link to="/meetings/new" className="bg-zinc-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + New meeting
        </Link>
      </div>
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {!meetings ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  {m.centers?.name ?? 'Venue TBD'}
                  {m.active && (
                    <span className="text-[10px] font-bold px-2 py-[2px] rounded-full bg-emerald-100 text-emerald-700">
                      ACTIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400">
                  {m.meeting_date ?? 'no date'} {m.meeting_time?.slice(0, 5) ?? ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/meetings/${m.id}`} className="text-xs text-zinc-600 hover:text-zinc-900">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {meetings.length === 0 && <p className="px-4 py-6 text-sm text-zinc-400">No meetings yet.</p>}
        </div>
      )}
    </div>
  )
}

export default MeetingsListPage
