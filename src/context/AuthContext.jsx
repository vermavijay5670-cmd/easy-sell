import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

// A logged-in user only counts as admin if they are listed in the `admins` table.
// (Customers use the same Supabase auth, so being "authenticated" is not enough.)
async function checkIsAdmin(user) {
  if (!user) return false
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  return !!data
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const apply = async (session) => {
      const user = session?.user ?? null
      const ok = await checkIsAdmin(user)
      if (active) setAdmin(ok ? user : null)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await apply(session)
      if (active) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // defer: calling supabase inside this callback can deadlock
      setTimeout(() => apply(session), 0)
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const adminLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!(await checkIsAdmin(data.user))) {
      await supabase.auth.signOut()
      throw new Error('This account does not have admin access.')
    }
    setAdmin(data.user)
    return data
  }

  const adminLogout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, adminLogin, adminLogout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
