import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = initializing
  const [role, setRole] = useState(undefined)       // undefined = loading, null = no profile

  async function resolveProfile(session) {
    if (!session) {
      setRole(null)
      return
    }
    const intendedRole = sessionStorage.getItem('sw_intended_role') || 'teacher'
    try {
      const data = await api.me()
      setRole(data.role)
      sessionStorage.removeItem('sw_intended_role')
    } catch {
      // First login — register with intended role
      try {
        await api.register(intendedRole)
        const data = await api.me()
        setRole(data.role)
        sessionStorage.removeItem('sw_intended_role')
      } catch (e) {
        console.error('profile setup failed', e)
        setRole(null)
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
      resolveProfile(session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      resolveProfile(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      session,
      role,
      signOut: () => supabase.auth.signOut(),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
