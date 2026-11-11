import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const SettingsContext = createContext()

// Default shop categories (disposable plates & tableware). The admin can change these in Shop Settings.
// `id` is what products store, so it never changes once created; only name/icon can be edited.
export const DEFAULT_CATEGORIES = [
  { id: 'areca-plates', name: 'Areca Leaf Plates', icon: '🍃' },
  { id: 'paper-plates', name: 'Paper Plates', icon: '🍽️' },
  { id: 'plant-based', name: 'Sugarcane & Plant-based', icon: '🌱' },
  { id: 'bowls', name: 'Bowls & Katoris', icon: '🥣' },
  { id: 'cups', name: 'Cups & Glasses', icon: '🥤' },
  { id: 'cutlery', name: 'Spoons & Cutlery', icon: '🥄' },
  { id: 'packaging', name: 'Napkins & Food Boxes', icon: '📦' },
]

export const DEFAULT_SETTINGS = {
  hero_badge: '🌱 Eco-friendly tableware',
  hero_title: 'Disposable Plates Made from\nPaper & Plants',
  hero_subtitle: 'Areca leaf, sugarcane and paper plates, bowls and cups for weddings, parties, restaurants and everyday use. Strong, food-safe and kind to the planet.',
  categories: DEFAULT_CATEGORIES,
  shop_name: 'EcoPlate',
  phone: '',
  email: '',
  address: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  testimonials: [], // [{ name, city, text, stars }] - real reviews added by the admin
  tagline: 'Eco-friendly disposable plates, bowls and cups made from areca leaf, sugarcane and paper. Retail and bulk orders delivered to your door.',
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
