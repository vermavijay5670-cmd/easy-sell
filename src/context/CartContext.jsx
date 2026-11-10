import { createContext, useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useProducts } from './ProductsContext'
import { useCustomerAuth } from './CustomerAuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { products, live } = useProducts()
  const { customer } = useCustomerAuth()
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('greenbasket-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef(cart)

  useEffect(() => {
    cartRef.current = cart
    localStorage.setItem('greenbasket-cart', JSON.stringify(cart))
  }, [cart])

  // Logging out empties the cart, so the next person on a shared phone doesn't see it
  const wasLoggedIn = useRef(false)
  useEffect(() => {
    if (customer) wasLoggedIn.current = true
    else if (wasLoggedIn.current) { wasLoggedIn.current = false; setCart([]) }
  }, [customer])

  // Keep the saved cart in line with the live shop: refresh prices, drop products that were
  // removed or sold out, and cap quantities at the available stock.
  useEffect(() => {
    if (!live) return
    const byId = new Map(products.map(p => [p.id, p]))
    const removed = []
    const adjusted = []
    let changed = false
    const next = []

    for (const item of cartRef.current) {
      const p = byId.get(item.id)
      if (!p || p.stock < 1) { removed.push(item.name); changed = true; continue }
      const quantity = Math.min(item.quantity, p.stock)
      if (quantity !== item.quantity) adjusted.push(p.name)
      const updated = { ...item, name: p.name, price: p.price, unit: p.unit, image: p.image, stock: p.stock, quantity }
      if (['name', 'price', 'unit', 'image', 'stock', 'quantity'].some(k => updated[k] !== item[k])) changed = true
      next.push(updated)
    }

    if (!changed) return
    setCart(next)
    if (removed.length) toast.error(`No longer available, removed from cart: ${removed.join(', ')}`, { duration: 5000 })
    if (adjusted.length) toast(`Quantity reduced to available stock: ${adjusted.join(', ')}`, { duration: 5000 })
  }, [products, live])

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    const limit = product.stock ?? Infinity
    if ((existing?.quantity ?? 0) + 1 > limit) {
      toast.error(`Only ${limit} available`)
      return
    }
    setCart(prev => {
      const found = prev.find(item => item.id === product.id)
      if (found) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // Add many products at once (used by "Order again"). Quantities are capped at stock; unavailable ones are skipped.
  const addItems = (lines) => {
    const skipped = []
    let next = [...cartRef.current]
    for (const { product, quantity } of lines) {
      if (!product || product.stock < 1) { skipped.push(product?.name || 'an item'); continue }
      const idx = next.findIndex(i => i.id === product.id)
      const have = idx >= 0 ? next[idx].quantity : 0
      const qty = Math.min(have + quantity, product.stock)
      if (qty < have + quantity) skipped.push(`${product.name} (only ${product.stock} available)`)
      next = idx >= 0
        ? next.map((i, n) => n === idx ? { ...i, quantity: qty } : i)
        : [...next, { ...product, quantity: qty }]
    }
    setCart(next)
    return skipped
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id)
      return
    }
    const item = cart.find(i => i.id === id)
    if (item?.stock != null && qty > item.stock) {
      toast.error(`Only ${item.stock} available`)
      qty = item.stock
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      addItems,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
