import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Package, DollarSign, Archive, LogOut, Leaf, ExternalLink, ArrowLeft, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const { admin, adminLogout } = useAuth()
  const { shopName } = useSettings()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, products: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // preferred: computed in the database (needs supabase-migration-admin-orders.sql)
      const { data: s, error: rpcError } = await supabase.rpc('admin_stats')
      if (!rpcError && Array.isArray(s) && s[0]) {
        setStats({
          total: Number(s[0].total_orders),
          pending: Number(s[0].pending_orders),
          revenue: Number(s[0].revenue),
          products: Number(s[0].product_count),
        })
        return
      }

      // fallback (limited to the first 1000 orders)
      const { data: orders } = await supabase.from('orders').select('total, status')
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })

      if (orders) {
        setStats({
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0),
          products: productCount || 0,
        })
      }
    } catch (err) {
      console.error('Stats error:', err)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    navigate('/admin')
  }

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: <ShoppingBag className="w-6 h-6" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Orders', value: stats.pending, icon: <Package className="w-6 h-6" />, color: 'text-orange-600 bg-orange-50' },
    { label: 'Revenue (excl. cancelled)', value: `₹${stats.revenue.toFixed(2)}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-green-600 bg-green-50' },
    { label: 'Products', value: stats.products, icon: <Archive className="w-6 h-6" />, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Leaf className="w-6 h-6" />
          <span>{shopName} Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Website
          </Link>
          <span className="text-sm text-green-200 hidden sm:block">{admin?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-white text-green-200 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" title="Back to website" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/orders" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <ShoppingBag className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 text-lg">Manage Orders</h3>
            <p className="text-sm text-gray-500 mt-1">View and update all customer orders</p>
          </Link>
          <Link to="/admin/products" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <Archive className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 text-lg">Manage Products</h3>
            <p className="text-sm text-gray-500 mt-1">Edit stock and product visibility</p>
          </Link>
          <Link to="/admin/settings" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <Settings className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 text-lg">Shop Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Shop name, contact details and footer text</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
