import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useSettings } from '../context/SettingsContext'
import toast from 'react-hot-toast'
import { Leaf, Loader2 } from 'lucide-react'

const input = 'w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400'

// Opened from the link in the "reset password" email. Supabase signs the user in
// with a temporary recovery session, which lets us set a new password.
export default function ResetPassword() {
  const { customer, customerLoading, updatePassword } = useCustomerAuth()
  const { shopName } = useSettings()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await updatePassword(password)
      toast.success('Password updated!')
      navigate('/my-orders', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-bold text-xl mb-4">
            <Leaf className="w-6 h-6" /> {shopName}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Set a New Password</h1>
        </div>

        {customerLoading ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : !customer ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">This reset link is invalid or has expired.</p>
            <Link to="/login" className="inline-block text-green-600 font-semibold hover:underline text-sm">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-1" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input id="reset-1" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className={input} />
            </div>
            <div>
              <label htmlFor="reset-2" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input id="reset-2" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={input} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
