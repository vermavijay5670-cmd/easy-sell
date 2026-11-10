import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const SettingsContext = createContext()

// Default shop categories (general grocery). The admin can change these in Shop Settings.
// `id` is what products store, so it never changes once created; only name/icon can be edited.
export const DEFAULT_CATEGORIES = [
  { id: 'rice-atta', name: 'Rice & Atta', icon: '🌾' },
  { id: 'dal', name: 'Dal & Pulses', icon: '🫘' },
  { id: 'oil', name: 'Oil & Ghee', icon: '🫒' },
  { id: 'whole-spices', name: 'Whole Spices', icon: '🌶️' },
  { id: 'ground-spices', name: 'Ground Spices', icon: '🫙' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
  { id: 'leafy', name: 'Leafy Greens', icon: '🥬' },
  { id: 'herbs', name: 'Herbs', icon: '🌿' },
  { id: 'fruits', name: 'Fruits', icon: '🍅' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'snacks', name: 'Snacks & Biscuits', icon: '🍪' },
  { id: 'beverages', name: 'Tea, Coffee & Drinks', icon: '☕' },
  { id: 'household', name: 'Household & Cleaning', icon: '🧼' },
]

export const DEFAULT_SETTINGS = {
  hero_badge: '🛒 Daily needs, delivered',
  hero_title: 'Your Neighbourhood Grocery,\nDelivered to Your Door',
  hero_subtitle: 'Rice, dal, oil, spices, fresh vegetables and everyday essentials. Order online and we will bring it to your home.',
  categories: DEFAULT_CATEGORIES,
  shop_name: 'GreenBasket',
  phone: '',
  email: '',
  address: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  testimonials: [], // [{ name, city, text, stars }] - real reviews added by the admin
  tagline: 'Your neighbourhood grocery store: everyday essentials, fresh produce and quality staples delivered to your doorstep.',
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
  const categories = [{ id: 'all', name: 'All', icon: '🛒' }, ...settings.categories]

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
