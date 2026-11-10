import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { ProductsProvider } from './context/ProductsContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import CustomerLogin from './pages/CustomerLogin'
import CustomerOrders from './pages/CustomerOrders'
import TrackOrder from './pages/TrackOrder'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/AdminProducts'))
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'))
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'))
import { useState, useEffect, lazy, Suspense } from 'react'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  return admin ? children : <Navigate to="/admin" replace />
}

function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isStandalone = isAdmin || ['/login', '/my-orders', '/reset-password'].includes(location.pathname)
  const [globalSearch, setGlobalSearch] = useState('')

  // start each page at the top when navigating
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  return (
    <>
      {!isStandalone && <Navbar onSearch={setGlobalSearch} />}
      <CartSidebar />
      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products globalSearch={globalSearch} />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/my-orders" element={<CustomerOrders />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!isStandalone && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
      <SettingsProvider>
      <ProductsProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
        <AppLayout />
      </CartProvider>
      </ProductsProvider>
      </SettingsProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  )
}
