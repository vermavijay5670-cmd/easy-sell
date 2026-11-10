import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const rows = [
  { id: 1, name: 'Toor Dal', category: 'dal', price: 140, unit: '1 kg', stock: 25, image: 'a', active: true },
  { id: 2, name: 'Basmati Rice', category: 'rice-atta', price: 90, unit: '1 kg', stock: 3, image: 'b', active: true },
  { id: 3, name: 'Mustard Oil', category: 'oil', price: 180, unit: '1 L', stock: 0, image: 'c', active: true },
]
vi.mock('../lib/supabase', () => ({
  supabaseConfigured: true,
  supabase: { from: () => ({ select: () => ({ order: async () => ({ data: rows, error: null }) }) }), storage: { from: () => ({}) } },
}))
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }))
vi.mock('../context/ProductsContext', () => ({ useProducts: () => ({ refresh: vi.fn() }) }))
vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { categories: [
    { id: 'rice-atta', name: 'Rice & Atta', icon: '🌾' }, { id: 'dal', name: 'Dal', icon: '🫘' }, { id: 'oil', name: 'Oil', icon: '🫒' },
  ] } }),
}))
import AdminProducts from '../pages/Admin/AdminProducts'

afterEach(() => cleanup())
const open = async () => { await act(async () => { render(<MemoryRouter><AdminProducts /></MemoryRouter>) }) }

describe('Manage Products', () => {
  it('lists every product, and flags low / out of stock', async () => {
    await open()
    expect(screen.getByText('Toor Dal')).toBeTruthy()
    expect(screen.getByText('Basmati Rice')).toBeTruthy()
    expect(screen.getByText('Low stock')).toBeTruthy()
    expect(screen.getByText('Out of stock')).toBeTruthy()
  })

  it('search filters by name, category filter narrows, and an empty result says so', async () => {
    const user = userEvent.setup()
    await open()
    await user.type(screen.getByLabelText('Search products'), 'rice')
    expect(screen.queryByText('Toor Dal')).toBeNull()
    expect(screen.getByText('Basmati Rice')).toBeTruthy()
    await user.clear(screen.getByLabelText('Search products'))
    await user.selectOptions(screen.getByLabelText('Filter by category'), 'oil')
    expect(screen.getByText('Mustard Oil')).toBeTruthy()
    expect(screen.queryByText('Toor Dal')).toBeNull()
    await user.type(screen.getByLabelText('Search products'), 'zzz')
    expect(screen.getByText(/No products match/)).toBeTruthy()
  })

  it('stock inputs and visibility toggles have accessible names', async () => {
    await open()
    expect(screen.getByLabelText('Stock for Toor Dal')).toBeTruthy()
    expect(screen.getByLabelText(/Toor Dal: shown in shop/)).toBeTruthy()
  })
})
