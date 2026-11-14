import { useState } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useSettings } from '../context/SettingsContext'
import toast from 'react-hot-toast'
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react'

// Field component defined OUTSIDE to avoid focus-loss bug
function Field({ label, name, type, placeholder, value, onChange, error, rightElement }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type || 'text'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition pr-10 ${error ? 'border-red-400' : 'border-gray-300'}`}
        />
        {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function CustomerLogin() {
  const { signIn, signUp, resetPassword, customer } = useCustomerAuth()
  const { shopName } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/my-orders'
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  // Redirect if already logged in
  if (customer) return <Navigate to={redirectTo} replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateLogin = () => {
    const e = {}
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const validateSignup = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      toast.success('Welcome back! 🌿')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const errs = validateSignup()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const data = await signUp(form.email, form.password, form.fullName)
      if (data?.session) {
        toast.success('Account created! 🌿')
        navigate(redirectTo, { replace: true })
      } else {
        toast.success('Account created! Check your email to confirm, then log in.')
        setTab('login')
      }
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: 'Valid email required' })
      return
    }
    setLoading(true)
    try {
      await resetPassword(form.email.trim())
      toast.success('If that email has an account, a reset link is on its way.')
      setTab('login')
    } catch (err) {
      toast.error(err.message || 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (
    <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="text-gray-400 hover:text-gray-600">
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-700 font-bold text-xl mb-4">
            <Leaf className="w-6 h-6" />
            {shopName}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {tab === 'login' ? 'Welcome Back!' : tab === 'forgot' ? 'Reset Password' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {location.state?.from === '/checkout'
              ? 'Please log in or sign up to place your order'
              : tab === 'login' ? 'Login to track your orders' : tab === 'forgot' ? "We'll email you a link to set a new password" : `Join ${shopName} today`}
          </p>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['login', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>}

        {/* Forgot Password Form */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
            <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setTab('login'); setErrors({}) }} className="w-full text-sm text-gray-500 hover:text-gray-700">
              ← Back to login
            </button>
          </form>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
            <Field label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} error={errors.password} rightElement={eyeBtn} />
            <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Login'}
            </button>
            <button type="button" onClick={() => { setTab('forgot'); setErrors({}) }} className="w-full text-sm text-amber-600 hover:underline">
              Forgot password?
            </button>
          </form>
        )}

        {/* Signup Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <Field label="Full Name" name="fullName" placeholder="Ramesh Kumar" value={form.fullName} onChange={handleChange} error={errors.fullName} />
            <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
            <Field label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={handleChange} error={errors.password} rightElement={eyeBtn} />
            <Field label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
            <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="text-amber-600 hover:underline">← Back to Shop</Link>
        </p>
      </div>
    </div>
  )
}
