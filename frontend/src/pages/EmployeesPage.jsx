import React, { useEffect, useState } from 'react'
import { employeeAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await employeeAPI.getAll({ page, size: 10 })
      const d = res.data.data
      setEmployees(d.content)
      setPagination({ page: d.page, totalPages: d.totalPages, last: d.last })
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const openCreate = () => { setEditItem(null); reset(); setShowModal(true) }
  const openEdit = (item) => {
    setEditItem(item)
    Object.keys(item).forEach(k => setValue(k, item[k]))
    setShowModal(true)
  }
  const onSubmit = async (data) => {
    try {
      if (editItem) await employeeAPI.update(editItem.id, data)
      else await employeeAPI.create(data)
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowModal(false); fetch()
    } catch { toast.error('Failed') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await employeeAPI.delete(id); toast.success('Deleted'); fetch() } catch { toast.error('Failed') }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'salary', label: 'Salary', render: v => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: v => <span className={v === 'ACTIVE' ? 'badge-success' : 'badge-danger'}>{v}</span> },
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
        <div><h1 className="text-2xl font-bold text-gray-900">Employees</h1><p className="text-gray-500 text-sm">Manage your staff</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Employee</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={employees} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input {...register('name', { required: true })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input {...register('email')} type="email" className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input {...register('phone')} className="input-field" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select {...register('role', { required: true })} className="input-field">
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Salary</label><input {...register('salary')} type="number" className="input-field" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register('status')} className="input-field">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Joining Date</label><input {...register('joiningDate')} type="date" className="input-field" /></div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Save</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
