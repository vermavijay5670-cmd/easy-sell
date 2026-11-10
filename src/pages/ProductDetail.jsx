import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const NO_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#f3f4f6"/><text x="150" y="160" font-size="48" text-anchor="middle">🌿</text></svg>')

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const product = products.find(p => p.id === Number(id))
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find(item => item.id === product?.id)

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl">😕</span>
        <p className="text-xl font-semibold text-gray-700 mt-4">Product not found</p>
        <Link to="/products" className="mt-4 inline-block text-green-600 hover:underline">← Back to Products</Link>
      </div>
    )
  }

  const handleAdd = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-72 md:h-auto object-cover"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PHOTO }}
        />
        <div className="p-6 flex flex-col justify-center">
          {product.badge && (
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-3 w-fit">
              {product.badge}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{product.name}</h1>
          <p className="text-sm text-gray-400 mb-3">{product.unit}</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-green-700">₹{product.price}</span>
            {product.stock > 0 && product.stock < 5 && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Only {product.stock} left!</span>
            )}
          </div>

          {product.stock === 0 ? (
            <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed">
              Out of Stock
            </button>
          ) : cartItem ? (
            <div className="flex items-center gap-3">
              <button
                aria-label={`Decrease quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold w-8 text-center">{cartItem.quantity}</span>
              <button
                aria-label={`Increase quantity of ${product.name}`}
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-green-700 font-medium ml-2">In Cart</span>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors w-full"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
