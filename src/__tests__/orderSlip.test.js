import { describe, it, expect } from 'vitest'
import { createCanvas } from '@napi-rs/canvas'
import { canDownloadSlip, slipData, renderSlip } from '../lib/orderSlip'

const order = {
  id: '3f9a1c2b-0000-0000-0000-000000000000', created_at: '2026-11-06T09:30:00Z', status: 'confirmed',
  customer_name: 'Vijay Verma', phone: '9876543210', address: 'House 21, Main Road', city: 'Patna', pincode: '800001', landmark: 'Near SBI',
  notes: '', total: 280,
  items: [
    { name: 'Toor Dal', unit: '1 kg', quantity: 2, price: 100 },
    { name: 'चना दाल', unit: '1 kg', quantity: 1, price: 80 },
  ],
}
const shop = { shopName: 'Vikash Kirana Store', address: 'Main Market\nPatna', phone: '+91 98765 43210', email: '' }
const make = (w, h) => createCanvas(w, h)

describe('order slip', () => {
  it('can be downloaded only after the shop confirms the order', () => {
    const allowed = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].filter(status => canDownloadSlip({ status }))
    expect(allowed).toEqual(['confirmed', 'dispatched', 'delivered'])
    expect(canDownloadSlip(undefined)).toBe(false)
  })

  it('collects what the slip shows from the saved order', () => {
    const d = slipData(order, shop)
    expect(d.shortId).toBe('3F9A1C2B')
    expect(d.statusText).toBe('Confirmed')
    expect(d.totalText).toBe('₹280.00')
    expect(d.items.map(i => i.amount)).toEqual([200, 80])
    expect(d.addressLines).toEqual(['House 21, Main Road', 'Patna - 800001', 'Near: Near SBI'])
    expect(d.shopLines).toEqual(['Main Market', 'Patna', '+91 98765 43210'])   // empty email is skipped
  })

  it('copes with missing or odd data without crashing', () => {
    const d = slipData({ id: 'abcdef123456', created_at: '2026-11-06T09:30:00Z', status: 'delivered', items: null, total: null }, {})
    expect(d.items).toEqual([])
    expect(d.totalText).toBe('₹0.00')
    expect(() => renderSlip(d, make)).not.toThrow()
  })

  it('draws a page at least A4 tall, and a taller one for long orders', () => {
    const short = renderSlip(slipData(order, shop), make)
    expect(short.width).toBe(595)
    expect(short.height).toBeGreaterThanOrEqual(842)
    const many = { ...order, items: Array.from({ length: 40 }, (_, i) => ({ name: `Item ${i}`, unit: '1 kg', quantity: 1, price: 10 })) }
    const long = renderSlip(slipData(many, shop), make)
    expect(long.height).toBeGreaterThan(short.height)
    expect(long.canvas.height).toBe(long.height * 2)
  })

  it('handles very long names and notes', () => {
    const long = { ...order, notes: 'word '.repeat(200), items: [{ name: 'X'.repeat(200), unit: '1', quantity: 1, price: 1 }] }
    expect(() => renderSlip(slipData(long, shop), make)).not.toThrow()
  })
})
