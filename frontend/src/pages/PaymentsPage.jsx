import React, { useEffect, useState } from 'react'
import { paymentAPI } from '../services/api'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    setLoading(true)
    paymentAPI.getAll({ page, size: 10 })
      .then(res => { const d = res.data.data; setPayments(d.content); setPagination({ page: d.page, totalPages: d.totalPages, last: d.last }) })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [page])

  const columns = [
    { key: 'id', label: '#' },
    { key: 'orderNumber', label: 'Order #' },
    { key: 'amount', label: 'Amount', render: v => `₹${Number(v).toLocaleString('en-IN')}` },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'status', label: 'Status', render: v => <span className="badge-success">{v}</span> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleString() },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1><p className="text-gray-500 text-sm">Payment transaction history</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={payments} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  )
}
