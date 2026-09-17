import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('loading')
  const [session, setSession] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function evaluate(nextSession) {
      if (cancelled) return
      setSession(nextSession)
      if (!nextSession) {
        setStatus('signed-out')
        return
      }
      setStatus('loading')
      const { data, error } = await supabase.rpc('is_operator')
      if (cancelled) return
      setStatus(!error && data === true ? 'authorized' : 'unauthorized')
    }

    supabase.auth.getSession().then(({ data }) => evaluate(data.session ?? null))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      evaluate(nextSession)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ status, session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
