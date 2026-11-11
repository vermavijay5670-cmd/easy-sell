import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

let dbRow, productRows
vi.mock('../lib/supabase', () => ({
  supabaseConfigured: true,
  supabase: {
    from: (t) => t === 'shop_settings'
      ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: dbRow }) }) }), update: () => ({ eq: () => ({ select: async () => ({ data: [{}], error: null }) }) }) }
      : { select: async () => ({ data: productRows }) },
  },
}))
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }))
import toast from 'react-hot-toast'
import { SettingsProvider, useSettings, DEFAULT_CATEGORIES } from '../context/SettingsContext'
import AdminSettings from '../pages/Admin/AdminSettings'

beforeEach(() => { localStorage.clear(); vi.clearAllMocks() })
afterEach(() => cleanup())

const base = { shop_name: 'Shop', phone: '', email: '', address: '', tagline: 't', instagram: '', facebook: '', whatsapp: '', testimonials: [], hero_badge: 'b', hero_title: 'T', hero_subtitle: 's' }

describe('settings defaults', () => {
  it('a fresh database row falls back to the plate-shop defaults, but keeps blank contact details blank', async () => {
    dbRow = { ...base, shop_name: 'Vikash Kirana Store', tagline: '', categories: null, hero_badge: '', hero_title: '', hero_subtitle: '' }
    let s
    const P = () => { s = useSettings(); return null }
    await act(async () => { render(<SettingsProvider><P /></SettingsProvider>) })
    expect(s.shopName).toBe('Vikash Kirana Store')
    expect(s.settings.categories).toEqual(DEFAULT_CATEGORIES)
    expect(s.categories[0].id).toBe('all')
    expect(s.settings.hero_title).toMatch(/Disposable Plates/)
    expect(s.settings.phone).toBe('')
    expect(s.settings.address).toBe('')
  })

  it('saved categories and banner text are used', async () => {
    dbRow = { ...base, categories: [{ id: 'a', name: 'A', icon: '🅰️' }], hero_title: 'T1\nT2' }
    let s
    const P = () => { s = useSettings(); return null }
    await act(async () => { render(<SettingsProvider><P /></SettingsProvider>) })
    expect(s.settings.categories).toEqual([{ id: 'a', name: 'A', icon: '🅰️' }])
    expect(s.settings.hero_title).toBe('T1\nT2')
  })
})

describe('Shop Settings page', () => {
  const setup = async (row, products = []) => {
    dbRow = row; productRows = products
    await act(async () => { render(<MemoryRouter><SettingsProvider><AdminSettings /></SettingsProvider></MemoryRouter>) })
  }

  it('adds a category and saves it with a generated, unique id', async () => {
    const user = userEvent.setup()
    await setup({ ...base, categories: [{ id: 'rice-and-atta', name: 'Rice and Atta', icon: '🌾' }] })
    await user.click(screen.getAllByRole('button', { name: /^add$/i })[0])
    const names = screen.getAllByLabelText('Category name')
    expect(names).toHaveLength(2)
    await user.type(names[1], 'Rice & Atta')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('refuses an empty category name', async () => {
    const user = userEvent.setup()
    await setup({ ...base, categories: [{ id: 'a', name: 'Dal', icon: '🫘' }] })
    await user.type(screen.getAllByLabelText('Category name')[0], '{Backspace}{Backspace}{Backspace}')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/needs a name/))
  })

  it('does not allow removing a category that still has products', async () => {
    await setup({ ...base, categories: [{ id: 'dal', name: 'Dal', icon: '🫘' }, { id: 'oil', name: 'Oil', icon: '🫒' }] }, [{ category: 'dal' }, { category: 'dal' }])
    await waitFor(() => expect(screen.getAllByLabelText('Remove category')[0].disabled).toBe(true))
    expect(screen.getAllByLabelText('Remove category')[1].disabled).toBe(false)
  })

  it('every settings input has a label (accessibility)', async () => {
    await setup({ ...base, categories: [{ id: 'a', name: 'A', icon: '🅰️' }] })
    expect(screen.getByLabelText('Shop Name')).toBeTruthy()
    expect(screen.getByLabelText('Phone')).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
  })
})
