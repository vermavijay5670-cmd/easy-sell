import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X, Cog, User, PackageSearch } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useSettings } from '../context/SettingsContext'
import SearchBar from './SearchBar'

export default function Navbar({ onSearch }) {
  const { cartCount, setIsCartOpen } = useCart()
  const { customer } = useCustomerAuth()
  const { shopName } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 shadow-xl border-b border-amber-500/30">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-xl group">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg group-hover:bg-amber-400 transition-colors">
              <Cog className="w-5 h-5 text-slate-900 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="tracking-tight truncate max-w-[10rem] sm:max-w-none text-white">
              {shopName}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                      : 'text-slate-300 hover:text-amber-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xs mx-6">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              className="relative flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-3 py-2 rounded-lg transition-colors shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Track Order */}
            <Link
              to="/track"
              className="hidden sm:flex items-center gap-1 text-sm text-slate-300 hover:text-amber-400 transition-colors"
            >
              <PackageSearch className="w-4 h-4" />
              Track
            </Link>

            {/* Login / My Orders */}
            <Link
              to={customer ? '/my-orders' : '/login'}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{customer ? 'My Orders' : 'Login'}</span>
            </Link>

            {/* Hamburger */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen(prev => !prev)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-700 pt-3 mt-1">
            <SearchBar onSearch={(q) => { if (onSearch) onSearch(q); setMobileOpen(false) }} />
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block text-sm font-semibold px-2 py-1.5 rounded-lg ${
                    isActive
                      ? 'text-amber-400 bg-slate-700'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/track"
              className="block text-sm font-medium text-slate-300 hover:text-amber-400 px-2 py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              Track Order
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
