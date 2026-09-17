import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const RequireAuth = ({ children }) => {
  const { status, signOut } = useAuth()

  if (status === 'loading') {
    return <p className="p-6 text-sm text-zinc-400">Loading...</p>
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (status === 'unauthorized') {
    return (
      <div className="p-6 max-w-md space-y-3">
        <p className="text-sm text-red-500">
          This account isn't set up as an operator. Ask an admin to add a `profiles` row (or set
          `role = 'admin'`) for this account in Supabase Studio.
        </p>
        <button onClick={() => signOut()} className="text-sm text-zinc-500 underline">
          Sign out
        </button>
      </div>
    )
  }

  return children
}

export default RequireAuth
