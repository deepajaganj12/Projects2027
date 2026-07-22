import React, { useEffect, useState } from 'react'
import { dashboardAPI } from '../services/api'
import StatCard from '../components/StatCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { IndianRupee, ShoppingBag, Package, Users, AlertTriangle, TrendingUp, ChevronRight, ShoppingCart, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    dashboardAPI.getData()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
    </div>
  )

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      {/* Brand Header Banner in Violet-Blue to match the screenshot style */}
      <div className="bg-[#5c6bc0] text-white rounded-2xl p-6 shadow-lg flex items-center gap-4 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">JJ Traders Rice Billing</h1>
          <p className="text-indigo-100 text-xs mt-0.5">POS Billing · பில்லிங் சிஸ்டம்</p>
        </div>
      </div>

      {/* Stat Cards Row matching colors from the screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Today's Sales" value={formatCurrency(data?.todayRevenue)} icon={IndianRupee} color="green" />
        <StatCard title="Low Stock" value={`${data?.lowStockCount || 0} items`} icon={AlertTriangle} color="orange" />
        <StatCard title="Total Revenue" value={formatCurrency(data?.monthlyRevenue)} icon={TrendingUp} color="indigo" />
        <StatCard title="Total Stock" value={data?.totalProducts || 0} icon={Package} color="gray" />
        <StatCard title="Total Orders" value={data?.totalOrders || 0} icon={ShoppingBag} color="blue" />
        <StatCard title="Customers" value={data?.totalCustomers || 0} icon={Users} color="purple" />
      </div>

      {/* Quick Actions matching the screenshot */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-base">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/pos')}
            className="bg-[#5c6bc0] text-white rounded-xl p-4 flex items-center justify-between hover:bg-[#4c5cb0] transition-all shadow-sm group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">New Bill</p>
                <p className="text-xs text-indigo-100 mt-0.5">புதிய பில்</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="bg-orange-50 border border-orange-100 text-orange-800 rounded-xl p-4 flex items-center justify-between hover:bg-orange-100/70 transition-all shadow-sm group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-orange-900">Check Low Stock</p>
                <p className="text-xs text-orange-600 mt-0.5">{data?.lowStockCount || 0} items need reorder</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-600 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueChart || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5c6bc0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5c6bc0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#5c6bc0" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Orders (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.revenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {(data?.recentOrders || []).slice(0, 6).map((o, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-mono font-bold text-gray-800">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.customer} · {o.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{Number(o.total).toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>{o.status === 'COMPLETED' ? 'CASH · PAID' : o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {(data?.lowStockProducts || []).length === 0 ? (
              <p className="text-gray-400 text-sm">All products are well stocked!</p>
            ) : (
              (data?.lowStockProducts || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Minimum Required Stock: {p.minimumStock}</p>
                  </div>
                  <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold">{p.stock} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
