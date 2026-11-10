import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { resizeImage } from '../../lib/image'
import { products as localProducts } from '../../data/products'
import { useSettings } from '../../context/SettingsContext'
import { useProducts } from '../../context/ProductsContext'
import toast from 'react-hot-toast'
import {
  Save, ArrowLeft, ToggleLeft, ToggleRight, ExternalLink,
  Plus, Trash2, Pencil, Camera, Upload, X, Loader2, ImageIcon,
} from 'lucide-react'

const BUCKET = 'product-images'
const EMPTY = { name: '', category: '', price: '', unit: '', stock: '', badge: '', description: '', image: '' }

// Defined outside AdminProducts so inputs never lose focus while typing
function ProductModal({ product, onClose, onSaved, nextId, categories }) {
  const isEdit = !!product
  const [form, setForm] = useState(product ? { ...EMPTY, ...product, badge: product.badge || '', description: product.description || '' } : { ...EMPTY, category: categories[0]?.id || '' })
  const [file, setFile] = useState(null)       // newly picked image (Blob/File)
  const [preview, setPreview] = useState(product?.image || '')
  const [saving, setSaving] = useState(false)
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const pick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) return toast.error('Please choose an image file')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const uploadImage = async () => {
    const blob = await resizeImage(file)
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
    if (error) throw new Error('Photo upload failed: ' + error.message + ' (did you run supabase-migration-products.sql?)')
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Product name is required')
    if (!(Number(form.price) > 0)) return toast.error('Enter a valid price')
    if (!form.unit.trim()) return toast.error('Enter a unit, e.g. 1 kg')
    if (!isEdit && !file) return toast.error('Add a photo (take one or upload)')

    setSaving(true)
    try {
      const image = file ? await uploadImage() : form.image
      const row = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        unit: form.unit.trim(),
        stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
        badge: form.badge.trim() || null,
        description: form.description.trim(),
        image,
      }
      const q = isEdit
        ? supabase.from('products').update(row).eq('id', product.id)
        : supabase.from('products').insert([{ ...row, id: nextId, active: true }])
      const { error } = await q
      if (error) throw error
      toast.success(isEdit ? 'Product updated!' : 'Product added!')
      onSaved()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400'
  const label = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div role="presentation" className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <form role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit product' : 'Add product'} onSubmit={handleSubmit}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {/* Photo */}
        <div>
          <label className={label}>Photo {!isEdit && <span className="text-red-500">*</span>}</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {preview
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <ImageIcon className="w-8 h-8 text-gray-300" />}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => cameraRef.current?.click()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
                <Camera className="w-4 h-4" /> Take Photo
              </button>
              <button type="button" onClick={() => galleryRef.current?.click()}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl">
                <Upload className="w-4 h-4" /> Upload from Device
              </button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={pick} className="hidden" />
            <input ref={galleryRef} type="file" accept="image/*" onChange={pick} className="hidden" />
          </div>
        </div>

        <div><label htmlFor="prod-1" className={label}>Name <span className="text-red-500">*</span></label>
          <input id="prod-1" name="name" value={form.name} onChange={set} placeholder="e.g. Green Peas" className={input} /></div>

        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="prod-2" className={label}>Category</label>
            <select id="prod-2" name="category" value={form.category} onChange={set} className={input}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              {form.category && !categories.some(c => c.id === form.category) && <option value={form.category}>{form.category} (removed category)</option>}
            </select></div>
          <div><label htmlFor="prod-3" className={label}>Unit <span className="text-red-500">*</span></label>
            <input id="prod-3" name="unit" value={form.unit} onChange={set} placeholder="1 kg / 250g / 1 pc" className={input} /></div>
          <div><label htmlFor="prod-4" className={label}>Price (₹) <span className="text-red-500">*</span></label>
            <input id="prod-4" name="price" type="number" min="0" step="0.5" value={form.price} onChange={set} className={input} /></div>
          <div><label htmlFor="prod-5" className={label}>Stock</label>
            <input id="prod-5" name="stock" type="number" min="0" value={form.stock} onChange={set} className={input} /></div>
        </div>

        <div><label htmlFor="prod-6" className={label}>Badge (optional)</label>
          <input id="prod-6" name="badge" value={form.badge} onChange={set} placeholder="Fresh, Organic, Premium..." className={input} /></div>
        <div><label htmlFor="prod-7" className={label}>Description</label>
          <textarea id="prod-7" name="description" rows={3} value={form.description} onChange={set} className={input} /></div>

        <button type="submit" disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </form>
    </div>
  )
}

export default function AdminProducts() {
  const { refresh: refreshShop } = useProducts()
  const { settings } = useSettings()
  const [productList, setProductList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [modal, setModal] = useState(null) // null | 'new' | product
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('id')
    if (error) toast.error('Could not load products: ' + error.message)
    setProductList(data || [])
    setLoading(false)
  }

  const afterChange = async () => {
    setModal(null)
    await fetchProducts()
    refreshShop() // update the customer-facing shop too
  }

  const visibleProducts = productList.filter(p =>
    (catFilter === 'all' || p.category === catFilter) &&
    (!query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase())))

  const nextId = Math.max(0, ...productList.map(p => Number(p.id))) + 1

  const handleStockChange = (id, value) =>
    setProductList(prev => prev.map(p => p.id === id ? { ...p, stock: Number(value) } : p))

  const handleToggleActive = (id) =>
    setProductList(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))

  const handleSave = async (product) => {
    setSaving(prev => ({ ...prev, [product.id]: true }))
    try {
      const { error } = await supabase.from('products')
        .update({ stock: product.stock, active: product.active }).eq('id', product.id)
      if (error) throw error
      toast.success(`${product.name} updated!`)
      refreshShop()
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}" permanently? Past orders keep their details.`)) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error
      // best-effort cleanup of the uploaded photo
      const marker = `/${BUCKET}/`
      if (product.image?.includes(marker)) {
        await supabase.storage.from(BUCKET).remove([decodeURIComponent(product.image.split(marker)[1].split('?')[0])])
      }
      toast.success(`${product.name} removed`)
      await fetchProducts()
      refreshShop()
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  const importDefaults = async () => {
    const rows = localProducts.map(p => ({ ...p, active: true }))
    const { error } = await supabase.from('products').insert(rows)
    if (error) return toast.error('Import failed: ' + error.message)
    toast.success('Default products imported')
    afterChange()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setModal('new')}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <Link to="/"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Website
          </Link>
        </div>
      </div>

      {!supabaseConfigured && (
        <p className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-3 mb-4">
          Supabase isn't configured, so changes can't be saved.
        </p>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading products...</div>
      ) : productList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-gray-600 font-medium mb-1">No products in the database yet</p>
          <p className="text-gray-400 text-sm mb-5">Until you add some, the shop shows its built-in list.</p>
          <div className="flex justify-center gap-3">
            <button onClick={importDefaults} className="border border-green-600 text-green-700 hover:bg-green-50 text-sm font-semibold px-4 py-2 rounded-xl">
              Import {localProducts.length} sample products
            </button>
            <button onClick={() => setModal('new')} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              Add my first product
            </button>
          </div>
        </div>
      ) : (
        <>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products by name" aria-label="Search products"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Filter by category"
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="all">All categories</option>
            {settings.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleProducts.map(product => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
                      <span className="font-medium text-gray-800">{product.name}</span>
                      {product.image?.includes('unsplash.com') && (
                        <span title="Placeholder stock photo. Click the pencil to replace it with your own." className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">stock photo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{settings.categories.find(c => c.id === product.category)?.name || product.category}</td>
                  <td className="px-4 py-3 text-green-700 font-semibold">₹{product.price}</td>
                  <td className="px-4 py-3">
                    {product.stock === 0
                      ? <span className="block text-[10px] font-semibold text-red-600 mb-0.5">Out of stock</span>
                      : product.stock <= 5 && <span className="block text-[10px] font-semibold text-orange-600 mb-0.5">Low stock</span>}
                    <input type="number" min="0" value={product.stock} aria-label={`Stock for ${product.name}`}
                      onChange={e => handleStockChange(product.id, e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(product.id)} aria-pressed={!!product.active}
                      aria-label={`${product.name}: ${product.active ? 'shown in shop, click to hide' : 'hidden, click to show'}`} className="transition-colors">
                      {product.active
                        ? <ToggleRight className="w-6 h-6 text-green-600" />
                        : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSave(product)} disabled={saving[product.id]}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                        <Save className="w-3.5 h-3.5" /> {saving[product.id] ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setModal(product)} title="Edit"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product)} title="Remove"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleProducts.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No products match your search.</p>}
        </div>
        </>
      )}

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          nextId={nextId}
          categories={settings.categories}
          onClose={() => setModal(null)}
          onSaved={afterChange}
        />
      )}
    </div>
  )
}
