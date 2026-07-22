import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart, updateQuantity, clearCart, setDiscount, setTaxRate } from '../redux/cartSlice'
import { productAPI, categoryAPI, customerAPI, orderAPI } from '../services/api'
import {
  Search, ShoppingCart, Trash2, Plus, Minus, Printer, CheckCircle,
  X, Tag, PackageOpen, UserPlus, User, Phone, Mail, MapPin, Filter, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                         */
/* ─────────────────────────────────────────────────────────────── */
const InputField = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white`}
      />
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────────────── */
/*  Component                                                       */
/* ─────────────────────────────────────────────────────────────── */
export default function POSPage() {
  const dispatch = useDispatch()
  const { items, discount, taxRate } = useSelector(s => s.cart)

  /* product / search state */
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState([])
  const [searching, setSearching]           = useState(false)
  const [categorizedProducts, setCategorized] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')   // ← filter

  /* cart state */
  const [customers, setCustomers]           = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentMethod, setPaymentMethod]   = useState('CASH')
  const [processing, setProcessing]         = useState(false)
  const [lastOrder, setLastOrder]           = useState(null)
  const [showReceipt, setShowReceipt]       = useState(false)

  /* new-customer form state */
  const [showNewCust, setShowNewCust]       = useState(false)
  const [savingCust, setSavingCust]         = useState(false)
  const [newCust, setNewCust]               = useState({ name: '', phone: '', email: '', address: '' })
  const [custErrors, setCustErrors]         = useState({})

  /* ── on mount ── */
  useEffect(() => {
    loadCustomers()
    loadAllProducts()
  }, [])

  const loadCustomers = () =>
    customerAPI.getAll({ size: 200 }).then(r => setCustomers(r.data.data?.content || r.data.data || []))

  /* ── fetch & group products ── */
  const loadAllProducts = async () => {
    setLoadingProducts(true)
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryAPI.getAll({ size: 200 }),
        productAPI.getAll({ size: 2000 }),
      ])
      const categories = catRes.data.data?.content || catRes.data.data || []
      const allProducts = prodRes.data.data?.content || prodRes.data.data || []

      const grouped = []
      for (const cat of categories) {
        const prods = allProducts.filter(p =>
          p.categoryId === cat.id || p.categoryName === cat.name ||
          p.category?.id === cat.id || p.category?.name === cat.name
        )
        if (prods.length > 0) grouped.push({ category: cat.name, products: prods })
      }
      const usedIds = new Set(grouped.flatMap(g => g.products.map(p => p.id)))
      const uncategorized = allProducts.filter(p => !usedIds.has(p.id))
      if (uncategorized.length > 0) grouped.push({ category: 'Uncategorized', products: uncategorized })
      setCategorized(grouped)
    } catch (e) {
      console.error('Failed to load products', e)
    } finally {
      setLoadingProducts(false)
    }
  }

  /* ── search ── */
  const searchProducts = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await productAPI.posSearch(q)
      setSearchResults(res.data.data || [])
    } catch { } finally { setSearching(false) }
  }
  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  /* ── totals ── */
  const subtotal   = items.reduce((s, i) => s + i.subtotal, 0)
  const taxAmount  = (subtotal * taxRate) / 100
  const grandTotal = subtotal + taxAmount - discount

  /* ── checkout ── */
  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Cart is empty!'); return }
    setProcessing(true)
    try {
      const orderData = {
        customerId: selectedCustomer ? Number(selectedCustomer) : null,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.sellingPrice })),
        discount, taxRate, paymentMethod,
      }
      const res = await orderAPI.create(orderData)
      const order = res.data.data
      setLastOrder(order)
      setShowReceipt(true)
      dispatch(clearCart())
      setSearchQuery(''); setSearchResults([])
      setSelectedCustomer('')
      toast.success(`Order ${order.orderNumber} created!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed')
    } finally { setProcessing(false) }
  }

  /* ── new customer validation & save ── */
  const validateNewCust = () => {
    const errs = {}
    if (!newCust.name.trim())  errs.name  = 'Name is required'
    if (!newCust.phone.trim()) errs.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(newCust.phone.trim())) errs.phone = 'Enter a valid 10-digit number'
    if (newCust.email && !/\S+@\S+\.\S+/.test(newCust.email)) errs.email = 'Invalid email'
    setCustErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveNewCustomer = async () => {
    if (!validateNewCust()) return
    setSavingCust(true)
    try {
      const res = await customerAPI.create({
        name: newCust.name.trim(),
        phone: newCust.phone.trim(),
        email: newCust.email.trim() || null,
        address: newCust.address.trim() || null,
      })
      const created = res.data.data
      setCustomers(prev => [...prev, created])
      setSelectedCustomer(String(created.id))
      setShowNewCust(false)
      setNewCust({ name: '', phone: '', email: '', address: '' })
      setCustErrors({})
      toast.success(`Customer "${created.name}" added!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer')
    } finally { setSavingCust(false) }
  }

  const cancelNewCust = () => {
    setShowNewCust(false)
    setNewCust({ name: '', phone: '', email: '', address: '' })
    setCustErrors({})
  }

  /* ── filtered category list for display ── */
  const visibleCategories =
    activeCategory === 'All'
      ? categorizedProducts
      : categorizedProducts.filter(g => g.category === activeCategory)

  /* ── product card ── */
  const ProductCard = ({ p }) => (
    <div
      onClick={() => { dispatch(addToCart(p)); toast.success(`${p.name} added`) }}
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
    >
      <div className="w-full h-20 bg-indigo-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition">
        <ShoppingCart className="w-8 h-8 text-indigo-400" />
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
      <p className="text-xs text-gray-400 truncate">{p.barcode}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-bold text-[#5c6bc0]">₹{Number(p.sellingPrice).toLocaleString('en-IN')}</span>
        <span className={`text-xs ${p.stock <= (p.minimumStock || 10) ? 'text-red-500' : 'text-green-600'}`}>
          {p.stock} left
        </span>
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-full gap-4" style={{ height: 'calc(100vh - 140px)' }}>

      {/* ══════════════ LEFT — PRODUCT PANEL ══════════════ */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">POS Billing</h1>
          <p className="text-sm text-gray-500">Browse by category or search to add products to cart</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by product name or barcode..."
          />
          {searching && (
            <div className="absolute right-3 top-3.5">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}
          {searchQuery && !searching && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Category Filter Pills (only when not searching) ── */}
        {!searchQuery && !loadingProducts && categorizedProducts.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {/* "All" pill */}
            <button
              onClick={() => setActiveCategory('All')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === 'All'
                  ? 'bg-[#5c6bc0] text-white border-[#5c6bc0] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              All ({categorizedProducts.reduce((a, g) => a + g.products.length, 0)})
            </button>

            {/* Per-category pills */}
            {categorizedProducts.map(({ category, products }) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeCategory === category
                    ? 'bg-[#5c6bc0] text-white border-[#5c6bc0] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-[#5c6bc0]'
                }`}
              >
                <Tag className="w-3 h-3" />
                {category}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeCategory === category ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{products.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Product Area */}
        <div className="flex-1 overflow-y-auto pr-1">

          {/* ── SEARCH MODE ── */}
          {searchQuery ? (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {searchResults.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : searching ? null : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Search className="w-10 h-10 mb-2" />
                <p className="text-sm">No products found for &quot;{searchQuery}&quot;</p>
              </div>
            )
          ) : (
            /* ── BROWSE MODE ── */
            loadingProducts ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-3" />
                <p className="text-sm">Loading products…</p>
              </div>
            ) : visibleCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <PackageOpen className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No products available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleCategories.map(({ category, products }) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Tag className="w-3.5 h-3.5" />
                        {category}
                      </div>
                      <span className="text-xs text-gray-400">{products.length} item{products.length !== 1 ? 's' : ''}</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {products.map(p => <ProductCard key={p.id} p={p} />)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ══════════════ RIGHT — CART PANEL ══════════════ */}
      <div className="w-96 flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Cart header */}
        <div className="p-4 bg-[#5c6bc0] text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{items.length} items</span>
              {items.length > 0 && (
                <button onClick={() => dispatch(clearCart())} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-800 flex-1 mr-2 leading-tight">{item.name}</p>
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => item.quantity > 1
                      ? dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                      : dispatch(removeFromCart(item.id))}
                    className="w-6 h-6 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    className="w-6 h-6 bg-[#5c6bc0] text-white rounded-full flex items-center justify-center hover:bg-[#4c5cb0]">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t p-4 space-y-3 flex-shrink-0">

          {/* ── Customer Section ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Customer</label>
              {!showNewCust && (
                <button
                  onClick={() => setShowNewCust(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#5c6bc0] hover:text-[#4c5cb0] transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  New Customer
                </button>
              )}
            </div>

            {/* Existing customer dropdown */}
            {!showNewCust && (
              <select
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            )}

            {/* ── New Customer Form ── */}
            {showNewCust && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2 mt-1">
                {/* Form header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                    <UserPlus className="w-3.5 h-3.5" />
                    New Customer Details
                  </div>
                  <button onClick={cancelNewCust} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ravi Kumar"
                      value={newCust.name}
                      onChange={e => { setNewCust(p => ({ ...p, name: e.target.value })); setCustErrors(p => ({ ...p, name: '' })) }}
                      className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        custErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                    />
                  </div>
                  {custErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{custErrors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={newCust.phone}
                      maxLength={10}
                      onChange={e => { setNewCust(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') })); setCustErrors(p => ({ ...p, phone: '' })) }}
                      className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        custErrors.phone ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                    />
                  </div>
                  {custErrors.phone && <p className="text-red-500 text-[10px] mt-0.5">{custErrors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email <span className="text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={newCust.email}
                      onChange={e => { setNewCust(p => ({ ...p, email: e.target.value })); setCustErrors(p => ({ ...p, email: '' })) }}
                      className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        custErrors.email ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                    />
                  </div>
                  {custErrors.email && <p className="text-red-500 text-[10px] mt-0.5">{custErrors.email}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address <span className="text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Street, City"
                      value={newCust.address}
                      onChange={e => setNewCust(p => ({ ...p, address: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={cancelNewCust}
                    className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewCustomer}
                    disabled={savingCust}
                    className="flex-1 py-2 text-xs font-semibold bg-[#5c6bc0] text-white rounded-lg hover:bg-[#4c5cb0] transition disabled:opacity-60 flex items-center justify-center gap-1"
                  >
                    {savingCust
                      ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                      : <UserPlus className="w-3.5 h-3.5" />}
                    {savingCust ? 'Saving…' : 'Save & Select'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Discount & GST */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Discount (₹)</label>
              <input type="number" value={discount}
                onChange={e => dispatch(setDiscount(Number(e.target.value)))}
                className="input-field text-sm" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">GST (%)</label>
              <input type="number" value={taxRate}
                onChange={e => dispatch(setTaxRate(Number(e.target.value)))}
                className="input-field text-sm" min="0" max="100" />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST ({taxRate}%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Discount</span><span>-₹{discount}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
              <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['CASH', 'CARD', 'UPI'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    paymentMethod === m
                      ? 'bg-[#5c6bc0] text-white border-[#5c6bc0]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          {/* Checkout */}
          <button
            onClick={handleCheckout}
            disabled={processing || items.length === 0}
            className="w-full bg-[#5c6bc0] text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing
              ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              : <CheckCircle className="w-5 h-5" />}
            {processing ? 'Processing...' : `Checkout • ₹${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* ══════════════ RECEIPT MODAL ══════════════ */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Rice Billing System</h2>
                <p className="text-gray-500 text-sm">Payment Successful</p>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Bill No:</span><span className="font-semibold">{lastOrder.orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{new Date(lastOrder.createdAt).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span>{lastOrder.customerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment:</span><span>{lastOrder.paymentMethod}</span></div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3" />
              <div className="space-y-1">
                {lastOrder.orderItems?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                    <span className="font-medium">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-300 my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(lastOrder.subtotal).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>GST</span><span>₹{Number(lastOrder.tax).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-₹{Number(lastOrder.discount).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Grand Total</span><span>₹{Number(lastOrder.grandTotal).toLocaleString('en-IN')}</span></div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3" />
              <p className="text-center text-xs text-gray-400">Thank you for shopping with us!</p>
              <button onClick={() => {
                const itemRows = (lastOrder.orderItems || []).map(item => `
                  <tr>
                    <td style="padding:5px 0;border-bottom:1px dashed #e5e7eb;">${item.productName}</td>
                    <td style="padding:5px 0;text-align:center;border-bottom:1px dashed #e5e7eb;">${item.quantity}</td>
                    <td style="padding:5px 0;text-align:right;border-bottom:1px dashed #e5e7eb;">₹${Number(item.price).toLocaleString('en-IN')}</td>
                    <td style="padding:5px 0;text-align:right;border-bottom:1px dashed #e5e7eb;font-weight:600;">₹${Number(item.subtotal).toLocaleString('en-IN')}</td>
                  </tr>`).join('');

                const receiptHtml = `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <title>Receipt - ${lastOrder.orderNumber}</title>
                <style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #111; background: white; padding: 24px 16px; max-width: 320px; margin: 0 auto; }
                  h1 { font-size: 18px; font-weight: 800; text-align: center; letter-spacing: 1px; }
                  .sub { font-size: 11px; text-align: center; color: #555; margin-top: 2px; }
                  .divider { border: none; border-top: 1px dashed #aaa; margin: 10px 0; }
                  .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
                  .label { color: #555; }
                  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
                  th { text-align: left; font-size: 10px; text-transform: uppercase; color: #777; padding-bottom: 4px; border-bottom: 1px solid #aaa; }
                  th.r { text-align: right; }
                  th.c { text-align: center; }
                  .total-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 3px; }
                  .grand { font-size: 15px; font-weight: 800; border-top: 2px solid #111; padding-top: 6px; margin-top: 6px; }
                  .thanks { text-align: center; font-size: 11px; color: #888; margin-top: 14px; }
                  @media print { @page { margin: 6mm; } }
                </style>
              </head>
              <body>
                <h1>RICE BILLING SYSTEM</h1>
                <div class="sub">Sales Receipt</div>
                <hr class="divider" />
                <div class="row"><span class="label">Bill No:</span><span><b>${lastOrder.orderNumber}</b></span></div>
                <div class="row"><span class="label">Date:</span><span>${new Date(lastOrder.createdAt).toLocaleString('en-IN')}</span></div>
                <div class="row"><span class="label">Customer:</span><span>${lastOrder.customerName}</span></div>
                <div class="row"><span class="label">Payment:</span><span>${lastOrder.paymentMethod}</span></div>
                <hr class="divider" />
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th class="c">Qty</th>
                      <th class="r">Price</th>
                      <th class="r">Amount</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows}</tbody>
                </table>
                <hr class="divider" />
                <div class="total-row"><span>Subtotal</span><span>₹${Number(lastOrder.subtotal).toLocaleString('en-IN')}</span></div>
                <div class="total-row"><span>GST</span><span>₹${Number(lastOrder.tax).toLocaleString('en-IN')}</span></div>
                <div class="total-row"><span>Discount</span><span>-₹${Number(lastOrder.discount).toLocaleString('en-IN')}</span></div>
                <div class="total-row grand"><span>GRAND TOTAL</span><span>₹${Number(lastOrder.grandTotal).toLocaleString('en-IN')}</span></div>
                <p class="thanks">★ Thank you for your purchase! ★</p>
                <script>window.onload = function() { window.print(); };</script>
              </body>
              </html>`;
                const w = window.open('', '_blank', 'width=400,height=600');
                w.document.write(receiptHtml);
                w.document.close();
              }} className="mt-4 w-full btn-secondary justify-center">
                <Printer className="w-4 h-4" />Print Receipt
              </button>
              <button onClick={() => setShowReceipt(false)} className="mt-2 w-full btn-primary justify-center">New Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
