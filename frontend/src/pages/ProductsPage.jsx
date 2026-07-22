import React, { useEffect, useState } from 'react'
import { productAPI, categoryAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let res
      if (search) res = await productAPI.search(search, { page, size: 10 })
      else res = await productAPI.getAll({ page, size: 10 })
      const d = res.data.data
      setProducts(d.content)
      setPagination({ page: d.page, totalPages: d.totalPages, last: d.last })
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    categoryAPI.getAll({ size: 100 }).then(r => setCategories(r.data.data.content || []))
  }, [])

  useEffect(() => { fetchProducts() }, [page, search])

  const openCreate = () => { setEditItem(null); reset(); setShowModal(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setValue('name', item.name)
    setValue('barcode', item.barcode)
    setValue('categoryId', item.categoryId)
    setValue('purchasePrice', item.purchasePrice)
    setValue('sellingPrice', item.sellingPrice)
    setValue('stock', item.stock)
    setValue('minimumStock', item.minimumStock)
    setValue('active', item.active)
    setShowModal(true)
  }
  const onSubmit = async (data) => {
    try {
      if (editItem) await productAPI.update(editItem.id, data)
      else await productAPI.create(data)
      toast.success(editItem ? 'Product updated!' : 'Product created!')
      setShowModal(false)
      fetchProducts()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productAPI.delete(id); toast.success('Deleted'); fetchProducts() }
    catch { toast.error('Failed to delete') }
  }

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'categoryName', label: 'Category' },
    { key: 'sellingPrice', label: 'Price', render: v => `₹${Number(v).toLocaleString('en-IN')}` },
    { key: 'stock', label: 'Stock', render: (v, row) => <span className={v <= (row.minimumStock || 10) ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{v}</span> },
    { key: 'active', label: 'Status', render: v => <span className={v ? 'badge-success' : 'badge-danger'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded"><Edit className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="text-gray-500 text-sm">Manage your product catalog</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Product</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="input-field pl-9" placeholder="Search products..." />
          </div>
        </div>
        <DataTable columns={columns} data={products} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Product name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <input {...register('barcode')} className="input-field" placeholder="Barcode" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('categoryId')} className="input-field">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
            <input {...register('purchasePrice')} type="number" step="0.01" className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
            <input {...register('sellingPrice', { required: 'Required' })} type="number" step="0.01" className="input-field" placeholder="0.00" />
            {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input {...register('stock', { required: 'Required' })} type="number" className="input-field" placeholder="0" />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
            <input {...register('minimumStock')} type="number" className="input-field" placeholder="10" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input {...register('active')} type="checkbox" id="active" className="rounded" />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Create'} Product</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
