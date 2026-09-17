import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium ${
    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
  }`

const AdminLayout = () => {
  const { session, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-zinc-900">Hy-Climb Admin</span>
            <nav className="flex gap-1">
              <NavLink to="/centers" className={linkClass}>
                Centers
              </NavLink>
              <NavLink to="/config" className={linkClass}>
                Config
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{session?.user?.email}</span>
            <button onClick={() => signOut()} className="text-xs text-zinc-500 hover:text-zinc-900">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
