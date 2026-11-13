import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const SettingsContext = createContext()

// Default shop categories for punched/perforated metal plates.
// `id` is what products store, so it never changes once created; only name/icon can be edited.
export const DEFAULT_CATEGORIES = [
  { id: 'round-plates', name: 'Round Punched Plates', icon: '⭕' },
  { id: 'square-plates', name: 'Square Punched Plates', icon: '⬜' },
  { id: 'rectangular-plates', name: 'Rectangular Plates', icon: '▬' },
  { id: 'custom-shapes', name: 'Custom Shapes', icon: '🔷' },
  { id: 'fine-mesh', name: 'Fine Mesh / Micro Holes', icon: '🔲' },
  { id: 'heavy-duty', name: 'Heavy Duty / Thick Gauge', icon: '🏗️' },
  { id: 'stainless-steel', name: 'Stainless Steel', icon: '✨' },
  { id: 'mild-steel', name: 'Mild Steel', icon: '🔩' },
  { id: 'aluminium', name: 'Aluminium Plates', icon: '🪙' },
]

export const DEFAULT_SETTINGS = {
  hero_badge: '🏭 Industrial-Grade Punched Plates',
  hero_title: 'Precision Punched Metal Plates\nfor Every Application',
  hero_subtitle: 'High-quality perforated metal plates in stainless steel, mild steel & aluminium. Available in round, square and rectangular hole patterns. Bulk orders welcome.',
  categories: DEFAULT_CATEGORIES,
  shop_name: 'MetalPunch Pro',
  phone: '',
  email: '',
  address: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  testimonials: [], // [{ name, city, text, stars }] - real reviews added by the admin
  tagline: 'Premium perforated metal plates & sheets in various hole sizes, patterns and materials. Industrial supply for filtration, construction, architecture and manufacturing.',
}
const FIELDS = Object.keys(DEFAULT_SETTINGS)
const CACHE_KEY = 'shop-settings'

// Fill anything missing/empty with the built-in default (so a fresh database still looks right)
const withDefaults = (data = {}) => {
  const out = { ...DEFAULT_SETTINGS }
  for (const key of FIELDS) {
    const v = data[key]
    if (key === 'categories') { if (Array.isArray(v) && v.length > 0) out[key] = v }
    else if (key === 'testimonials') { if (Array.isArray(v)) out[key] = v }
    else if (v !== null && v !== undefined && !(v === '' && ['hero_badge', 'hero_title', 'hero_subtitle', 'tagline'].includes(key))) out[key] = v
  }
  return out
}

const readCache = () => {
  try { return withDefaults(JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')) } catch { return DEFAULT_SETTINGS }
}

export function SettingsProvider({ children }) {
  // start from the last known values so the page doesn't flash defaults while loading
  const [settings, setSettings] = useState(readCache)
  // 'loading' until the database answers; 'error' if it could not be read (e.g. migration not run)
  const [status, setStatus] = useState(supabaseConfigured ? 'loading' : 'ready')

  const apply = useCallback((next) => {
    setSettings(next)
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.from('shop_settings').select(FIELDS.join(',')).eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error) { setStatus('error'); return }
        if (data) apply(withDefaults(data))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [apply])

  useEffect(() => { document.title = settings.shop_name }, [settings.shop_name])

  const updateSettings = async (values) => {
    const { data, error } = await supabase
      .from('shop_settings')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
    if (error) throw new Error(error.message + ' (did you run supabase-migration-settings.sql?)')
    if (supabaseConfigured && (!data || data.length === 0)) {
      throw new Error('Not saved. Run supabase-migration-settings.sql and make sure you are an admin.')
    }
    apply(withDefaults({ ...settings, ...values }))
  }

  // categories for filters: "All" first, then the shop's own
  const categories = [{ id: 'all', name: 'All', icon: '🍽️' }, ...settings.categories]

  return (
    <SettingsContext.Provider value={{ settings, shopName: settings.shop_name, categories, status, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
