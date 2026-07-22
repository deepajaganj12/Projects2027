import React, { useState, useEffect, useCallback } from 'react'
import { supplierAPI, purchaseAPI, productAPI } from '../services/api'
import {
  Truck, Plus, Search, X, Edit2, Trash2, ShoppingBag, CheckCircle,
  XCircle, Eye, Phone, Mail, MapPin, Building2, Hash, Package,
  ChevronDown, ChevronUp, AlertTriangle, IndianRupee, ClipboardList,
  RefreshCw, User, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── helpers ──────────────────────────────────────────────── */
const fmtINR  = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN') : '—'

const STATUS_STYLE = {
  ACTIVE:    'bg-green-100 text-green-700',
  INACTIVE:  'bg-gray-100 text-gray-500',
  PENDING:   'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

/* ─── Field ──────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, required, error, children }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />}
      <div className={Icon ? 'pl-9' : ''}>{children}</div>
    </div>
    {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-300'
  }`

/* ═══════════════════════════════════════════════════════════════ */
export default function SuppliersPage() {
  /* tabs */
  const [tab, setTab] = useState('suppliers') // 'suppliers' | 'purchases'

  /* ── SUPPLIER STATE ── */
  const [suppliers, setSuppliers]   = useState([])
  const [suppLoading, setSuppLoad]  = useState(true)
  const [suppSearch, setSuppSearch] = useState('')
  const [showSuppForm, setShowSuppForm] = useState(false)
  const [editSupp, setEditSupp]     = useState(null)
  const [suppForm, setSuppForm]     = useState({ name:'', contactPerson:'', phone:'', email:'', address:'', gstin:'', company:'', status:'ACTIVE' })
  const [suppErrors, setSuppErrors] = useState({})
  const [savingSupp, setSavingSupp] = useState(false)
  const [deletingSupp, setDeletingSupp] = useState(null)

  /* ── PURCHASE STATE ── */
  const [purchases, setPurchases]   = useState([])
  const [purLoading, setPurLoad]    = useState(true)
  const [showPurForm, setShowPurForm] = useState(false)
  const [purForm, setPurForm]       = useState({ supplierId:'', invoiceNumber:'', purchaseDate:'', notes:'', items:[] })
  const [purErrors, setPurErrors]   = useState({})
  const [savingPur, setSavingPur]   = useState(false)
  const [products, setProducts]     = useState([])
  const [expandedPur, setExpandedPur] = useState(null)
  const [approvingId, setApprovingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmApprove, setConfirmApprove] = useState(null) // purchase to confirm

  /* ── load data ── */
  const loadSuppliers = useCallback(async () => {
    setSuppLoad(true)
    try {
      const r = await supplierAPI.getAll({ size: 200 })
      setSuppliers(r.data.data?.content || r.data.data || [])
    } catch { toast.error('Failed to load suppliers') }
    finally { setSuppLoad(false) }
  }, [])

  const loadPurchases = useCallback(async () => {
    setPurLoad(true)
    try {
      const r = await purchaseAPI.getAll({ size: 200 })
      setPurchases(r.data.data?.content || r.data.data || [])
    } catch { toast.error('Failed to load purchases') }
    finally { setPurLoad(false) }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const r = await productAPI.getAll({ size: 2000 })
      setProducts(r.data.data?.content || r.data.data || [])
    } catch {}
  }, [])

  useEffect(() => { loadSuppliers(); loadPurchases(); loadProducts() }, [])

  /* ── filtered suppliers ── */
  const filteredSuppliers = suppliers.filter(s =>
    !suppSearch || [s.name, s.phone, s.company, s.email].some(v => v?.toLowerCase().includes(suppSearch.toLowerCase()))
  )

  /* ── SUPPLIER FORM ── */
  const openNewSupplier = () => {
    setEditSupp(null)
    setSuppForm({ name:'', contactPerson:'', phone:'', email:'', address:'', gstin:'', company:'', status:'ACTIVE' })
    setSuppErrors({})
    setShowSuppForm(true)
  }
  const openEditSupplier = (s) => {
    setEditSupp(s)
    setSuppForm({ name:s.name, contactPerson:s.contactPerson||'', phone:s.phone||'', email:s.email||'', address:s.address||'', gstin:s.gstin||'', company:s.company||'', status:s.status||'ACTIVE' })
    setSuppErrors({})
    setShowSuppForm(true)
  }
  const validateSupp = () => {
    const e = {}
    if (!suppForm.name.trim())  e.name  = 'Name is required'
    if (!suppForm.phone.trim()) e.phone = 'Phone is required'
    setSuppErrors(e)
    return !Object.keys(e).length
  }
  const saveSupplier = async () => {
    if (!validateSupp()) return
    setSavingSupp(true)
    try {
      if (editSupp) {
        await supplierAPI.update(editSupp.id, suppForm)
        toast.success('Supplier updated!')
      } else {
        await supplierAPI.create(suppForm)
        toast.success('Supplier added!')
      }
      setShowSuppForm(false)
      loadSuppliers()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSavingSupp(false) }
  }
  const deleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier?')) return
    setDeletingSupp(id)
    try { await supplierAPI.delete(id); toast.success('Deleted'); loadSuppliers() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeletingSupp(null) }
  }

  /* ── PURCHASE FORM ── */
  const openNewPurchase = () => {
    setPurForm({ supplierId:'', invoiceNumber:'', purchaseDate: new Date().toISOString().slice(0,10), notes:'', items:[{ productId:'', quantity:1, unitCost:'' }] })
    setPurErrors({})
    setShowPurForm(true)
  }
  const addPurchaseItem = () =>
    setPurForm(f => ({ ...f, items: [...f.items, { productId:'', quantity:1, unitCost:'' }] }))
  const removePurchaseItem = (i) =>
    setPurForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updatePurchaseItem = (i, key, val) =>
    setPurForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it) }))

  // Auto-fill unit cost from product's purchase price
  const handleProductSelect = (i, productId) => {
    const prod = products.find(p => String(p.id) === String(productId))
    updatePurchaseItem(i, 'productId', productId)
    if (prod?.purchasePrice) updatePurchaseItem(i, 'unitCost', prod.purchasePrice)
  }

  const purTotal = purForm.items.reduce((s, it) => {
    const qty = Number(it.quantity) || 0
    const cost = Number(it.unitCost) || 0
    return s + qty * cost
  }, 0)

  const validatePurchase = () => {
    const e = {}
    if (!purForm.supplierId) e.supplierId = 'Select a supplier'
    if (!purForm.items.length) e.items = 'Add at least one product'
    purForm.items.forEach((it, i) => {
      if (!it.productId) e[`item_${i}_product`] = 'Select a product'
      if (!it.quantity || it.quantity < 1) e[`item_${i}_qty`] = 'Invalid qty'
      if (!it.unitCost || it.unitCost <= 0) e[`item_${i}_cost`] = 'Enter cost'
    })
    setPurErrors(e)
    return !Object.keys(e).length
  }
  const savePurchase = async () => {
    if (!validatePurchase()) return
    setSavingPur(true)
    try {
      await purchaseAPI.create({
        supplierId: Number(purForm.supplierId),
        invoiceNumber: purForm.invoiceNumber,
        purchaseDate: purForm.purchaseDate || null,
        notes: purForm.notes,
        items: purForm.items.map(it => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          unitCost: Number(it.unitCost),
        })),
      })
      toast.success('Purchase order created!')
      setShowPurForm(false)
      loadPurchases()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSavingPur(false) }
  }

  const approvePurchase = async (id) => {
    setApprovingId(id)
    try {
      await purchaseAPI.approve(id)
      toast.success('✅ Purchase approved! Stock & purchase price updated.')
      setConfirmApprove(null)
      loadPurchases()
    } catch (err) { toast.error(err.response?.data?.message || 'Approval failed') }
    finally { setApprovingId(null) }
  }
  const cancelPurchase = async (id) => {
    setCancellingId(id)
    try {
      await purchaseAPI.cancel(id)
      toast.success('Purchase cancelled.')
      loadPurchases()
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed') }
    finally { setCancellingId(null) }
  }

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Suppliers & Purchases
          </h1>
          <p className="text-gray-500 text-sm">Manage your vendors and track incoming stock purchases</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'suppliers'
            ? <button onClick={openNewSupplier} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                <Plus className="w-4 h-4" /> Add Supplier
              </button>
            : <button onClick={openNewPurchase} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                <Plus className="w-4 h-4" /> New Purchase Order
              </button>
          }
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key:'suppliers', label:'Suppliers', icon: Truck },
          { key:'purchases', label:'Purchase Orders', icon: ClipboardList }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.key === 'purchases' && purchases.filter(p => p.status === 'PENDING').length > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {purchases.filter(p => p.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ SUPPLIERS TAB ══════════ */}
      {tab === 'suppliers' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={suppSearch} onChange={e => setSuppSearch(e.target.value)}
              placeholder="Search by name, phone, company..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          {suppLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No suppliers yet. Add your first supplier!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSuppliers.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-indigo-700 font-bold text-base">{s.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{s.name}</p>
                        {s.company && <p className="text-xs text-gray-400">{s.company}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-500'}`}>
                      {s.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    {s.contactPerson && (
                      <div className="flex items-center gap-2 text-xs text-gray-600"><User className="w-3.5 h-3.5 text-gray-400" />{s.contactPerson}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{s.phone}</div>
                    {s.email && <div className="flex items-center gap-2 text-xs text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{s.email}</div>}
                    {s.address && <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">{s.address}</span></div>}
                    {s.gstin && <div className="flex items-center gap-2 text-xs text-gray-500"><Hash className="w-3.5 h-3.5 text-gray-400" />GSTIN: {s.gstin}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-3">
                    <button onClick={() => { openEditSupplier(s) }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                      <Edit2 className="w-3.5 h-3.5" />Edit
                    </button>
                    <button onClick={() => deleteSupplier(s.id)} disabled={deletingSupp === s.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 border border-red-100 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />{deletingSupp === s.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ PURCHASES TAB ══════════ */}
      {tab === 'purchases' && (
        <div className="space-y-4">
          {purLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No purchase orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Row header */}
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedPur(expandedPur === p.id ? null : p.id)}>
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-600">{p.purchaseNumber}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{p.supplierName} {p.supplierCompany ? `— ${p.supplierCompany}` : ''}</p>
                      <p className="text-xs text-gray-400">{fmtDate(p.purchaseDate)} · {p.items?.length || 0} items</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">{fmtINR(p.totalAmount)}</p>
                    </div>
                    {expandedPur === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  {/* Expanded details */}
                  {expandedPur === p.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                      {/* Meta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><p className="text-gray-400">Invoice #</p><p className="font-medium">{p.invoiceNumber || '—'}</p></div>
                        <div><p className="text-gray-400">Purchase Date</p><p className="font-medium">{fmtDate(p.purchaseDate)}</p></div>
                        <div><p className="text-gray-400">Supplier Phone</p><p className="font-medium">{p.supplierPhone || '—'}</p></div>
                        <div><p className="text-gray-400">Notes</p><p className="font-medium">{p.notes || '—'}</p></div>
                      </div>

                      {/* Items table */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Products Purchased</p>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                {['Product', 'Category', 'Qty', 'Unit Cost', 'Total'].map(h => (
                                  <th key={h} className="text-left px-3 py-2 text-gray-500 font-semibold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {(p.items || []).map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-800">{item.productName}</td>
                                  <td className="px-3 py-2 text-gray-500">{item.categoryName || '—'}</td>
                                  <td className="px-3 py-2 font-bold text-indigo-600">{item.quantity}</td>
                                  <td className="px-3 py-2">{fmtINR(item.unitCost)}</td>
                                  <td className="px-3 py-2 font-semibold">{fmtINR(item.totalCost)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-indigo-50">
                              <tr>
                                <td colSpan={4} className="px-3 py-2 text-right text-xs font-bold text-indigo-700">Grand Total</td>
                                <td className="px-3 py-2 text-xs font-bold text-indigo-700">{fmtINR(p.totalAmount)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Actions for PENDING */}
                      {p.status === 'PENDING' && (
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => setConfirmApprove(p)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition">
                            <CheckCircle className="w-4 h-4" /> Approve & Update Stock
                          </button>
                          <button onClick={() => cancelPurchase(p.id)} disabled={cancellingId === p.id}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50">
                            <XCircle className="w-4 h-4" />{cancellingId === p.id ? 'Cancelling…' : 'Cancel Order'}
                          </button>
                        </div>
                      )}
                      {p.status === 'APPROVED' && (
                        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Stock has been added to products and purchase prices updated.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ SUPPLIER FORM MODAL ══════ */}
      {showSuppForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editSupp ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the seller / vendor details</p>
              </div>
              <button onClick={() => setShowSuppForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Supplier / Seller Name" icon={Truck} required error={suppErrors.name}>
                    <input value={suppForm.name} onChange={e => { setSuppForm(f=>({...f,name:e.target.value})); setSuppErrors(e2=>({...e2,name:''})) }}
                      placeholder="e.g. Sri Murugan Traders" className={inputCls(suppErrors.name)} />
                  </Field>
                </div>
                <Field label="Company / Business Name" icon={Building2} error={null}>
                  <input value={suppForm.company} onChange={e => setSuppForm(f=>({...f,company:e.target.value}))}
                    placeholder="Business name" className={inputCls(null)} />
                </Field>
                <Field label="Contact Person" icon={User} error={null}>
                  <input value={suppForm.contactPerson} onChange={e => setSuppForm(f=>({...f,contactPerson:e.target.value}))}
                    placeholder="Person name" className={inputCls(null)} />
                </Field>
                <Field label="Phone" icon={Phone} required error={suppErrors.phone}>
                  <input value={suppForm.phone} onChange={e => { setSuppForm(f=>({...f,phone:e.target.value})); setSuppErrors(e2=>({...e2,phone:''})) }}
                    placeholder="Mobile number" className={inputCls(suppErrors.phone)} />
                </Field>
                <Field label="Email" icon={Mail} error={null}>
                  <input type="email" value={suppForm.email} onChange={e => setSuppForm(f=>({...f,email:e.target.value}))}
                    placeholder="email@example.com" className={inputCls(null)} />
                </Field>
                <div className="col-span-2">
                  <Field label="Address" icon={MapPin} error={null}>
                    <input value={suppForm.address} onChange={e => setSuppForm(f=>({...f,address:e.target.value}))}
                      placeholder="Street, City, State" className={inputCls(null)} />
                  </Field>
                </div>
                <Field label="GSTIN" icon={Hash} error={null}>
                  <input value={suppForm.gstin} onChange={e => setSuppForm(f=>({...f,gstin:e.target.value.toUpperCase()}))}
                    placeholder="15-digit GSTIN" maxLength={15} className={inputCls(null)} />
                </Field>
                <Field label="Status" icon={null} error={null}>
                  <select value={suppForm.status} onChange={e => setSuppForm(f=>({...f,status:e.target.value}))} className={inputCls(null)}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowSuppForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={saveSupplier} disabled={savingSupp}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                {savingSupp ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <Plus className="w-4 h-4"/>}
                {savingSupp ? 'Saving…' : editSupp ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ NEW PURCHASE ORDER MODAL ══════ */}
      {showPurForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Purchase Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Select supplier, add products purchased and their costs</p>
              </div>
              <button onClick={() => setShowPurForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Supplier & meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Supplier <span className="text-red-500">*</span></label>
                  <select value={purForm.supplierId} onChange={e => setPurForm(f=>({...f,supplierId:e.target.value}))}
                    className={inputCls(purErrors.supplierId)}>
                    <option value="">Select supplier…</option>
                    {suppliers.filter(s=>s.status==='ACTIVE').map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.company ? ` — ${s.company}` : ''}</option>
                    ))}
                  </select>
                  {purErrors.supplierId && <p className="text-red-500 text-[11px] mt-0.5">{purErrors.supplierId}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Invoice Number</label>
                  <input value={purForm.invoiceNumber} onChange={e => setPurForm(f=>({...f,invoiceNumber:e.target.value}))}
                    placeholder="INV-001" className={inputCls(null)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Purchase Date</label>
                  <input type="date" value={purForm.purchaseDate} onChange={e => setPurForm(f=>({...f,purchaseDate:e.target.value}))}
                    className={inputCls(null)} />
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Products Purchased <span className="text-red-500">*</span></p>
                  <button onClick={addPurchaseItem}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Header row */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit Cost (₹)</div>
                    <div className="col-span-1"></div>
                  </div>

                  {purForm.items.map((item, i) => {
                    const selProd = products.find(p => String(p.id) === String(item.productId))
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-xl">
                        {/* Product selector */}
                        <div className="col-span-12 sm:col-span-5">
                          <select value={item.productId} onChange={e => handleProductSelect(i, e.target.value)}
                            className={inputCls(purErrors[`item_${i}_product`])}>
                            <option value="">Select product…</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode || 'no barcode'})</option>)}
                          </select>
                          {purErrors[`item_${i}_product`] && <p className="text-red-500 text-[10px] mt-0.5">{purErrors[`item_${i}_product`]}</p>}
                        </div>
                        {/* Category (auto) */}
                        <div className="col-span-12 sm:col-span-2">
                          <div className="px-2 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg h-[38px] flex items-center">
                            {selProd?.categoryName || selProd?.category?.name || '—'}
                          </div>
                        </div>
                        {/* Qty */}
                        <div className="col-span-5 sm:col-span-2">
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => updatePurchaseItem(i, 'quantity', e.target.value)}
                            className={inputCls(purErrors[`item_${i}_qty`])} placeholder="Qty" />
                        </div>
                        {/* Unit cost */}
                        <div className="col-span-5 sm:col-span-2">
                          <input type="number" min="0" step="0.01" value={item.unitCost}
                            onChange={e => updatePurchaseItem(i, 'unitCost', e.target.value)}
                            className={inputCls(purErrors[`item_${i}_cost`])} placeholder="Cost" />
                        </div>
                        {/* Remove */}
                        <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                          <button onClick={() => removePurchaseItem(i)} disabled={purForm.items.length === 1}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Line total */}
                        {(Number(item.quantity) > 0 && Number(item.unitCost) > 0) && (
                          <div className="col-span-12 flex justify-end">
                            <span className="text-xs text-indigo-600 font-semibold">
                              Line total: {fmtINR(Number(item.quantity) * Number(item.unitCost))}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Grand total */}
                <div className="mt-3 flex justify-end">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 text-right">
                    <p className="text-xs text-indigo-500 font-medium">Grand Total</p>
                    <p className="text-xl font-bold text-indigo-700">{fmtINR(purTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Notes (optional)</label>
                <textarea value={purForm.notes} onChange={e => setPurForm(f=>({...f,notes:e.target.value}))}
                  rows={2} placeholder="Any additional notes about this purchase…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end bg-gray-50">
              <button onClick={() => setShowPurForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition">Cancel</button>
              <button onClick={savePurchase} disabled={savingPur}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                {savingPur ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <FileText className="w-4 h-4"/>}
                {savingPur ? 'Saving…' : 'Create Purchase Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ APPROVE CONFIRMATION MODAL ══════ */}
      {confirmApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Approve Purchase?</h3>
                <p className="text-xs text-gray-500">This will update product stock and purchase prices</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1">
              <p className="text-sm font-medium text-gray-700">Purchase: <span className="font-mono text-indigo-600">{confirmApprove.purchaseNumber}</span></p>
              <p className="text-sm text-gray-600">Supplier: {confirmApprove.supplierName}</p>
              <p className="text-sm text-gray-600">Total: <span className="font-bold text-gray-900">{fmtINR(confirmApprove.totalAmount)}</span></p>
              <p className="text-sm text-gray-600">Items: {confirmApprove.items?.length || 0} products</p>
            </div>
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4">
              ⚠️ This action will <strong>add stock quantities</strong> to each product and <strong>update their purchase prices</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmApprove(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => approvePurchase(confirmApprove.id)} disabled={approvingId === confirmApprove.id}
                className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {approvingId === confirmApprove.id ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <CheckCircle className="w-4 h-4"/>}
                {approvingId === confirmApprove.id ? 'Approving…' : 'Yes, Approve & Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
