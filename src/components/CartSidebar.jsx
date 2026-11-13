import { useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2, Layers } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

const NO_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
  <rect width="56" height="56" fill="#1e293b"/>
  <pattern id="p" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
    <circle cx="4" cy="4" r="1.5" fill="#334155"/>
  </pattern>
  <rect width="56" height="56" fill="url(#p)"/>
</svg>
`)

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart()

  // Escape closes the cart
  useEffect(() => {
    if (!isCartOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setIsCartOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isCartOpen, setIsCartOpen])

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div role="dialog" aria-modal="true" aria-label="Shopping cart" className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg">Your Cart</span>
            {cart.length > 0 && (
              <span className="bg-amber-500 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <button onClick={() => setIsCartOpen(false)} aria-label="Close cart" className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-700 text-lg">Cart is empty</p>
                <p className="text-sm text-slate-400 mt-1">Browse our catalogue to add plates</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={item.image || NO_PHOTO}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PHOTO }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 line-clamp-2 leading-tight">{item.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Layers className="w-3 h-3 text-slate-300" />
                    <p className="text-xs text-slate-400 truncate">{item.unit}</p>
                  </div>
                  <p className="text-amber-600 font-bold text-sm mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Subtotal</span>
              <span className="text-amber-600 font-bold text-xl">₹{cartTotal.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white text-center font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout →
            </Link>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
