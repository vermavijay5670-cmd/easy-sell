import { Link } from 'react-router-dom'
import { Plus, Minus, Layers } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

// SVG thumbnail showing punched-hole pattern
const NO_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <rect width="300" height="300" fill="#1e293b"/>
  <pattern id="p" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
    <circle cx="12" cy="12" r="5" fill="#334155"/>
  </pattern>
  <rect width="300" height="300" fill="url(#p)"/>
  <text x="150" y="168" font-size="22" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-weight="bold">PUNCHED</text>
  <text x="150" y="192" font-size="14" text-anchor="middle" fill="#94a3b8" font-family="sans-serif">PLATE</text>
</svg>
`)

const badgeColors = {
  'Bestseller':   'bg-amber-100 text-amber-800 border-amber-200',
  'Premium':      'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Heavy':        'bg-slate-200 text-slate-700 border-slate-300',
  'Heavy Duty':   'bg-slate-200 text-slate-700 border-slate-300',
  'Marine Grade': 'bg-blue-100 text-blue-700 border-blue-200',
  'Precision':    'bg-purple-100 text-purple-700 border-purple-200',
  'Lightweight':  'bg-green-100 text-green-700 border-green-200',
  'Galvanised':   'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Black Coated': 'bg-gray-200 text-gray-800 border-gray-300',
  'Polished':     'bg-gray-100 text-gray-600 border-gray-200',
  'Food Safe':    'bg-green-100 text-green-700 border-green-200',
  'Anodised':     'bg-teal-100 text-teal-700 border-teal-200',
}

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find(item => item.id === product.id)
  const inCart = !!cartItem
  const outOfStock = product.stock === 0

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col group border border-slate-100 hover:border-amber-300">
      {/* Image / Pattern preview */}
      <Link to={`/products/${product.id}`} className="relative overflow-hidden bg-slate-800">
        <img
          src={product.image || NO_PHOTO}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PHOTO }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {product.badge && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColors[product.badge] || 'bg-amber-100 text-amber-700 border-amber-200'}`}>
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-slate-700 text-sm font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="hover:text-amber-600 transition-colors">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-400 truncate">{product.unit}</p>
        </div>

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-xs text-red-600 font-medium mt-1">Only {product.stock} left!</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-amber-600 font-bold text-base">₹{product.price.toLocaleString()}</span>

          {outOfStock ? (
            <button disabled className="text-xs bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
              Unavailable
            </button>
          ) : inCart ? (
            <div className="flex items-center gap-1">
              <button
                aria-label={`Decrease quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-700">{cartItem.quantity}</span>
              <button
                aria-label={`Increase quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
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
