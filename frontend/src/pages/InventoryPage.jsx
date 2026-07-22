import React, { useEffect, useState } from 'react'
import { inventoryAPI, productAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lowStock, setLowStock] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const fetch = async () => {
    setLoading(true)
    try {
      const [invRes, lowRes] = await Promise.all([
        inventoryAPI.getAll(),
        productAPI.lowStock()
      ])
      setInventory(invRes.data.data)
      setLowStock(lowRes.data.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => {
    fetch()
    productAPI.getAll({ size: 1000 }).then(r => setProducts(r.data.data.content || []))
  }, [])

  const onSubmit = async (data) => {
    try {
      await inventoryAPI.adjust({ ...data, productId: Number(data.productId), quantity: Number(data.quantity) })
      toast.success('Stock adjusted!')
      setShowModal(false)
      reset()
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'adjustmentType', label: 'Type', render: v => <span className={v === 'ADD' ? 'badge-success' : v === 'REMOVE' ? 'badge-danger' : 'badge-info'}>{v}</span> },
    { key: 'quantity', label: 'Qty Changed' },
    { key: 'notes', label: 'Notes' },
    { key: 'lastUpdated', label: 'Date', render: v => v ? new Date(v).toLocaleString() : '-' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Inventory</h1><p className="text-gray-500 text-sm">Manage stock levels</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Adjust Stock</button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Low Stock Products ({lowStock.length})</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
                {p.name}: <strong>{p.stock}</strong> left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={inventory} loading={loading} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Adjust Stock">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product *</label>
            <select {...register('productId', { required: true })} className="input-field">
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adjustment Type *</label>
            <select {...register('adjustmentType', { required: true })} className="input-field">
              <option value="ADD">Add Stock</option>
              <option value="REMOVE">Remove Stock</option>
              <option value="ADJUSTMENT">Set Quantity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input {...register('quantity', { required: true })} type="number" min="1" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea {...register('notes')} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Adjust</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
