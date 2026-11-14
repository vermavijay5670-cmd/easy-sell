import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'
import { ShoppingBag, Loader2 } from 'lucide-react'

const INITIAL_FORM = {
  fullName: '', email: '', phone: '', address: '',
  city: '', pincode: '', landmark: '', notes: '',
}

// ✅ Field is defined OUTSIDE Checkout so React never re-mounts it on state change
function Field({ label, name, type, required, placeholder, as, value, onChange, error }) {
  const inputClass = `w-full border rounded-xl px-3 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${error ? 'border-red-400' : 'border-gray-300'}`
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          type={type || 'text'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart()
  const { customer, customerLoading } = useCustomerAuth()
  const { refresh: refreshProducts } = useProducts()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // make sure cart prices/stock are current before the customer pays
  useEffect(() => { refreshProducts() }, [refreshProducts])

  // Prefill phone/address from the customer's previous order (only fields they haven't typed)
  useEffect(() => {
    if (!customer) return
    let active = true
    supabase.from('orders')
      .select('customer_name, phone, address, city, pincode, landmark')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const last = data?.[0]
        if (!last || !active) return
        setForm(prev => ({
          ...prev,
          fullName: prev.fullName || last.customer_name || '',
          phone: prev.phone || last.phone || '',
          address: prev.address || last.address || '',
          city: prev.city || last.city || '',
          pincode: prev.pincode || last.pincode || '',
          landmark: prev.landmark || last.landmark || '',
        }))
      })
    return () => { active = false }
  }, [customer])

  // Prefill name/email for logged-in customers
  useEffect(() => {
    if (!customer) return
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || customer.user_metadata?.full_name || '',
      email: prev.email || customer.email || '',
    }))
  }, [customer])

  if (customerLoading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>
  }

  // Must be logged in to check out
  if (!customer) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-xl font-bold text-gray-700 mt-4 mb-2">Your cart is empty!</h2>
        <Link to="/products" className="text-amber-600 hover:underline text-sm">Browse Products</Link>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Valid email is required'
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      e.phone = 'Valid 10-digit phone number is required'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      e.pincode = 'Valid 6-digit pincode is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the form errors')
      return
    }

    setLoading(true)
    try {
      const orderId = crypto.randomUUID()
      const orderData = {
        id: orderId,
        user_id: customer.id,
        customer_name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        landmark: form.landmark,
        notes: form.notes,
        items: cart,
        total: cartTotal,
        status: 'pending',
        payment_method: 'cod',
      }

      // The database re-prices the order from the products table and checks stock,
      // so use the row it returns (not our local cart) for totals and items.
      const { data: saved, error } = await supabase.from('orders').insert([orderData]).select().single()

      if (error && supabaseConfigured) {
        console.error('Order save failed:', error)
        // P0001 = a friendly message raised by the database (e.g. "Not enough stock for Tomatoes")
        toast.error(error.code === 'P0001' ? error.message : 'Could not place your order. Please try again.')
        if (error.code === 'P0001') refreshProducts()
        return
      }
      const finalItems = saved?.items ?? cart
      const finalTotal = saved ? Number(saved.total) : cartTotal


      clearCart()
      refreshProducts()
      toast.success('Order placed successfully!')
      navigate('/order-confirmation', {
        state: { orderId, customerName: form.fullName, phone: form.phone, total: finalTotal, items: finalItems, loggedIn: true }
      })
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Shared props helper — passes value/onChange/error down from form state
  const fieldProps = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    error: errors[name],
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required placeholder="Ramesh Kumar" {...fieldProps('fullName')} />
              <Field label="Email Address" type="email" required placeholder="ramesh@example.com" {...fieldProps('email')} />
              <Field label="Phone Number" type="tel" required placeholder="9876543210" {...fieldProps('phone')} />
              <Field label="City" required placeholder="Bengaluru" {...fieldProps('city')} />
              <Field label="Pincode" required placeholder="560001" {...fieldProps('pincode')} />
              <Field label="Landmark" placeholder="Near MG Road Metro (Optional)" {...fieldProps('landmark')} />
            </div>
            <div className="mt-4">
              <Field label="Delivery Address" required placeholder="House No., Street, Area" as="textarea" {...fieldProps('address')} />
            </div>
            <div className="mt-4">
              <Field label="Order Notes" placeholder="Any special instructions? (Optional)" as="textarea" {...fieldProps('notes')} />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Payment Method</h2>
            <div className="flex items-center gap-3 border-2 border-amber-500 bg-amber-50 rounded-xl p-4">
              <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your order arrives</p>
              </div>
              <span className="ml-auto text-2xl">💵</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> Place Order · ₹{cartTotal.toFixed(2)}</>
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Order Summary</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-700 shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-amber-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                <span>Total</span>
                <span className="text-amber-700">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
