import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { Plus, Minus, ShoppingCart, ArrowLeft, Ruler, Shield, Layers, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const NO_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <rect width="600" height="400" fill="#1e293b"/>
  <pattern id="p" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="15" cy="15" r="6" fill="#334155"/>
  </pattern>
  <rect width="600" height="400" fill="url(#p)"/>
  <text x="300" y="210" font-size="28" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-weight="bold">PUNCHED PLATE</text>
  <text x="300" y="240" font-size="14" text-anchor="middle" fill="#94a3b8" font-family="sans-serif">No image available</text>
</svg>
`)

const highlights = [
  { icon: <Ruler className="w-4 h-4" />, text: 'CNC precision-punched' },
  { icon: <Shield className="w-4 h-4" />, text: 'IS-certified material' },
  { icon: <Layers className="w-4 h-4" />, text: 'Cut-to-size available' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const product = products.find(p => p.id === Number(id))
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find(item => item.id === product?.id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading…
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl">😕</span>
        <p className="text-xl font-semibold text-slate-700 mt-4">Product not found</p>
        <Link to="/products" className="mt-4 inline-block text-amber-600 hover:underline">← Back to Products</Link>
      </div>
    )
  }

  const handleAdd = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Back bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Catalogue
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 md:flex gap-0">

          {/* Image */}
          <div className="relative md:w-1/2 bg-slate-800 overflow-hidden">
            <img
              src={product.image || NO_PHOTO}
              alt={product.name}
              className="w-full h-72 md:h-full object-cover"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PHOTO }}
            />
            {/* Hole-pattern overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-7 flex flex-col">
            {product.badge && (
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-3 w-fit">
                {product.badge}
              </span>
            )}

            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 leading-snug">{product.name}</h1>
            <p className="text-sm text-slate-400 mb-4 font-medium">{product.unit}</p>

            <p className="text-slate-600 text-sm leading-relaxed mb-5">{product.description}</p>

            {/* Highlights */}
            <div className="flex flex-col gap-1.5 mb-6">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-amber-500">{h.icon}</span>
                  {h.text}
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-amber-600">₹{product.price.toLocaleString()}</span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-semibold">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {product.stock > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5">
                <CheckCircle className="w-3.5 h-3.5" />
                In stock — ready to ship
              </div>
            )}

            {/* Add to Cart */}
            {product.stock === 0 ? (
              <button disabled className="w-full bg-slate-100 text-slate-400 py-3.5 rounded-xl font-semibold cursor-not-allowed">
                Out of Stock
              </button>
            ) : cartItem ? (
              <div className="flex items-center gap-4">
                <button
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold w-8 text-center text-slate-800">{cartItem.quantity}</span>
                <button
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-amber-600 font-semibold ml-1">In Cart</span>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white font-bold py-3.5 px-6 rounded-xl transition-colors w-full text-base shadow-md"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
