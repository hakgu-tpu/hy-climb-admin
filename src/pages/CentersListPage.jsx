import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const CentersListPage = () => {
  const [centers, setCenters] = useState(null)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    const { data, error } = await supabase.from('centers').select('*').order('id')
    if (error) setError(error.message)
    else setCenters(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ${id}? This can't be undone.`)) return
    setDeletingId(id)
    const { error } = await supabase.from('centers').delete().eq('id', id)
    setDeletingId(null)
    if (error) {
      setError(error.message)
      return
    }
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900">Centers</h1>
        <Link
          to="/centers/new"
          className="bg-zinc-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          + New center
        </Link>
      </div>
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {!centers ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {centers.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                <p className="text-xs text-zinc-400">
                  {c.id} · {c.region}
                  {c.is_affiliated ? ' · affiliated' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/centers/${c.id}`} className="text-xs text-zinc-600 hover:text-zinc-900">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {centers.length === 0 && <p className="px-4 py-6 text-sm text-zinc-400">No centers yet.</p>}
        </div>
      )}
    </div>
  )
}

export default CentersListPage
