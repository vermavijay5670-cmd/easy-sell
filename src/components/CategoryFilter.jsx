import { useSettings } from '../context/SettingsContext'

export default function CategoryFilter({ selected, onSelect }) {
  const { categories } = useSettings()
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all border
            ${selected === cat.id
              ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600'
            }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  )
}
