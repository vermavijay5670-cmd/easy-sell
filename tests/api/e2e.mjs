// Run via tests/api/run.sh (it sets up the database and API server first).
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const PORT = process.env.API_PORT || 3001
const SECRET = 'super-secret-jwt-key-for-local-test-1234567890'
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (claims) => { const h = b64({ alg: 'HS256', typ: 'JWT' }), p = b64({ ...claims, exp: Math.floor(Date.now() / 1000) + 3600 }); return `${h}.${p}.${crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url')}` }
const ids = { alice: '11111111-1111-1111-1111-111111111111', bob: '22222222-2222-2222-2222-222222222222', admin: '99999999-9999-9999-9999-999999999999' }
const client = (who) => createClient(`http://localhost:${PORT}`, 'anon-key', {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    fetch: (url, init) => fetch(String(url).replace('/rest/v1', ''), init),
    headers: { Authorization: `Bearer ${who ? jwt({ role: 'authenticated', sub: ids[who] }) : jwt({ role: 'anon' })}` },
  },
})
const anon = client(null), alice = client('alice'), bob = client('bob'), admin = client('admin')

let pass = 0, fail = 0
const check = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '   <-- ' + extra}`) }
const stockOf = async (id) => (await admin.from('products').select('stock').eq('id', id).single()).data.stock
const mkOrder = (user, items, over = {}) => ({
  id: crypto.randomUUID(), user_id: ids[user], customer_name: user, email: `${user}@x.com`, phone: '9876543210',
  address: '12 Main St', city: 'Patna', pincode: '800001', landmark: '', notes: '', items, total: 1, status: 'pending', payment_method: 'cod', ...over,
})
const cartItem = (p, qty, price) => ({ ...p, price: price ?? p.price, quantity: qty })

// ---------- anonymous visitor
{
  const { data: prods, error } = await anon.from('products').select('*').order('id')
  check('anon reads products (storefront)', !error && prods.length === 24, error?.message)
  const FIELDS = ['hero_badge','hero_title','hero_subtitle','categories','instagram','facebook','whatsapp','testimonials','shop_name','phone','email','address','tagline']
  const s = await anon.from('shop_settings').select(FIELDS.join(',')).eq('id', 1).maybeSingle()
  check('anon reads shop settings with every field the app selects', !s.error && s.data?.shop_name === 'GreenBasket', s.error?.message)
  const ins = await anon.from('orders').insert([mkOrder('alice', [cartItem(prods[0], 1)], { user_id: null })]).select().single()
  check('anon cannot place an order', !!ins.error, 'order went through')
  const t = await anon.rpc('track_order', { p_order: 'abcdef12', p_phone: '9876543210' })
  check('track_order with no match returns empty list', !t.error && t.data.length === 0, t.error?.message)
}

// ---------- Alice: checkout
const prods = (await admin.from('products').select('*').order('id')).data
const tomato = prods[0], carrot = prods[1]
const stock0 = await stockOf(tomato.id)
let order1
{
  // tampered cart: price 1 instead of the real price, extra junk fields, total 1
  const o = mkOrder('alice', [cartItem(tomato, 2, 1), cartItem(carrot, 1, 1)])
  const r = await alice.from('orders').insert([o]).select().single()
  check('checkout insert(...).select().single() returns the saved order', !r.error && r.data?.id === o.id, r.error?.message)
  order1 = r.data
  const expected = tomato.price * 2 + carrot.price * 1
  check('server re-priced the tampered cart', Number(r.data.total) === expected, `total=${r.data.total} expected=${expected}`)
  check('items rebuilt from product table (real prices)', r.data.items.every(i => i.price === prods.find(p => p.id === i.id).price))
  check('status forced to pending', r.data.status === 'pending')
  check('stock reduced by quantity ordered', (await stockOf(tomato.id)) === stock0 - 2)

  const big = await alice.from('orders').insert([mkOrder('alice', [cartItem(tomato, 90)])]).select().single()
  check('not enough stock -> error.code P0001 with readable message', big.error?.code === 'P0001' && /Not enough stock/.test(big.error.message), JSON.stringify(big.error))
  const huge = await alice.from('orders').insert([mkOrder('alice', [cartItem(tomato, 9999)])]).select().single()
  check('quantity over 100 -> friendly P0001', huge.error?.code === 'P0001' && /at most 100/.test(huge.error.message), JSON.stringify(huge.error))
  const neg = await alice.from('orders').insert([mkOrder('alice', [cartItem(tomato, -3)])]).select().single()
  check('negative quantity rejected', neg.error?.code === 'P0001', JSON.stringify(neg.error))
  const gone = await alice.from('orders').insert([mkOrder('alice', [cartItem({ ...tomato, id: 987654 }, 1)])]).select().single()
  check('unknown/removed product -> P0001', gone.error?.code === 'P0001', JSON.stringify(gone.error))
  const other = await alice.from('orders').insert([mkOrder('bob', [cartItem(tomato, 1)])]).select().single()
  check('cannot place an order as another user', !!other.error)

  // fill up to 5 pending, 6th must be refused with P0001
  for (let i = 0; i < 4; i++) await alice.from('orders').insert([mkOrder('alice', [cartItem(carrot, 1)])])
  const sixth = await alice.from('orders').insert([mkOrder('alice', [cartItem(carrot, 1)])]).select().single()
  check('6th pending order refused with P0001', sixth.error?.code === 'P0001' && /5 orders/.test(sixth.error.message), JSON.stringify(sixth.error))

  const last = await alice.from('orders').select('customer_name, phone, address, city, pincode, landmark').eq('user_id', ids.alice).order('created_at', { ascending: false }).limit(1)
  check('checkout prefill query returns last order', !last.error && last.data.length === 1 && last.data[0].city === 'Patna', last.error?.message)
}

// ---------- Alice: My Orders
{
  const r = await alice.from('orders').select('*, order_status_history(status, created_at)').eq('user_id', ids.alice).order('created_at', { ascending: false })
  check('My Orders query with status-history embed works', !r.error && r.data.length === 5 && Array.isArray(r.data[0].order_status_history) && r.data[0].order_status_history[0]?.status === 'pending', r.error?.message)
  const c = await alice.rpc('cancel_my_order', { p_order: order1.id })
  check('customer cancels own pending order', !c.error, c.error?.message)
  check('stock restored after cancel', (await stockOf(tomato.id)) === stock0)
  const again = await alice.rpc('cancel_my_order', { p_order: order1.id })
  check('cancelling twice gives a friendly error', /already cancelled/.test(again.error?.message || ''), JSON.stringify(again.error))
  const b = await bob.rpc('cancel_my_order', { p_order: order1.id })
  check("another customer cannot cancel Alice's order", /not found/i.test(b.error?.message || ''), JSON.stringify(b.error))
  const bo = await bob.from('orders').select('id')
  check('Bob sees none of Alice\'s orders', !bo.error && bo.data.length === 0)
  const up = await alice.from('orders').update({ status: 'delivered', total: 1 }).eq('user_id', ids.alice).select()
  check('customer cannot edit orders directly', !up.error && up.data.length === 0)
  const stats = await alice.rpc('admin_stats')
  check('customer cannot read admin stats', !!stats.error)
  const prod = await alice.from('products').update({ price: 1 }).eq('id', 1).select()
  check('customer cannot change products', !prod.error && prod.data.length === 0)
  const set = await alice.from('shop_settings').update({ shop_name: 'HACKED' }).eq('id', 1).select()
  check('customer cannot change settings', !set.error && set.data.length === 0)
  const adm = await alice.from('admins').select('user_id').eq('user_id', ids.alice).maybeSingle()
  check('customer is not an admin (AuthContext check)', !adm.error && adm.data === null)
  const t = await anon.rpc('track_order', { p_order: order1.id.slice(0, 8).toUpperCase(), p_phone: '9876543210' })
  check('guest tracking finds order by short id + phone, with history', !t.error && t.data.length === 1 && t.data[0].history.length >= 2, JSON.stringify(t))
  const t2 = await anon.rpc('track_order', { p_order: order1.id.slice(0, 8), p_phone: '1111111111' })
  check('guest tracking rejects wrong phone', !t2.error && t2.data.length === 0)
}

// ---------- Admin
{
  const adm = await admin.from('admins').select('user_id').eq('user_id', ids.admin).maybeSingle()
  check('admin recognised by AuthContext query', !adm.error && adm.data?.user_id === ids.admin, adm.error?.message)
  const list = await admin.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 19)
  check('admin list with exact count + range', !list.error && list.count === 5 && list.data.length === 5, list.error?.message)
  const f = await admin.from('orders').select('*', { count: 'exact' }).eq('status', 'cancelled').range(0, 19)
  check('admin status filter', !f.error && f.count === 1)
  const sr = await admin.from('orders').select('*', { count: 'exact' }).or('customer_name.ilike.%alic%,phone.ilike.%alic%,city.ilike.%alic%').range(0, 19)
  check('admin search by name (or + ilike)', !sr.error && sr.count === 5, sr.error?.message)
  const sp = await admin.from('orders').select('*', { count: 'exact' }).or('customer_name.ilike.%9876543210%,phone.ilike.%9876543210%,city.ilike.%9876543210%').range(0, 19)
  check('admin search by phone', !sp.error && sp.count === 5)
  const pre = order1.id.slice(0, 8).toLowerCase()
  const sid = await admin.from('orders').select('*', { count: 'exact' }).gte('id', `${pre}-0000-0000-0000-000000000000`).lte('id', `${pre}-ffff-ffff-ffff-ffffffffffff`)
  check('admin search by short order id', !sid.error && sid.count === 1 && sid.data[0].id === order1.id, sid.error?.message)
  const st = await admin.rpc('admin_stats')
  const row = st.data?.[0]
  check('admin_stats: counts and revenue exclude cancelled', !st.error && Number(row.total_orders) === 5 && Number(row.pending_orders) === 4 && Number(row.revenue) === carrot.price * 4, JSON.stringify(st))

  const target = list.data.find(o => o.status === 'pending')
  const u = await admin.from('orders').update({ status: 'confirmed' }).eq('id', target.id).select()
  check('admin changes status', !u.error && u.data[0].status === 'confirmed', u.error?.message)
  const h = await admin.from('order_status_history').select('status').eq('order_id', target.id).order('id')
  check('status history recorded', h.data.map(x => x.status).join() === 'pending,confirmed', JSON.stringify(h.data))

  // admin product management as the app does it
  const all = (await admin.from('products').select('id')).data
  const nextId = Math.max(0, ...all.map(p => p.id)) + 1
  const add = await admin.from('products').insert([{ id: nextId, name: 'Toor Dal', category: 'dal', price: 140, unit: '1 kg', stock: 25, badge: null, description: '', image: 'http://x/y.jpg', active: true }])
  check('admin adds a product (client-chosen id)', !add.error, add.error?.message)
  const upd = await admin.from('products').update({ price: 150, stock: 20 }).eq('id', nextId)
  check('admin edits a product', !upd.error)
  const hide = await anon.from('products').select('id').eq('id', nextId)
  check('anon can read the new product', hide.data.length === 1)
  const del = await admin.from('products').delete().eq('id', nextId).select()
  check('admin deletes a product', !del.error && del.data.length === 1)
  const delByAlice = await alice.from('products').delete().eq('id', 1).select()
  check('customer cannot delete products', delByAlice.data.length === 0)

  // settings as the app saves them (all fields incl. arrays)
  const save = await admin.from('shop_settings').update({
    shop_name: 'Vikash Kirana Store', phone: '+91 98765 43210', email: 'a@b.co', address: 'x\ny', tagline: 't', instagram: '', facebook: '', whatsapp: '919876543210',
    hero_badge: 'b', hero_title: 'T1\nT2', hero_subtitle: 's',
    categories: [{ id: 'dal', name: 'Dal', icon: '🫘' }], testimonials: [{ name: 'A', city: 'P', text: 'good', stars: 5 }], updated_at: new Date().toISOString(),
  }).eq('id', 1).select()
  check('admin saves settings (arrays/jsonb round-trip)', !save.error && save.data.length === 1 && save.data[0].categories[0].id === 'dal', save.error?.message)
  const back = await anon.from('shop_settings').select('shop_name,categories,hero_title,testimonials').eq('id', 1).maybeSingle()
  check('settings visible to visitors', back.data?.shop_name === 'Vikash Kirana Store' && back.data.hero_title === 'T1\nT2')

  // cancel by admin re-opens/cancels stock logic
  const before = await stockOf(carrot.id)
  const rc = await admin.from('orders').update({ status: 'cancelled' }).eq('id', target.id).select()
  check('admin cancels -> stock returns', !rc.error && (await stockOf(carrot.id)) === before + 1, rc.error?.message)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
