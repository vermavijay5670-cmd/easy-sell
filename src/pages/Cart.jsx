import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function Cart() {
  const { cart, setIsCartOpen } = useCart()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <ShoppingBag className="w-16 h-16 text-green-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h1>
      <p className="text-gray-500 mb-6">
        {cart.length > 0
          ? `You have ${cart.length} item(s) in your cart.`
          : 'Your cart is empty.'}
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
        >
          Open Cart
        </button>
        <Link
          to="/products"
          className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2.5 rounded-full font-medium transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
