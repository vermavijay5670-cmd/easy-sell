import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'
import { Leaf, Loader2, ArrowLeft } from 'lucide-react'

export default function AdminLogin() {
  const { adminLogin, admin, loading: authLoading } = useAuth()
  const { shopName } = useSettings()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(email, password)
      toast.success('Welcome back, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Already signed in (session is remembered) -> skip the login form
  if (!authLoading && admin) return <Navigate to="/admin/dashboard" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <Link to="/" title="Back to website" className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
            <Leaf className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">{shopName} Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="alogin-1" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="alogin-1"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@yourshop.com"
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
          <div>
            <label htmlFor="alogin-2" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="alogin-2"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
