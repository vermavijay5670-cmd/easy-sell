export const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered']

export const STATUS_INFO = {
  pending:    { label: 'Order Placed',     icon: '📋', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  confirmed:  { label: 'Confirmed',        icon: '✅', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  dispatched: { label: 'Out for Delivery', icon: '🚚', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  delivered:  { label: 'Delivered',        icon: '🎉', color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  cancelled:  { label: 'Cancelled',        icon: '❌', color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

const fmt = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

// history: [{ status, at }] — optional; shows the time each step happened
export default function OrderTimeline({ status, history = [] }) {
  const timeFor = (s) => {
    const h = [...history].reverse().find(x => x.status === s)
    return h ? fmt(h.at) : null
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <span className="text-xl">❌</span>
        <div>
          <p className="text-red-600 font-semibold text-sm">Order Cancelled</p>
          {timeFor('cancelled') && <p className="text-xs text-red-400">{timeFor('cancelled')}</p>}
        </div>
      </div>
    )
  }

  const currentIdx = Math.max(STATUS_STEPS.indexOf(status), 0)
  return (
    <div className="flex items-start gap-1 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx
        const active = idx === currentIdx
        return (
          <div key={step} className="flex items-start gap-1 shrink-0">
            <div className="flex flex-col items-center w-20">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'} ${active ? 'ring-2 ring-green-300 ring-offset-1' : ''}`}>
                {done ? '✓' : idx + 1}
              </div>
              <span className={`text-xs mt-1 font-medium text-center ${done ? 'text-green-700' : 'text-gray-400'}`}>
                {STATUS_INFO[step].label}
              </span>
              {done && timeFor(step) && <span className="text-[10px] text-gray-400 text-center">{timeFor(step)}</span>}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mt-4 shrink-0 rounded ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
