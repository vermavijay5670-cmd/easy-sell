import { Link } from 'react-router-dom'
import { ShoppingBag, Truck, Leaf, Shield, Star } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useSettings } from '../context/SettingsContext'
import ProductCard from '../components/ProductCard'

const features = [
  { icon: '🚚', label: 'Home Delivery' },
  { icon: '✅', label: 'Quality Products' },
  { icon: '💰', label: 'Best Prices' },
  { icon: '🔒', label: 'Secure Orders' },
]

const whyUs = [
  { icon: <Leaf className="w-7 h-7 text-green-600" />, title: 'Everything in One Place', desc: 'Staples, spices, fresh produce, snacks and household needs. Your whole monthly list from a single shop.' },
  { icon: <Truck className="w-7 h-7 text-orange-500" />, title: 'Home Delivery', desc: 'Order online and get your groceries delivered to your doorstep. No need to step out.' },
  { icon: <Shield className="w-7 h-7 text-green-600" />, title: 'Quality Assured', desc: 'Every item is carefully inspected for quality before being packed and sent to you.' },
]


export default function Home() {
  const { products } = useProducts()
  const { shopName, settings, categories } = useSettings()
  const [heroTop, ...heroRest] = settings.hero_title.split('\n')
  const testimonials = settings.testimonials || []
  const featuredProducts = products.slice(0, 8)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🌿</div>
          <div className="absolute bottom-10 right-10 text-9xl">🥕</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px]">🌱</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-6">
            {settings.hero_badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            {heroTop}
            {heroRest.length > 0 && <><br /><span className="text-green-200">{heroRest.join(' ')}</span></>}
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
            {settings.hero_subtitle}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full text-lg transition-colors shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xl">{f.icon}</span>
                <span className="text-green-100">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
        <p className="text-gray-500 mb-8">Find exactly what you need</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.slice(1).map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-600 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Featured Products</h2>
              <p className="text-gray-500">Popular picks from our store</p>
            </div>
            <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Why Choose {shopName}?</h2>
        <p className="text-gray-500 text-center mb-10">We are committed to your health and satisfaction</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whyUs.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials (real reviews added by the admin; hidden when none) */}
      {testimonials.length > 0 && <section className="bg-green-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">What Our Customers Say</h2>
          <div className="mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    {t.city && <p className="text-xs text-gray-400">{t.city}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}
    </div>
  )
}
