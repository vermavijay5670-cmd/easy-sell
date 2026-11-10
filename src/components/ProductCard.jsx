import { Link } from 'react-router-dom'
import { Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const NO_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#f3f4f6"/><text x="150" y="160" font-size="48" text-anchor="middle">🌿</text></svg>')

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find(item => item.id === product.id)
  const inCart = !!cartItem
  const outOfStock = product.stock === 0

  const badgeColors = {
    'Fresh': 'bg-green-100 text-green-700',
    'Organic': 'bg-emerald-100 text-emerald-700',
    'Premium': 'bg-orange-100 text-orange-700',
    'Bestseller': 'bg-yellow-100 text-yellow-700',
    'Hot 🌶️': 'bg-red-100 text-red-700',
  }

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col group">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PHOTO }}
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[product.badge] || 'bg-gray-100 text-gray-700'}`}>
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-sm font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="hover:text-green-700 transition-colors">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>

        {product.stock > 0 && product.stock < 5 && (
          <p className="text-xs text-orange-600 font-medium mt-1">Only {product.stock} left!</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-green-700 font-bold text-base">₹{product.price}</span>

          {outOfStock ? (
            <button disabled className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full cursor-not-allowed">
              Unavailable
            </button>
          ) : inCart ? (
            <div className="flex items-center gap-1">
              <button
                aria-label={`Decrease quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-700">{cartItem.quantity}</span>
              <button
                aria-label={`Increase quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
