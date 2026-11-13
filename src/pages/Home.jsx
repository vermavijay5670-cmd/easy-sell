import { Link } from 'react-router-dom'
import { ShoppingBag, Truck, Shield, Star, Ruler, Zap, Settings, CheckCircle, Phone, ChevronRight } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useSettings } from '../context/SettingsContext'
import ProductCard from '../components/ProductCard'

// SVG punched-plate pattern for hero background
function PunchedPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="holes" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#holes)" />
    </svg>
  )
}

const specs = [
  { icon: '📐', label: 'Custom Sizes', desc: 'Cut to your exact dimensions' },
  { icon: '⚙️', label: 'Hole Patterns', desc: 'Round, square, slot, hexagonal' },
  { icon: '🔩', label: 'All Materials', desc: 'SS, MS, Aluminium, GI' },
  { icon: '📦', label: 'Bulk Orders', desc: 'Factory direct pricing' },
  { icon: '🚚', label: 'Pan-India Delivery', desc: 'Dispatched within 2–5 days' },
]

const whyUs = [
  {
    icon: <Ruler className="w-7 h-7 text-amber-500" />,
    title: 'Precision CNC Punching',
    desc: 'Every plate is punched on modern CNC punch-press machines guaranteeing ±0.1 mm hole accuracy and clean, burr-free edges.',
  },
  {
    icon: <Shield className="w-7 h-7 text-amber-500" />,
    title: 'Certified Materials',
    desc: 'We source IS-certified mild steel, 304/316 stainless steel and 5052 aluminium — with material test reports (MTR) on request.',
  },
  {
    icon: <Zap className="w-7 h-7 text-amber-500" />,
    title: 'Fast Turnaround',
    desc: 'Standard sheets ship within 2 days. Custom-cut or coated orders within 5 business days. We deliver pan-India by courier or transport.',
  },
]

const industries = [
  { icon: '🏭', label: 'Manufacturing' },
  { icon: '🏗️', label: 'Construction' },
  { icon: '🏢', label: 'Architecture' },
  { icon: '🔬', label: 'Filtration' },
  { icon: '🌾', label: 'Agriculture' },
  { icon: '🚢', label: 'Marine' },
  { icon: '🎵', label: 'Acoustics' },
  { icon: '🏠', label: 'Interior Design' },
]

const finishes = [
  { name: 'Mill Finish', color: 'bg-slate-200 text-slate-700' },
  { name: 'Galvanised', color: 'bg-blue-100 text-blue-700' },
  { name: 'Powder Coated', color: 'bg-amber-100 text-amber-700' },
  { name: 'Polished', color: 'bg-gray-100 text-gray-700' },
  { name: 'Anodised', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Hot-Dip Galv', color: 'bg-green-100 text-green-700' },
]

export default function Home() {
  const { products } = useProducts()
  const { shopName, settings, categories } = useSettings()
  const [heroTop, ...heroRest] = settings.hero_title.split('\n')
  const testimonials = settings.testimonials || []
  const featuredProducts = products.slice(0, 8)

  return (
    <div className="bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative bg-slate-900 text-white overflow-hidden min-h-[520px] flex items-center">
        <PunchedPattern />
        {/* Amber gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Settings className="w-4 h-4" />
              {settings.hero_badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {heroTop}
              {heroRest.length > 0 && (
                <>
                  <br />
                  <span className="text-amber-400">{heroRest.join(' ')}</span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-lg text-lg transition-colors shadow-lg shadow-amber-500/25"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </Link>
              {settings.phone && (
                <a
                  href={`tel:${String(settings.phone).replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors backdrop-blur-sm"
                >
                  <Phone className="w-5 h-5" />
                  Call for Bulk Quotes
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Spec strip ── */}
      <section className="bg-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-900">
                <span className="text-xl">{s.icon}</span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs opacity-75">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Material / Category ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Shop by Type</h2>
          <p className="text-slate-500">Browse by hole pattern, material or gauge</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {categories.slice(1).map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-slate-100 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-amber-300 group-hover:bg-amber-50 transition-colors">
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Popular Plates</h2>
              <p className="text-slate-500">Top-selling sizes & materials from our stock</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-semibold"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              View All Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Industries We Serve ── */}
      <section className="bg-slate-900 py-16 relative overflow-hidden">
        <PunchedPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Industries We Serve</h2>
          <p className="text-slate-400 text-center mb-10">Trusted by engineers, architects and procurement teams</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {industries.map((ind, i) => (
              <Link
                key={i}
                to="/products"
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 rounded-xl transition-all group cursor-pointer"
              >
                <span className="text-3xl">{ind.icon}</span>
                <span className="text-xs text-slate-400 group-hover:text-amber-300 text-center leading-tight font-medium">{ind.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Surface Finishes ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">Available Finishes</h2>
        <p className="text-slate-500 text-center mb-8">Specify your surface finish when ordering</p>
        <div className="flex flex-wrap justify-center gap-3">
          {finishes.map((f, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-current/20 ${f.color}`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {f.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Why Choose {shopName}?</h2>
          <p className="text-slate-400 text-center mb-10">Industrial quality, delivered to your door</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <div key={i} className="bg-slate-700/50 border border-slate-600 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 rounded-xl border border-slate-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bulk Order CTA ── */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Need a Custom Order?</h2>
          <p className="text-slate-800 mb-8 text-lg">
            Custom hole size, sheet dimension, material grade or finish? We handle one-offs and large volume runs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-lg transition-colors shadow-lg"
            >
              Browse Catalogue
            </Link>
            {settings.phone && (
              <a
                href={`tel:${String(settings.phone).replace(/[^\d+]/g, '')}`}
                className="bg-white/90 hover:bg-white text-slate-900 font-bold px-8 py-3.5 rounded-lg transition-colors shadow-lg"
              >
                Call {settings.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="bg-white py-16 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">What Our Clients Say</h2>
            <div className="mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                      {t.city && <p className="text-xs text-slate-400">{t.city}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
