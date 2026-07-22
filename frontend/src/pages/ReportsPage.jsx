import React, { useEffect, useState, useCallback } from 'react'
import { orderAPI, dashboardAPI } from '../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Calendar, Download, TrendingUp, ShoppingBag, Users, IndianRupee,
  Filter, RefreshCw, FileText, BarChart2, Package, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── Constants ─────────────────────────────────────────────── */
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (s) => new Date(s).toLocaleDateString('en-IN')
const isoDate = (d) => d.toISOString().slice(0, 10)

/* quick date-range helpers */
const rangeOf = (mode) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (mode === 'today') {
    const s = new Date(); s.setHours(0, 0, 0, 0)
    return { from: isoDate(s), to: isoDate(today) }
  }
  if (mode === 'week') {
    const s = new Date(); s.setDate(today.getDate() - 6); s.setHours(0, 0, 0, 0)
    return { from: isoDate(s), to: isoDate(today) }
  }
  if (mode === 'month') {
    const s = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: isoDate(s), to: isoDate(today) }
  }
  if (mode === 'lastmonth') {
    const s = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const e = new Date(today.getFullYear(), today.getMonth(), 0)
    return { from: isoDate(s), to: isoDate(e) }
  }
  return { from: '', to: '' }
}

/* ─── StatCard ──────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

/* ─── Section Header ────────────────────────────────────────── */
const SectionTitle = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 text-indigo-600" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════ */
export default function ReportsPage() {
  /* filter state */
  const [mode, setMode]       = useState('week')   // today | week | month | lastmonth | custom
  const [from, setFrom]       = useState(rangeOf('week').from)
  const [to,   setTo]         = useState(rangeOf('week').to)
  const [activeTab, setActiveTab] = useState('overview') // overview | products | customers

  /* data state */
  const [orders,    setOrders]    = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [downloading, setDownloading] = useState(false)

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordRes, dashRes] = await Promise.all([
        orderAPI.getAll({ size: 5000 }),
        dashboardAPI.getData(),
      ])
      setOrders(ordRes.data.data?.content || [])
      setDashboard(dashRes.data.data)
    } catch {
      toast.error('Failed to load report data')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── apply quick-mode ── */
  const applyMode = (m) => {
    setMode(m)
    if (m !== 'custom') {
      const r = rangeOf(m)
      setFrom(r.from); setTo(r.to)
    }
  }

  /* ── derived: filtered orders ── */
  const filteredOrders = orders.filter(o => {
    if (!from && !to) return true
    const d = o.createdAt?.slice(0, 10)
    if (from && d < from) return false
    if (to   && d > to)   return false
    return true
  })

  /* ── derived: summary stats ── */
  const totalRevenue  = filteredOrders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.grandTotal || 0), 0)
  const totalOrders   = filteredOrders.length
  const completedOrders = filteredOrders.filter(o => o.status === 'COMPLETED').length
  const avgOrderValue = completedOrders ? (totalRevenue / completedOrders) : 0

  /* ── derived: revenue chart (day-by-day) ── */
  const buildDayMap = () => {
    const map = {}
    filteredOrders.forEach(o => {
      const day = o.createdAt?.slice(0, 10) || 'Unknown'
      if (!map[day]) map[day] = { date: day, revenue: 0, orders: 0 }
      if (o.status === 'COMPLETED') map[day].revenue += Number(o.grandTotal || 0)
      map[day].orders++
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }
  const revenueChart = buildDayMap()

  /* ── derived: top selling products ── */
  const productMap = {}
  filteredOrders.forEach(o => {
    if (o.status !== 'COMPLETED') return
    ;(o.orderItems || []).forEach(item => {
      const name = item.productName || 'Unknown'
      if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0, orders: 0 }
      productMap[name].qty     += item.quantity || 0
      productMap[name].revenue += Number(item.subtotal || 0)
      productMap[name].orders  += 1
    })
  })
  const topProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty)

  /* ── derived: top customers ── */
  const custMap = {}
  filteredOrders.forEach(o => {
    if (o.status !== 'COMPLETED') return
    const name = o.customerName || 'Walk-in Customer'
    if (!custMap[name]) custMap[name] = { name, spend: 0, orders: 0 }
    custMap[name].spend  += Number(o.grandTotal || 0)
    custMap[name].orders += 1
  })
  const topCustomers = Object.values(custMap).sort((a, b) => b.spend - a.spend)

  /* ── CSV download ── */
  const downloadCSV = (type) => {
    setDownloading(true)
    try {
      let rows = [], filename = ''

      if (type === 'orders') {
        filename = `orders_${from}_to_${to}.csv`
        rows = [
          ['Order #', 'Date', 'Customer', 'Payment', 'Subtotal', 'Tax', 'Discount', 'Grand Total', 'Status'],
          ...filteredOrders.map(o => [
            o.orderNumber, fmtDate(o.createdAt), o.customerName || 'Walk-in',
            o.paymentMethod, o.subtotal, o.tax, o.discount, o.grandTotal, o.status
          ])
        ]
      } else if (type === 'products') {
        filename = `top_products_${from}_to_${to}.csv`
        rows = [
          ['Product Name', 'Qty Sold', 'Revenue (₹)', 'No. of Orders'],
          ...topProducts.map(p => [p.name, p.qty, p.revenue.toFixed(2), p.orders])
        ]
      } else if (type === 'customers') {
        filename = `top_customers_${from}_to_${to}.csv`
        rows = [
          ['Customer Name', 'Total Spend (₹)', 'No. of Orders', 'Avg Order (₹)'],
          ...topCustomers.map(c => [c.name, c.spend.toFixed(2), c.orders, (c.spend / c.orders).toFixed(2)])
        ]
      }

      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
      toast.success(`${filename} downloaded!`)
    } catch { toast.error('Download failed') }
    finally { setDownloading(false) }
  }

  /* ─── render ─── */
  const QUICK_MODES = [
    { key: 'today',     label: 'Today' },
    { key: 'week',      label: 'This Week' },
    { key: 'month',     label: 'This Month' },
    { key: 'lastmonth', label: 'Last Month' },
    { key: 'custom',    label: 'Custom' },
  ]

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Detailed business insights with date-wise filtering</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-700">Date Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick mode pills */}
          {QUICK_MODES.map(m => (
            <button key={m.key} onClick={() => applyMode(m.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                mode === m.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
              }`}>
              {m.label}
            </button>
          ))}

          {/* Custom date pickers */}
          {mode === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                From
              </div>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          )}

          {/* Range label */}
          <span className="ml-auto text-xs text-gray-400 font-medium">
            {from && to ? `${fmtDate(from + 'T00:00:00')} — ${fmtDate(to + 'T00:00:00')}` : 'All time'}
          </span>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={IndianRupee} label="Total Revenue"    value={fmtINR(totalRevenue)}  color="bg-indigo-600" sub={`${completedOrders} completed`} />
            <StatCard icon={ShoppingBag} label="Total Orders"    value={totalOrders}             color="bg-purple-500" sub={`${totalOrders - completedOrders} pending/cancelled`} />
            <StatCard icon={TrendingUp}  label="Avg Order Value" value={fmtINR(avgOrderValue)}  color="bg-cyan-500"   sub="Per completed order" />
            <StatCard icon={Users}       label="Unique Customers" value={Object.keys(custMap).length} color="bg-emerald-500" sub="In selected period" />
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'overview',   label: 'Overview',         icon: BarChart2  },
              { key: 'products',   label: 'Product Sales',    icon: Package    },
              { key: 'customers',  label: 'Customer Spend',   icon: Users      },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ════════════ OVERVIEW TAB ════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={TrendingUp} title="Revenue Trend" sub="Day-by-day in selected period" />
                  <button onClick={() => downloadCSV('orders')} disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50">
                    <Download className="w-3.5 h-3.5" />
                    Download Orders CSV
                  </button>
                </div>
                {revenueChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={revenueChart}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={v => [fmtINR(v), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-16">No revenue data for this period</p>
                )}
              </div>

              {/* Orders & Revenue Bar Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <SectionTitle icon={BarChart2} title="Daily Orders vs Revenue" sub="Volume comparison" />
                {revenueChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="l" dataKey="orders"  name="Orders"      fill="#818cf8" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="r" dataKey="revenue" name="Revenue (₹)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-16">No data for this period</p>
                )}
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={FileText} title="Orders in Period" sub={`${filteredOrders.length} orders`} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Order #', 'Date', 'Customer', 'Payment', 'Grand Total', 'Status'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.slice(0, 50).map(o => (
                        <tr key={o.id} className="hover:bg-gray-50 transition">
                          <td className="py-2.5 pr-4 font-mono text-xs text-indigo-600 font-semibold">{o.orderNumber}</td>
                          <td className="py-2.5 pr-4 text-xs text-gray-600">{fmtDate(o.createdAt)}</td>
                          <td className="py-2.5 pr-4 text-xs text-gray-800">{o.customerName || 'Walk-in'}</td>
                          <td className="py-2.5 pr-4">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{o.paymentMethod}</span>
                          </td>
                          <td className="py-2.5 pr-4 text-xs font-bold text-gray-900">{fmtINR(o.grandTotal)}</td>
                          <td className="py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length > 50 && (
                    <p className="text-center text-xs text-gray-400 mt-3">Showing first 50 of {filteredOrders.length} orders. Download CSV for full data.</p>
                  )}
                  {filteredOrders.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">No orders in this period</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ PRODUCTS TAB ════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <SectionTitle icon={Package} title="Top Products by Quantity" sub="Pie chart view" />
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={topProducts.slice(0, 7)} dataKey="qty" nameKey="name"
                          cx="50%" cy="50%" outerRadius={90}
                          label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}>
                          {topProducts.slice(0, 7).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v, name) => [v, 'Qty']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-gray-400 text-sm text-center py-20">No product sales data</p>}
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <SectionTitle icon={BarChart2} title="Top Products by Revenue" sub="Bar chart view" />
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90}
                          tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                        <Tooltip formatter={v => [fmtINR(v), 'Revenue']} />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {topProducts.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-gray-400 text-sm text-center py-20">No revenue data</p>}
                </div>
              </div>

              {/* Full products table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={Package} title="All Products Sales Breakdown" sub={`${topProducts.length} products`} />
                  <button onClick={() => downloadCSV('products')} disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50">
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">#</th>
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Product Name</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-4">Qty Sold</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-4">Revenue</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts.map((p, i) => (
                        <tr key={p.name} className="hover:bg-gray-50 transition">
                          <td className="py-2.5 pr-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-gray-100 text-gray-600' :
                              i === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-indigo-50 text-indigo-400'
                            }`}>{i + 1}</span>
                          </td>
                          <td className="py-2.5 pr-4 font-medium text-gray-800 text-xs">{p.name}</td>
                          <td className="py-2.5 pr-4 text-right">
                            <span className="text-xs font-bold text-indigo-600">{p.qty}</span>
                          </td>
                          <td className="py-2.5 pr-4 text-right text-xs font-semibold text-gray-900">{fmtINR(p.revenue)}</td>
                          <td className="py-2.5 text-right text-xs text-gray-500">{p.orders}</td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-gray-400 text-sm py-8">No product sales in this period</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ CUSTOMERS TAB ════════════ */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Top customers bar chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <SectionTitle icon={Users} title="Top Customers by Total Spend" sub="Bar chart view" />
                {topCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topCustomers.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110}
                        tickFormatter={v => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                      <Tooltip formatter={v => [fmtINR(v), 'Total Spend']} />
                      <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                        {topCustomers.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center py-20">No customer data</p>}
              </div>

              {/* Customer table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={Users} title="Customer Purchase Summary" sub={`${topCustomers.length} customers`} />
                  <button onClick={() => downloadCSV('customers')} disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50">
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">#</th>
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Customer</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-4">Total Spend</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-4">Orders</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topCustomers.map((c, i) => (
                        <tr key={c.name} className="hover:bg-gray-50 transition">
                          <td className="py-2.5 pr-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-gray-100 text-gray-600' :
                              i === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-indigo-50 text-indigo-400'
                            }`}>{i + 1}</span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 text-xs font-bold">{c.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-right text-xs font-bold text-gray-900">{fmtINR(c.spend)}</td>
                          <td className="py-2.5 pr-4 text-right text-xs text-indigo-600 font-semibold">{c.orders}</td>
                          <td className="py-2.5 text-right text-xs text-gray-500">{fmtINR(c.spend / c.orders)}</td>
                        </tr>
                      ))}
                      {topCustomers.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-gray-400 text-sm py-8">No customer data in this period</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
