import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink, Leaf, Loader2, Plus, Trash2, Star, ChevronUp, ChevronDown } from 'lucide-react'

// trim every text field so "changed?" ignores stray spaces
const normalize = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) =>
  [k, k === 'testimonials'
    ? (x || []).map(t => ({ name: (t.name || '').trim(), city: (t.city || '').trim(), text: (t.text || '').trim(), stars: Number(t.stars) || 5 }))
    : k === 'categories'
    ? (x || []).map(c => ({ id: c.id || '', name: (c.name || '').trim(), icon: (c.icon || '').trim() }))
    : (x ?? '').trim()]))

// "Rice & Atta" -> "rice-and-atta"; unique among the ids already taken
const makeId = (name, taken) => {
  const base = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category'
  let id = base, n = 2
  while (taken.has(id) || id === 'all') id = `${base}-${n++}`
  return id
}

const input = 'w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400'
const label = 'block text-sm font-medium text-gray-700 mb-1'

// Wait for the real saved values before showing the form; otherwise the form would start
// from defaults and "Save" could overwrite the shop's real settings.
export default function AdminSettings() {
  const { status } = useSettings()
  if (status === 'ready') return <SettingsForm />
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {status === 'loading'
        ? <p className="text-gray-400">Loading settings...</p>
        : <>
            <p className="text-gray-700 font-medium mb-1">Couldn't load the current settings.</p>
            <p className="text-sm text-gray-500 mb-4">Make sure you've run <code>supabase-migration-settings.sql</code>, then refresh this page.</p>
            <Link to="/admin/dashboard" className="text-amber-600 hover:underline text-sm">← Back to dashboard</Link>
          </>}
    </div>
  )
}

function SettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  // how many products use each category (a category with products can't be removed)
  const [usage, setUsage] = useState({})
  useEffect(() => {
    supabase.from('products').select('category').then(({ data }) => {
      const counts = {}
      ;(data || []).forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
      setUsage(counts)
    })
  }, [])

  const setCategory = (i, key, value) =>
    setForm(prev => ({ ...prev, categories: prev.categories.map((c, idx) => idx === i ? { ...c, [key]: value } : c) }))
  const addCategory = () =>
    setForm(prev => ({ ...prev, categories: [...prev.categories, { id: '', name: '', icon: '🛒' }] }))
  const removeCategory = (i) =>
    setForm(prev => ({ ...prev, categories: prev.categories.filter((_, idx) => idx !== i) }))
  const moveCategory = (i, dir) =>
    setForm(prev => {
      const list = [...prev.categories]
      const j = i + dir
      if (j < 0 || j >= list.length) return prev
      ;[list[i], list[j]] = [list[j], list[i]]
      return { ...prev, categories: list }
    })

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const dirty = JSON.stringify(normalize(form)) !== JSON.stringify(normalize(settings))

  const setReview = (i, key, value) =>
    setForm(prev => ({ ...prev, testimonials: prev.testimonials.map((t, idx) => idx === i ? { ...t, [key]: value } : t) }))
  const addReview = () =>
    setForm(prev => ({ ...prev, testimonials: [...prev.testimonials, { name: '', city: '', text: '', stars: 5 }] }))
  const removeReview = (i) =>
    setForm(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clean = normalize(form)
    if (clean.shop_name.length < 2 || clean.shop_name.length > 40) return toast.error('Shop name must be 2–40 characters')
    if (clean.phone && !/^[+\d][\d\s()-]{6,19}$/.test(clean.phone)) return toast.error('Enter a valid phone number')
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return toast.error('Enter a valid email address')
    if (clean.whatsapp && clean.whatsapp.replace(/\D/g, '').length < 10) return toast.error('Enter the WhatsApp number with country code, e.g. 919876543210')
    if (clean.categories.length === 0) return toast.error('Keep at least one category')
    if (clean.categories.some(c => !c.name)) return toast.error('Every category needs a name (or remove the empty one)')
    const names = clean.categories.map(c => c.name.toLowerCase())
    if (new Set(names).size !== names.length) return toast.error('Two categories have the same name')
    // give new categories a permanent id
    const taken = new Set(clean.categories.map(c => c.id).filter(Boolean))
    clean.categories = clean.categories.map(c => {
      if (c.id) return c
      const id = makeId(c.name, taken)
      taken.add(id)
      return { ...c, id, icon: c.icon || '🛒' }
    })
    if (clean.testimonials.some(t => !t.name || !t.text)) return toast.error('Each review needs a name and text (or remove the empty one)')
    setSaving(true)
    try {
      await updateSettings(clean)
      setForm(clean)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
        <Link to="/" className="ml-auto flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Website
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Shop</h2>
          <div>
            <label htmlFor="set-1" className={label}>Shop Name</label>
            <input id="set-1" name="shop_name" value={form.shop_name} onChange={set} maxLength={40} placeholder="e.g. Sharma Fresh Mart" className={input} />
            <p className="text-xs text-gray-400 mt-1">Shown in the header, footer, login pages, browser tab and admin panel.</p>
          </div>
          <div>
            <label htmlFor="set-2" className={label}>Footer Description</label>
            <textarea id="set-2" name="tagline" value={form.tagline} onChange={set} rows={3} maxLength={200} className={input} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
            <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-2 text-white font-bold text-xl">
              <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 text-sm">⚙</span>
              <span className="tracking-tight truncate">{form.shop_name.trim() || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Home Page Banner</h2>
          <div>
            <label htmlFor="set-3" className={label}>Small badge text</label>
            <input id="set-3" name="hero_badge" value={form.hero_badge} onChange={set} maxLength={40} className={input} />
          </div>
          <div>
            <label htmlFor="set-4" className={label}>Headline</label>
            <textarea id="set-4" name="hero_title" value={form.hero_title} onChange={set} rows={2} maxLength={80} className={input} />
            <p className="text-xs text-gray-400 mt-1">Press Enter for a second line, which is shown in a lighter colour.</p>
          </div>
          <div>
            <label htmlFor="set-5" className={label}>Description</label>
            <textarea id="set-5" name="hero_subtitle" value={form.hero_subtitle} onChange={set} rows={3} maxLength={200} className={input} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-gray-800">Product Categories <span className="block sm:inline text-xs font-normal text-gray-400">(shown on the home page and as filters in the shop)</span></h2>
            {form.categories.length < 20 && (
              <button type="button" onClick={addCategory} className="shrink-0 flex items-center gap-1 text-sm font-medium text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>
          {form.categories.map((c, i) => {
            const count = c.id ? usage[c.id] || 0 : 0
            return (
              <div key={c.id || `new-${i}`} className="flex items-center gap-2">
                <input value={c.icon} onChange={e => setCategory(i, 'icon', e.target.value)} maxLength={4} aria-label="Icon (emoji)" className={`${input} !w-14 text-center text-lg`} />
                <input value={c.name} onChange={e => setCategory(i, 'name', e.target.value)} maxLength={30} placeholder="Category name" aria-label="Category name" className={input} />
                <span className="hidden sm:block text-xs text-gray-400 w-20 shrink-0">{count > 0 ? `${count} product${count === 1 ? '' : 's'}` : ''}</span>
                <button type="button" onClick={() => moveCategory(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveCategory(i, 1)} disabled={i === form.categories.length - 1} aria-label="Move down" className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => removeCategory(i)} disabled={count > 0}
                  title={count > 0 ? 'Move or delete this category\'s products first' : 'Remove'} aria-label="Remove category"
                  className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
          <p className="text-xs text-gray-400">A category that still has products can't be removed. Edit those products first (Manage Products, pencil button), then remove it here.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Contact Details <span className="text-xs font-normal text-gray-400">(shown in the website footer; leave blank to hide)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-6" className={label}>Phone</label>
              <input id="set-6" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+91 98765 43210" className={input} />
            </div>
            <div>
              <label htmlFor="set-7" className={label}>Email</label>
              <input id="set-7" name="email" type="email" value={form.email} onChange={set} placeholder="hello@yourshop.in" className={input} />
            </div>
          </div>
          <div>
            <label htmlFor="set-8" className={label}>Address</label>
            <textarea id="set-8" name="address" value={form.address} onChange={set} rows={3} placeholder={'Shop no., Street,\nCity, State PIN'} className={input} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Social Links <span className="text-xs font-normal text-gray-400">(an icon appears in the footer only for the ones you fill in)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-9" className={label}>Instagram</label>
              <input id="set-9" name="instagram" value={form.instagram} onChange={set} placeholder="@yourshop or full link" className={input} />
            </div>
            <div>
              <label htmlFor="set-10" className={label}>Facebook</label>
              <input id="set-10" name="facebook" value={form.facebook} onChange={set} placeholder="page name or full link" className={input} />
            </div>
          </div>
          <div>
            <label htmlFor="set-11" className={label}>WhatsApp number</label>
            <input id="set-11" name="whatsapp" type="tel" value={form.whatsapp} onChange={set} placeholder="919876543210 (with country code)" className={input} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-gray-800">Customer Reviews <span className="block sm:inline text-xs font-normal text-gray-400">(only add real reviews. The home page section is hidden while this list is empty)</span></h2>
            {form.testimonials.length < 6 && (
              <button type="button" onClick={addReview} className="shrink-0 flex items-center gap-1 text-sm font-medium text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>
          {form.testimonials.length === 0 && <p className="text-sm text-gray-400">No reviews yet.</p>}
          {form.testimonials.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={t.name} onChange={e => setReview(i, 'name', e.target.value)} placeholder="Customer name" maxLength={40} className={input} />
                <input value={t.city} onChange={e => setReview(i, 'city', e.target.value)} placeholder="City (optional)" maxLength={40} className={input} />
              </div>
              <textarea value={t.text} onChange={e => setReview(i, 'text', e.target.value)} rows={2} maxLength={300} placeholder="What the customer said" className={input} />
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button type="button" key={n} onClick={() => setReview(i, 'stars', n)} aria-label={`${n} stars`}>
                      <Star className={`w-5 h-5 ${n <= t.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => removeReview(i)} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving || !dirty}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
