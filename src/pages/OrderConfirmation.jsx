import { useLocation, Link, Navigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function OrderConfirmation() {
  const { state } = useLocation()

  // refreshed or opened directly: the order itself is safe, just send them to their orders
  if (!state) return <Navigate to="/my-orders" replace />

  const { orderId, customerName, phone, total, items } = state
  const shortId = String(orderId).slice(0, 8).toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Thank you, <span className="font-semibold text-gray-700">{customerName}</span>! Your order has been received and will be delivered soon.
        </p>

        <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-mono font-semibold text-gray-700 text-xs break-all">#{shortId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone</span>
            <span className="font-semibold text-gray-700">{phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-semibold text-gray-700">Cash on Delivery</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-700">Total</span>
            <span className="text-green-700">₹{Number(total).toFixed(2)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="text-left mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h3>
          <div className="space-y-2">
            {items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/my-orders"
          className="w-full inline-block border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-xl transition-colors mb-3"
        >
          Track This Order 🚚
        </Link>
        <Link
          to="/products"
          className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Continue Shopping 🛒
        </Link>
      </div>
    </div>
  )
}
