import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

// brand icons drawn inline (newer lucide versions no longer ship them)
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
    <footer className="bg-green-900 text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">{shopName}</span>
            </div>
            <p className="text-sm text-green-300 leading-relaxed">
              {settings.tagline}
            </p>
            {(() => {
              const links = [
                { href: socialUrl(settings.instagram, 'https://instagram.com/'), icon: <InstagramIcon />, label: 'Instagram' },
                { href: socialUrl(settings.facebook, 'https://facebook.com/'), icon: <FacebookIcon />, label: 'Facebook' },
                { href: settings.whatsapp.replace(/\D/g, '') ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '', icon: <WhatsAppIcon />, label: 'WhatsApp' },
              ].filter(l => l.href)
              return links.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {links.map(l => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className="text-green-400 hover:text-white transition-colors">{l.icon}</a>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors break-all">{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-green-400">
          <span>© {YEAR} {shopName}. All rights reserved.</span>
          <span>Powered by <span className="text-green-300 font-medium">{shopName}</span> 🌿</span>
        </div>
      </div>
    </footer>
  )
}
