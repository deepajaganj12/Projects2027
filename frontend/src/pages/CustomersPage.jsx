import React, { useEffect, useState } from 'react'
import { customerAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await customerAPI.getAll({ page, size: 10, search: search || undefined })
      const d = res.data.data
      setCustomers(d.content)
      setPagination({ page: d.page, totalPages: d.totalPages, last: d.last })
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, search])

  const openCreate = () => { setEditItem(null); reset(); setShowModal(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setValue('name', item.name); setValue('email', item.email)
    setValue('phone', item.phone); setValue('address', item.address)
    setShowModal(true)
  }
  const onSubmit = async (data) => {
    try {
      if (editItem) await customerAPI.update(editItem.id, data)
      else await customerAPI.create(data)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); fetch()
    } catch { toast.error('Failed') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await customerAPI.delete(id); toast.success('Deleted'); fetch() } catch { toast.error('Failed') }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'points', label: 'Points', render: v => <span className="font-semibold text-indigo-600">{v} pts</span> },
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
        <div><h1 className="text-2xl font-bold text-gray-900">Customers</h1><p className="text-gray-500 text-sm">Manage your customers</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Customer</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className="input-field pl-9" placeholder="Search customers..." />
          </div>
        </div>
        <DataTable columns={columns} data={customers} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input {...register('name', { required: true })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input {...register('email')} type="email" className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input {...register('phone')} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Address</label><textarea {...register('address')} className="input-field" rows={2} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Save</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
