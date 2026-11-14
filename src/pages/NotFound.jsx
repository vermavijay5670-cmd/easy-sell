import { Link } from 'react-router-dom'
import { Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <span className="text-6xl">🥕</span>
      <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <div className="flex justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <Home className="w-4 h-4" /> Home
        </Link>
        <Link to="/products" className="inline-flex items-center gap-2 border border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <ShoppingBag className="w-4 h-4" /> Shop
        </Link>
      </div>
    </div>
  )
}
