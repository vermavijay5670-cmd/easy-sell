import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Cog, Phone, Mail, MapPin } from 'lucide-react'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.7 1.8-1.7h1.5V4.2S15.5 4 14.3 4C11.8 4 10.2 5.5 10.2 8.2v2.6H7.5V14h2.7v8h3.3z" /></svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" /></svg>
)

const socialUrl = (value, base) => {
  const v = (value || '').trim()
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `${base}${v.replace(/^@/, '').replace(/^\//, '')}`
}

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { shopName, settings } = useSettings()

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
      {/* Top amber accent bar */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                <Cog className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-white font-bold text-xl">{shopName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-sm">
              {settings.tagline}
            </p>
            {(() => {
              const links = [
                { href: socialUrl(settings.instagram, 'https://instagram.com/'), icon: <InstagramIcon />, label: 'Instagram' },
                { href: socialUrl(settings.facebook, 'https://facebook.com/'), icon: <FacebookIcon />, label: 'Facebook' },
                { href: settings.whatsapp?.replace(/\D/g, '') ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '', icon: <WhatsAppIcon />, label: 'WhatsApp' },
              ].filter(l => l.href)
              return links.length > 0 && (
                <div className="flex gap-3">
                  {links.map(l => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label}
                      className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500 transition-colors">
                      {l.icon}
                    </a>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-amber-400 transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Cart</Link></li>
              <li><Link to="/track" className="hover:text-amber-400 transition-colors">Track Order</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-amber-400 transition-colors">{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-amber-400 transition-colors break-all">{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line text-slate-400">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <span>© {YEAR} {shopName}. All rights reserved.</span>
          <span>Precision Punched Plates — Industrial Supply</span>
        </div>
      </div>
    </footer>
  )
}
