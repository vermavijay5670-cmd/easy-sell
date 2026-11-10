// Supabase Edge Function: sends a Telegram message for every new order.
// Called by the database trigger in supabase-migration-telegram.sql.
// The bot token lives only here (as a secret), never in the website code.
//
// Secrets to set (Edge Functions -> Secrets):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WEBHOOK_SECRET

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

Deno.serve(async (req) => {
  // Only our database trigger knows this secret
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (!token || !chatId) return new Response('Telegram secrets missing', { status: 500 })

  let order: Record<string, any>
  let cancelled = false
  try {
    const body = await req.json()
    cancelled = body.type === 'cancelled'
    order = cancelled ? body.order : body.record
    if (!order?.id) throw new Error('no record')
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const items = (Array.isArray(order.items) ? order.items : [])
    .map((i: any) => `  • ${esc(i.name)} x${esc(i.quantity)} = ₹${(Number(i.price) * Number(i.quantity)).toFixed(2)}`)
    .join('\n')

  const text = cancelled
    ? `❌ <b>Order Cancelled by Customer #${esc(String(order.id).slice(0, 8).toUpperCase())}</b>\n\n` +
      `👤 <b>Customer:</b> ${esc(order.customer_name)}\n` +
      `📞 <b>Phone:</b> ${esc(order.phone)}\n\n` +
      `🧾 <b>Items:</b>\n${items}\n\n` +
      `💰 <b>Total: ₹${Number(order.total).toFixed(2)}</b>\n` +
      `ℹ️ Do not dispatch this order.`
    :
    `🛒 <b>New Order #${esc(String(order.id).slice(0, 8).toUpperCase())}</b>\n\n` +
    `👤 <b>Customer:</b> ${esc(order.customer_name)}\n` +
    `📞 <b>Phone:</b> ${esc(order.phone)}\n` +
    `📍 <b>Address:</b> ${esc(order.address)}, ${esc(order.city)} - ${esc(order.pincode)}` +
    (order.landmark ? ` (Near ${esc(order.landmark)})` : '') + `\n\n` +
    `🧾 <b>Items:</b>\n${items}\n\n` +
    `💰 <b>Total: ₹${Number(order.total).toFixed(2)}</b> (Cash on Delivery)\n` +
    `🕐 <b>Time:</b> ${new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
    `📝 <b>Notes:</b> ${esc(order.notes) || 'None'}`

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    console.error('Telegram error:', res.status, await res.text())
    return new Response('Telegram request failed', { status: 502 })
  }
  return new Response('ok')
})
