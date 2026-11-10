import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { products as localProducts } from '../data/products'

const ProductsContext = createContext()

const normalize = (p) => ({
  ...p,
  price: Number(p.price),
  stock: Number(p.stock ?? 0),
  description: p.description || '',
  badge: p.badge || null,
})

// Storefront products come from Supabase (what the admin manages).
// Falls back to the built-in list when Supabase isn't configured, errors, or the table is still empty.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(localProducts)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [live, setLive] = useState(false) // true once the list came from the database (not the built-in fallback)

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) { setLoading(false); return }
    try {
      const { data, error } = await supabase.from('products').select('*').order('id')
      if (!error && data && data.length > 0) {
        setProducts(data.filter(p => p.active !== false).map(normalize))
        setLive(true)
      }
    } catch (err) {
      console.warn('Using local product data:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // pick up the admin's stock/price changes when a customer returns to the tab
  useEffect(() => {
    let last = Date.now()
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > 60_000) { last = Date.now(); refresh() }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return (
    <ProductsContext.Provider value={{ products, loading, live, refresh }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
