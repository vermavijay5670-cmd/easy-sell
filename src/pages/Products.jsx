import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import CategoryFilter from '../components/CategoryFilter'
import SearchBar from '../components/SearchBar'
import { SlidersHorizontal, Package } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A to Z' },
]

export default function Products() {
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort]         = useState('default')

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  const handleCategorySelect = (cat) => {
    setCategory(cat)
    setSearchParams(cat !== 'all' ? { category: cat } : {})
  }

  const filtered = products
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || p.category === category
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name-asc')   return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Package className="w-7 h-7 text-amber-400" />
            Punched Plate Catalogue
          </h1>
          <p className="text-slate-400 text-sm">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar onSearch={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-slate-700"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-7">
          <CategoryFilter selected={category} onSelect={handleCategorySelect} />
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-6xl">🔍</span>
            <p className="text-xl font-semibold text-slate-700 mt-4">No plates found</p>
            <p className="text-slate-400 mt-2">Try a different search term or category</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setSearchParams({}) }}
              className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
