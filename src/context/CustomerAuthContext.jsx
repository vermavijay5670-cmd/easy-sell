import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CustomerAuthContext = createContext()

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCustomer(session?.user ?? null)
      setCustomerLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setCustomer(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data // data.session is null when email confirmation is required
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, customerLoading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
