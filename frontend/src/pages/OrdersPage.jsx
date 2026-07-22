import React, { useEffect, useState } from 'react'
import { orderAPI } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Eye, XCircle, FileText, Printer, Loader2, Calendar } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Consolidated Bill states
  const [showConsolidated, setShowConsolidated] = useState(false)
  const [consolidatedData, setConsolidatedData] = useState(null)
  const [consolidatedLoading, setConsolidatedLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll({ page, size: 10 })
      const d = res.data.data
      setOrders(d.content)
      setPagination({ page: d.page, totalPages: d.totalPages, last: d.last })
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  const fetchConsolidated = async (dateStr) => {
    setConsolidatedLoading(true)
    setShowConsolidated(true)
    setConsolidatedData(null)
    try {
      const res = await orderAPI.getConsolidated(dateStr || selectedDate)
      setConsolidatedData(res.data.data)
    } catch {
      toast.error('Failed to load consolidated bill')
      setShowConsolidated(false)
    } finally {
      setConsolidatedLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try { await orderAPI.cancel(id); toast.success('Order cancelled'); fetchOrders() } catch { toast.error('Failed') }
  }

  // Open print in a new window with dedicated print HTML
  const handlePrint = () => {
    if (!consolidatedData) return

    const dateLabel = consolidatedData.date
      ? new Date(consolidatedData.date + 'T00:00:00').toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
      : new Date().toLocaleDateString('en-IN')

    const itemsHTML = (consolidatedData.items || []).length > 0
      ? consolidatedData.items.map((item, i) => `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;">${item.productName}</td>
            <td style="padding:10px 12px;text-align:right;">₹${Number(item.price).toLocaleString('en-IN')}</td>
            <td style="padding:10px 12px;text-align:center;font-weight:600;">${item.totalQuantity}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;">₹${Number(item.subtotal).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="padding:20px;text-align:center;color:#9ca3af;">No items sold on this date.</td></tr>`

    const paymentHTML = Object.entries(consolidatedData.paymentMethodBreakdown || {}).map(([method, amt]) => `
      <span style="display:inline-block;padding:4px 12px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;font-weight:600;margin:3px;">
        ${method}: <strong>₹${Number(amt).toLocaleString('en-IN')}</strong>
      </span>
    `).join('') || '<span style="color:#9ca3af;font-size:12px;">No payment data</span>'

    const orderNumsHTML = (consolidatedData.orderNumbers || []).slice(0, 50).map(n =>
      `<span style="font-family:monospace;font-size:10px;background:#f1f5f9;border:1px solid #e2e8f0;padding:2px 6px;border-radius:4px;margin:2px;display:inline-block;">${n}</span>`
    ).join('') + (consolidatedData.orderNumbers?.length > 50 ? `<span style="font-size:11px;color:#6b7280;"> ...and ${consolidatedData.orderNumbers.length - 50} more</span>` : '')

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Consolidated Bill - ${dateLabel}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: white; padding: 32px; font-size: 13px; }
          h1 { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
          .subtitle { font-size: 11px; color: #9ca3af; margin-top: 2px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
          .date-label { font-size: 13px; color: #374151; }
          .date-value { font-weight: 700; color: #1e293b; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .stat-card { padding: 14px; border-radius: 10px; border: 1px solid #e5e7eb; }
          .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .stat-value { font-size: 22px; font-weight: 800; margin-top: 4px; }
          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          thead { background: #f8fafc; }
          th { text-align: left; padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
          th.right { text-align: right; }
          th.center { text-align: center; }
          tfoot td { padding: 8px 12px; font-size: 13px; }
          .grand-total { font-size: 16px; font-weight: 800; color: #4f46e5; border-top: 2px double #d1d5db; }
          .divider { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
          @media print {
            body { padding: 16px; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>RICE BILLING SYSTEM</h1>
            <div class="subtitle">Consolidated Summary Invoice</div>
          </div>
          <div style="text-align:right;">
            <div class="date-label">Date:</div>
            <div class="date-value">${dateLabel}</div>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card" style="background:#eef2ff;border-color:#c7d2fe;">
            <div class="stat-label" style="color:#4338ca;">Total Bills</div>
            <div class="stat-value" style="color:#1e1b4b;">${consolidatedData.totalOrders}</div>
          </div>
          <div class="stat-card" style="background:#f8fafc;border-color:#e2e8f0;">
            <div class="stat-label" style="color:#64748b;">Gross Subtotal</div>
            <div class="stat-value" style="color:#0f172a;">₹${Number(consolidatedData.subtotal).toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-card" style="background:#fff1f2;border-color:#fecdd3;">
            <div class="stat-label" style="color:#be123c;">Total Discounts</div>
            <div class="stat-value" style="color:#881337;">₹${Number(consolidatedData.discount).toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-card" style="background:#f0fdf4;border-color:#bbf7d0;">
            <div class="stat-label" style="color:#15803d;">Net Revenue</div>
            <div class="stat-value" style="color:#14532d;">₹${Number(consolidatedData.grandTotal).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section-title">Collections by Payment Mode</div>
        <div style="margin-bottom:20px;">${paymentHTML}</div>

        <hr class="divider">

        <div class="section-title">Consolidated Sales Item Breakdown</div>
        <table style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:8px;">
          <thead>
            <tr>
              <th>Product Name</th>
              <th class="right">Rate / Price</th>
              <th class="center">Qty Sold</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;color:#6b7280;">Subtotal:</td>
              <td style="text-align:right;font-weight:700;">₹${Number(consolidatedData.subtotal).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;color:#6b7280;">Tax (GST):</td>
              <td style="text-align:right;font-weight:700;">₹${Number(consolidatedData.tax).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;color:#6b7280;">Discount:</td>
              <td style="text-align:right;font-weight:700;color:#dc2626;">-₹${Number(consolidatedData.discount).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="grand-total">
              <td colspan="3" style="text-align:right;">Grand Total:</td>
              <td style="text-align:right;">₹${Number(consolidatedData.grandTotal).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        ${(consolidatedData.orderNumbers || []).length > 0 ? `
        <hr class="divider">
        <div class="section-title">Included Invoices (${consolidatedData.orderNumbers.length})</div>
        <div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e5e7eb;">${orderNumsHTML}</div>
        ` : ''}

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `

    const printWin = window.open('', '_blank', 'width=900,height=700')
    printWin.document.write(html)
    printWin.document.close()
  }

  const columns = [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'customerName', label: 'Customer' },
    { key: 'grandTotal', label: 'Total', render: v => `₹${Number(v).toLocaleString('en-IN')}` },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'status', label: 'Status', render: v => <span className={v === 'COMPLETED' ? 'badge-success' : 'badge-danger'}>{v}</span> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleString('en-IN') },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => setSelectedOrder(row)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"><Eye className="w-4 h-4" /></button>
        {row.status === 'COMPLETED' && (
          <button onClick={() => handleCancel(row.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><XCircle className="w-4 h-4" /></button>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">View and manage all orders</p>
        </div>
        <button
          onClick={() => fetchConsolidated(selectedDate)}
          className="btn-primary"
        >
          <FileText className="w-4 h-4" />
          Today's Consolidated Bill
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={orders} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Single Order View Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order: ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Customer:</span><p className="font-medium">{selectedOrder.customerName}</p></div>
              <div><span className="text-gray-500">Payment:</span><p className="font-medium">{selectedOrder.paymentMethod}</p></div>
              <div><span className="text-gray-500">Status:</span><p><span className={selectedOrder.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}>{selectedOrder.status}</span></p></div>
              <div><span className="text-gray-500">Date:</span><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
            </div>
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-50"><tr>{['Product','Qty','Price','Subtotal'].map(h => <th key={h} className="text-left p-3 font-medium text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {selectedOrder.orderItems?.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3">{item.productName}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">₹{Number(item.price).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-medium">₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{Number(selectedOrder.tax).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Grand Total</span><span>₹{Number(selectedOrder.grandTotal).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Today's Consolidated Bill Modal */}
      <Modal
        isOpen={showConsolidated}
        onClose={() => setShowConsolidated(false)}
        title="Consolidated Sales Invoice"
        size="xl"
      >
        {/* Date picker + print button row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100 no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-600">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                fetchConsolidated(e.target.value)
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            onClick={handlePrint}
            disabled={!consolidatedData || consolidatedLoading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Download Bill
          </button>
        </div>

        {consolidatedLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 text-[#5c6bc0] animate-spin" />
            <p className="text-gray-500 text-sm">Aggregating sales data...</p>
          </div>
        ) : consolidatedData ? (
          <div id="print-consolidated-bill" className="space-y-5">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">RICE BILLING SYSTEM</h2>
                <p className="text-xs text-gray-400 mt-0.5">Consolidated Summary Invoice</p>
              </div>
              <div className="text-right text-sm">
                <span className="text-gray-500">Date: </span>
                <span className="font-semibold text-gray-800">
                  {consolidatedData.date
                    ? new Date(consolidatedData.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5c6bc0]">Total Bills</span>
                <p className="text-2xl font-extrabold text-indigo-900 mt-1">{consolidatedData.totalOrders}</p>
              </div>
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Gross Subtotal</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">₹{Number(consolidatedData.subtotal).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Total Discounts</span>
                <p className="text-2xl font-extrabold text-rose-900 mt-1">₹{Number(consolidatedData.discount).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Net Revenue</span>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">₹{Number(consolidatedData.grandTotal).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Payment Mode Chips */}
            {Object.keys(consolidatedData.paymentMethodBreakdown || {}).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">Collections by Payment Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(consolidatedData.paymentMethodBreakdown).map(([method, amt]) => {
                    let chipColors = 'bg-gray-50 text-gray-800 border-gray-200'
                    if (method === 'CASH') chipColors = 'bg-amber-50 text-amber-800 border-amber-200'
                    else if (method === 'UPI') chipColors = 'bg-sky-50 text-sky-800 border-sky-200'
                    else if (method === 'CARD') chipColors = 'bg-purple-50 text-purple-800 border-purple-200'
                    return (
                      <span key={method} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${chipColors}`}>
                        {method}: <span className="font-bold">₹{Number(amt).toLocaleString('en-IN')}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">Consolidated Sales Item Breakdown</h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider">Product Name</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider">Rate / Price</th>
                      <th className="text-center p-3 font-semibold text-xs uppercase tracking-wider">Qty Sold</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {consolidatedData.items && consolidatedData.items.length > 0 ? (
                      consolidatedData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-medium text-gray-900">{item.productName}</td>
                          <td className="p-3 text-right">₹{Number(item.price).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center font-semibold text-slate-600">{item.totalQuantity}</td>
                          <td className="p-3 text-right font-bold text-gray-900">₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-400 font-medium">
                          No items sold on this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50/50 font-bold border-t border-gray-100">
                    <tr>
                      <td colSpan={3} className="p-3 text-gray-500 text-right">Subtotal:</td>
                      <td className="p-3 text-right text-gray-900">₹{Number(consolidatedData.subtotal).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-3 text-gray-500 text-right">Tax (GST):</td>
                      <td className="p-3 text-right text-gray-900">₹{Number(consolidatedData.tax).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-3 text-gray-500 text-right">Discount:</td>
                      <td className="p-3 text-right text-red-600">-₹{Number(consolidatedData.discount).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="border-t border-double border-gray-300 text-base bg-indigo-50/30">
                      <td colSpan={3} className="p-3 text-indigo-950 text-right">Grand Total:</td>
                      <td className="p-3 text-right text-[#5c6bc0] font-extrabold text-lg">₹{Number(consolidatedData.grandTotal).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Numbers */}
            {consolidatedData.orderNumbers && consolidatedData.orderNumbers.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Consolidated Invoices ({consolidatedData.orderNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                  {consolidatedData.orderNumbers.map((num, i) => (
                    <span key={i} className="text-[10px] font-mono bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p>No data available.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
