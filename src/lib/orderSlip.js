// Order slip the customer can download once the shop has confirmed the order.
//
// The slip is drawn on a canvas (so any language, the ₹ sign and the shop's own name all render
// correctly) and then wrapped in a PDF. The PDF library is loaded only when someone clicks
// "Download Slip", so it doesn't slow the shop down for everyone else.

export const SLIP_STATUSES = ['confirmed', 'dispatched', 'delivered']

// pending orders aren't confirmed yet, cancelled orders have nothing to show
export const canDownloadSlip = (order) => SLIP_STATUSES.includes(order?.status)

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  dispatched: 'Out for delivery',
  delivered: 'Delivered',
}

const money = (n) => `₹${Number(n).toFixed(2)}`

// Everything the slip shows, worked out from the saved order (not from the cart or the browser)
export function slipData(order, shop = {}) {
  const items = (Array.isArray(order.items) ? order.items : []).map(i => ({
    name: String(i.name ?? ''),
    unit: String(i.unit ?? ''),
    quantity: Number(i.quantity) || 0,
    price: Number(i.price) || 0,
    amount: (Number(i.price) || 0) * (Number(i.quantity) || 0),
  }))
  return {
    shopName: shop.shopName || '',
    shopLines: [
      ...(shop.address ? String(shop.address).split('\n').map(s => s.trim()).filter(Boolean) : []),
      ...[shop.phone, shop.email].filter(Boolean),
    ],
    shortId: String(order.id).slice(0, 8).toUpperCase(),
    dateText: new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    statusText: STATUS_LABEL[order.status] || order.status,
    customerName: order.customer_name || '',
    phone: order.phone || '',
    addressLines: [
      order.address,
      [order.city, order.pincode].filter(Boolean).join(' - '),
      order.landmark ? `Near: ${order.landmark}` : '',
    ].filter(Boolean),
    items,
    total: Number(order.total) || 0,
    totalText: money(order.total),
    notes: order.notes || '',
  }
}

const W = 595          // A4 width in points
const M = 40           // page margin
const SCALE = 2        // draw at 2x so it stays sharp when printed
const FONT = '"Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", Arial, sans-serif'
const GREEN = '#15803d'
const INK = '#111827'
const GREY = '#6b7280'
const LINE = '#e5e7eb'

// Draw the slip. `dry` only measures, so the page can be exactly as tall as the content needs.
function paint(ctx, d, dry) {
  let y = M
  const text = (str, x, size, { bold = false, color = INK, align = 'left' } = {}) => {
    if (dry) return
    ctx.font = `${bold ? '700 ' : ''}${size}px ${FONT}`
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(str, x, y)
  }
  const rule = (color = LINE, width = 1) => {
    if (dry) return
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke()
  }
  const measure = (str, size, bold = false) => {
    ctx.font = `${bold ? '700 ' : ''}${size}px ${FONT}`
    return ctx.measureText(str).width
  }
  // split text into lines that fit `maxWidth`; very long single words are broken
  const wrap = (str, size, maxWidth, bold = false) => {
    const lines = []
    let line = ''
    for (const word of String(str).split(/\s+/).filter(Boolean)) {
      let w = word
      while (measure(w, size, bold) > maxWidth && w.length > 1) {
        let cut = w.length - 1
        while (cut > 1 && measure(w.slice(0, cut), size, bold) > maxWidth) cut--
        if (line) { lines.push(line); line = '' }
        lines.push(w.slice(0, cut))
        w = w.slice(cut)
      }
      const test = line ? `${line} ${w}` : w
      if (measure(test, size, bold) <= maxWidth) line = test
      else { if (line) lines.push(line); line = w }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  // --- header
  if (!dry) { ctx.fillStyle = GREEN; ctx.fillRect(0, 0, W, 6) }
  y += 14
  for (const l of wrap(d.shopName || 'Order Slip', 22, W - 2 * M, true)) { text(l, M, 22, { bold: true, color: GREEN }); y += 27 }
  y -= 4
  for (const l of d.shopLines) { text(l, M, 11, { color: GREY }); y += 15 }
  y += 8
  rule(GREEN, 1.5)
  y += 26

  // --- order info
  text('ORDER SLIP', M, 15, { bold: true })
  text(`#${d.shortId}`, W - M, 15, { bold: true, align: 'right' })
  y += 18
  text(d.dateText, M, 11, { color: GREY })
  text(d.statusText, W - M, 11, { bold: true, color: GREEN, align: 'right' })
  y += 28

  // --- deliver to
  text('DELIVER TO', M, 10, { bold: true, color: GREY })
  y += 17
  text(d.customerName, M, 13, { bold: true }); y += 17
  text(d.phone, M, 12); y += 16
  for (const l of d.addressLines) {
    for (const w of wrap(l, 12, W - 2 * M)) { text(w, M, 12); y += 16 }
  }
  y += 14

  // --- items table
  const colQty = W - M - 150, colRate = W - M - 80, colAmt = W - M
  const nameWidth = colQty - M - 40
  rule(INK, 1)
  y += 17
  text('ITEM', M, 10, { bold: true, color: GREY })
  text('QTY', colQty, 10, { bold: true, color: GREY, align: 'right' })
  text('RATE', colRate, 10, { bold: true, color: GREY, align: 'right' })
  text('AMOUNT', colAmt, 10, { bold: true, color: GREY, align: 'right' })
  y += 9
  rule(LINE)
  for (const it of d.items) {
    y += 19
    const nameLines = wrap(it.name, 12, nameWidth, true)
    text(it.quantity.toString(), colQty, 12, { align: 'right' })
    text(money(it.price), colRate, 12, { align: 'right' })
    text(money(it.amount), colAmt, 12, { bold: true, align: 'right' })
    nameLines.forEach((l, i) => { text(l, M, 12, { bold: true }); if (i < nameLines.length - 1) y += 15 })
    if (it.unit) { y += 14; text(it.unit, M, 10, { color: GREY }) }
    y += 10
    rule(LINE)
  }

  // --- total
  y += 26
  text('Total', M, 15, { bold: true })
  text(d.totalText, W - M, 17, { bold: true, color: GREEN, align: 'right' })
  y += 18
  text('Payment: Cash on Delivery', M, 11, { color: GREY })

  if (d.notes) {
    y += 28
    text('NOTES', M, 10, { bold: true, color: GREY }); y += 16
    for (const l of wrap(d.notes, 12, W - 2 * M)) { text(l, M, 12); y += 16 }
    y -= 16
  }

  // --- footer
  y += 40
  text(`Thank you for shopping with ${d.shopName || 'us'}!`, W / 2, 12, { bold: true, align: 'center' })
  y += 16
  text('This is a computer-generated slip.', W / 2, 10, { color: GREY, align: 'center' })
  y += M
  return y
}

// Returns a canvas with the slip drawn on it, plus its size in points.
export function renderSlip(d, makeCanvas = () => document.createElement('canvas')) {
  const probe = makeCanvas(W, 100)
  const height = Math.max(842, Math.ceil(paint(probe.getContext('2d'), d, true)))   // at least one A4 page
  const canvas = makeCanvas(W * SCALE, height * SCALE)
  canvas.width = W * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, height)
  paint(ctx, d, false)
  return { canvas, width: W, height }
}

// Builds the PDF and saves it to the customer's device.
export async function downloadOrderSlip(order, shop) {
  if (!canDownloadSlip(order)) throw new Error('The slip is available once the shop confirms your order.')
  const d = slipData(order, shop)
  const { canvas, width, height } = renderSlip(d)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'pt', format: [width, height], compress: true })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, width, height)
  pdf.save(`order-${d.shortId}.pdf`)
}
