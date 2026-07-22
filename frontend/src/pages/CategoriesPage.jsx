import React, { useEffect, useState } from 'react'
import { categoryAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await categoryAPI.getAll({ page, size: 10 })
      const d = res.data.data
      setCategories(d.content)
      setPagination({ page: d.page, totalPages: d.totalPages, last: d.last })
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const openCreate = () => { setEditItem(null); reset(); setShowModal(true) }
  const openEdit = (item) => { setEditItem(item); setValue('name', item.name); setValue('description', item.description); setShowModal(true) }
  const onSubmit = async (data) => {
    try {
      if (editItem) await categoryAPI.update(editItem.id, data)
      else await categoryAPI.create(data)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false)
      fetch()
    } catch (err) { toast.error('Failed') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await categoryAPI.delete(id); toast.success('Deleted'); fetch() } catch { toast.error('Failed') }
  }

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '-' },
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
        <div><h1 className="text-2xl font-bold text-gray-900">Categories</h1><p className="text-gray-500 text-sm">Manage product categories</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Category</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={categories} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name', { required: true })} className="input-field" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Save</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
