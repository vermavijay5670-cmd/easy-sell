import { useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

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
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div role="dialog" aria-modal="true" aria-label="Shopping cart" className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold text-lg">Your Cart</span>
            {cart.length > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <button onClick={() => setIsCartOpen(false)} aria-label="Close cart" className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-6xl">🛒</span>
              <div>
                <p className="font-semibold text-gray-700 text-lg">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some groceries to get started!</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                  <p className="text-green-700 font-bold text-sm mt-0.5">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="w-6 h-6 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors"
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
          <div className="border-t p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-green-700 font-bold text-xl">₹{cartTotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout →
            </Link>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
