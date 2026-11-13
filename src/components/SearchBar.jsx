import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({ onSearch, value, onChange }) {
  const [query, setQuery] = useState(value || '')

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (onChange) onChange(val)
    if (onSearch) onSearch(val)
  }

  const clear = () => {
    setQuery('')
    if (onChange) onChange('')
    if (onSearch) onSearch('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Search plates, materials, sizes..."
        value={query}
        onChange={handleChange}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition placeholder-slate-400"
      />
      {query && (
        <button onClick={clear} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
