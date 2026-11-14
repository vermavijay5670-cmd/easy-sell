import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import OrderTimeline, { STATUS_INFO } from '../components/OrderTimeline'
import { Search, Loader2 } from 'lucide-react'

export default function TrackOrder() {
  const [params] = useSearchParams()
  const [orderId, setOrderId] = useState(params.get('id') || '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    const id = orderId.replace(/^#/, '').trim()
    if (id.length < 8) return setError('Enter the Order ID (at least the first 8 characters).')
    if (!/^\d{10}$/.test(phone.trim())) return setError('Enter the 10-digit phone number used for the order.')

    setLoading(true)
    const { data, error: err } = await supabase.rpc('track_order', { p_order: id, p_phone: phone })
    setLoading(false)
    if (err) return setError(/too many attempts/i.test(err.message || '') ? err.message : 'Could not look up the order right now. Please try again.')
    if (!data || data.length === 0) return setError('No order found. Check the Order ID and phone number.')
    setOrder(data[0])
  }

  const info = order ? STATUS_INFO[order.status] || STATUS_INFO.pending : null
  const items = order && Array.isArray(order.items) ? order.items : []

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Track Your Order</h1>
      <p className="text-sm text-gray-500 mb-6">
        No account needed. Or <Link to="/login" className="text-amber-600 hover:underline">log in</Link> to see all your orders.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label htmlFor="track-1" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
          <input id="track-1" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. 3F9A1C2B"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label htmlFor="track-2" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input id="track-2" value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="9876543210"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Track Order</>}
        </button>
      </form>

      {order && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              #{String(order.id).slice(0, 8).toUpperCase()}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${info.bg} ${info.color}`}>
              {info.icon} {info.label}
            </span>
          </div>
          <OrderTimeline status={order.status} history={order.history || []} />
          <div className="mt-4 pt-4 border-t space-y-1">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{it.name} <span className="text-gray-400">x{it.quantity}</span></span>
                <span>₹{(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-800 pt-2 border-t mt-2">
              <span>Total</span><span className="text-amber-700">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
