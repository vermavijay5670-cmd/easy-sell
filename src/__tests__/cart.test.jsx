import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'

let productsState, authState
vi.mock('../context/ProductsContext', () => ({ useProducts: () => productsState }))
vi.mock('../context/CustomerAuthContext', () => ({ useCustomerAuth: () => authState }))
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn() }) }))
import toast from 'react-hot-toast'
import { CartProvider, useCart } from '../context/CartContext'

let api
const Probe = () => { api = useCart(); return null }
const mount = () => render(<CartProvider><Probe /></CartProvider>)
const P = (id, o = {}) => ({ id, name: 'P' + id, price: 10, unit: '1kg', image: 'i', stock: 5, ...o })

beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks()
  productsState = { live: false, products: [] }
  authState = { customer: null }
})
afterEach(() => cleanup())

describe('cart stays in line with the live shop', () => {
  it('updates prices, drops removed/sold-out products, caps quantity at stock', async () => {
    localStorage.setItem('greenbasket-cart', JSON.stringify([
      { ...P(1, { price: 99 }), quantity: 2 }, { ...P(2), quantity: 1 }, { ...P(3), quantity: 4 }, { ...P(4), quantity: 9 },
    ]))
    productsState = { live: true, products: [P(1), P(3, { stock: 0 }), P(4, { stock: 3 })] }
    await act(async () => { mount() })
    expect(api.cart.map(i => [i.id, i.price, i.quantity])).toEqual([[1, 10, 2], [4, 10, 3]])
    expect(toast.error).toHaveBeenCalled()
  })

  it('leaves the cart alone when the product list is only the built-in fallback', async () => {
    localStorage.setItem('greenbasket-cart', JSON.stringify([{ ...P(77), quantity: 2 }]))
    productsState = { live: false, products: [P(1)] }
    await act(async () => { mount() })
    expect(api.cart).toHaveLength(1)
  })
})

describe('stock limits', () => {
  it('caps addToCart and updateQuantity at stock', async () => {
    await act(async () => { mount() })
    const p = P(1, { stock: 2 })
    await act(async () => { api.addToCart(p) })
    await act(async () => { api.addToCart(p) })
    await act(async () => { api.addToCart(p) })
    expect(api.cart[0].quantity).toBe(2)
    await act(async () => { api.updateQuantity(1, 10) })
    expect(api.cart[0].quantity).toBe(2)
    expect(toast.error).toHaveBeenCalledWith('Only 2 available')
  })
})

describe('Order again (addItems)', () => {
  it('merges, caps at stock, skips sold-out and reports shortfalls', async () => {
    await act(async () => { mount() })
    await act(async () => { api.addToCart(P(1)) })
    let skipped
    await act(async () => { skipped = api.addItems([
      { product: P(1), quantity: 2 },
      { product: P(2, { stock: 2 }), quantity: 5 },
      { product: P(3, { stock: 0 }), quantity: 1 },
    ]) })
    expect(api.cart.map(i => [i.id, i.quantity])).toEqual([[1, 3], [2, 2]])
    expect(skipped).toEqual(['P2 (only 2 available)', 'P3'])
  })
})

describe('logout', () => {
  it('empties the cart when the customer logs out, but not for guests', async () => {
    authState = { customer: null }
    const { rerender } = mount()
    await act(async () => { api.addToCart(P(1)) })            // guest adds an item
    expect(api.cart).toHaveLength(1)
    authState = { customer: { id: 'u1' } }                    // logs in: cart kept
    await act(async () => { rerender(<CartProvider><Probe /></CartProvider>) })
    expect(api.cart).toHaveLength(1)
    authState = { customer: null }                            // logs out: cart cleared
    await act(async () => { rerender(<CartProvider><Probe /></CartProvider>) })
    expect(api.cart).toHaveLength(0)
  })
})
