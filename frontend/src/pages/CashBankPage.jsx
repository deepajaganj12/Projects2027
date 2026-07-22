import React, { useState, useEffect } from 'react'
import { 
  Landmark, Plus, ArrowLeftRight, Download, X, 
  Calendar, TrendingUp, TrendingDown, RefreshCw, AlertCircle
} from 'lucide-react'
import { bankAccountAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CashBankPage() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [period, setPeriod] = useState('ALL') // 'ALL', '30_DAYS', '6_MONTHS', 'THIS_YEAR'
  
  // Modals state
  const [showAddReduceModal, setShowAddReduceModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  // Form states
  const [addReduceForm, setAddReduceForm] = useState({
    transactionType: 'CASH_IN',
    amount: '',
    accountId: '',
    remarks: '',
    referenceNumber: '',
    transactionDate: new Date().toISOString().substring(0, 16)
  })

  const [transferForm, setTransferForm] = useState({
    sourceAccountId: '',
    destinationAccountId: '',
    amount: '',
    remarks: '',
    transactionDate: new Date().toISOString().substring(0, 16)
  })

  const [accountForm, setAccountForm] = useState({
    accountName: '',
    accountType: 'BANK',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    initialBalance: ''
  })

  // Fetch Accounts and Transactions
  const fetchData = async () => {
    setLoading(true)
    try {
      const accountsRes = await bankAccountAPI.getAll()
      const fetchedAccounts = accountsRes.data.data
      setAccounts(fetchedAccounts)
      
      const transRes = await bankAccountAPI.getTransactions({ page, size: 10, period })
      setTransactions(transRes.data.data.content)
      setTotalPages(transRes.data.data.totalPages || 1)
      
      // Set default account IDs for forms if accounts are available
      if (fetchedAccounts.length > 0) {
        const firstCash = fetchedAccounts.find(a => a.accountType === 'CASH') || fetchedAccounts[0]
        const firstBank = fetchedAccounts.find(a => a.accountType === 'BANK') || fetchedAccounts[0]
        
        setAddReduceForm(prev => ({ ...prev, accountId: firstCash.id.toString() }))
        setTransferForm(prev => ({ 
          ...prev, 
          sourceAccountId: firstCash.id.toString(), 
          destinationAccountId: firstBank.id !== firstCash.id ? firstBank.id.toString() : ''
        }))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load Cash & Bank details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, period])

  // Aggregate stats
  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0)
  const cashAccounts = accounts.filter(a => a.accountType === 'CASH')
  const bankAccounts = accounts.filter(a => a.accountType === 'BANK')

  // Handle Add/Reduce submit
  const handleAddReduceSubmit = async (e) => {
    e.preventDefault()
    if (!addReduceForm.amount || parseFloat(addReduceForm.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!addReduceForm.accountId) {
      toast.error('Please select an account')
      return
    }

    try {
      await bankAccountAPI.addReduceMoney({
        transactionType: addReduceForm.transactionType,
        amount: parseFloat(addReduceForm.amount),
        accountId: parseInt(addReduceForm.accountId),
        remarks: addReduceForm.remarks,
        referenceNumber: addReduceForm.referenceNumber,
        transactionDate: addReduceForm.transactionDate ? new Date(addReduceForm.transactionDate).toISOString() : null
      })
      toast.success('Transaction recorded successfully')
      setShowAddReduceModal(false)
      // Reset form
      setAddReduceForm(prev => ({
        ...prev,
        amount: '',
        remarks: '',
        referenceNumber: '',
        transactionDate: new Date().toISOString().substring(0, 16)
      }))
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record transaction')
    }
  }

  // Handle Transfer submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault()
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!transferForm.sourceAccountId || !transferForm.destinationAccountId) {
      toast.error('Please select both source and destination accounts')
      return
    }
    if (transferForm.sourceAccountId === transferForm.destinationAccountId) {
      toast.error('Source and Destination accounts must be different')
      return
    }

    try {
      await bankAccountAPI.transferMoney({
        sourceAccountId: parseInt(transferForm.sourceAccountId),
        destinationAccountId: parseInt(transferForm.destinationAccountId),
        amount: parseFloat(transferForm.amount),
        remarks: transferForm.remarks,
        transactionDate: transferForm.transactionDate ? new Date(transferForm.transactionDate).toISOString() : null
      })
      toast.success('Funds transferred successfully')
      setShowTransferModal(false)
      // Reset form
      setTransferForm(prev => ({
        ...prev,
        amount: '',
        remarks: '',
        transactionDate: new Date().toISOString().substring(0, 16)
      }))
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to transfer money')
    }
  }

  // Handle Account submit
  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    if (!accountForm.accountName) {
      toast.error('Account Name is required')
      return
    }

    try {
      await bankAccountAPI.create({
        ...accountForm,
        initialBalance: accountForm.initialBalance ? parseFloat(accountForm.initialBalance) : 0
      })
      toast.success('Account created successfully')
      setShowAccountModal(false)
      // Reset form
      setAccountForm({
        accountName: '',
        accountType: 'BANK',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        initialBalance: ''
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['ID', 'Date', 'Type', 'Account Name', 'Reference Type', 'Reference #', 'Amount', 'Remarks']
    const rows = transactions.map(t => [
      t.id,
      new Date(t.transactionDate).toLocaleString(),
      t.transactionType,
      t.transactionType === 'TRANSFER' 
        ? `${t.sourceAccount?.accountName} -> ${t.destinationAccount?.accountName}`
        : t.transactionType === 'CASH_IN' ? t.destinationAccount?.accountName : t.sourceAccount?.accountName,
      t.referenceType || 'MANUAL',
      t.referenceNumber || '-',
      t.amount,
      t.remarks || ''
    ])

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Title Header with Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cash and Bank</h1>
          <p className="text-gray-500 text-sm">Manage bank accounts, physical cash flows and transactions</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setShowAddReduceModal(true)}
            className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            Add/Reduce Money
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
            Transfer Money
          </button>
          <button 
            onClick={() => {
              setAccountForm(prev => ({ ...prev, accountType: 'BANK' }))
              setShowAccountModal(true)
            }}
            className="px-4 py-2 text-sm bg-[#5c6bc0] hover:bg-[#4c5cb0] text-white font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Account
          </button>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Pane - w-1/3 equivalent */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Total Balance Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Balance</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">
                  ₹{Number(totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Accounts List Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            
            {/* Cash Section */}
            <div className="p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cash</h2>
              <div className="space-y-2">
                {cashAccounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm leading-none">{acc.accountName}</p>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{acc.accountType}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      ₹{Number(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Accounts Section */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Accounts</h2>
                <button 
                  onClick={() => {
                    setAccountForm(prev => ({ ...prev, accountType: 'BANK' }))
                    setShowAccountModal(true)
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  + Add New Bank
                </button>
              </div>
              
              <div className="space-y-2">
                {bankAccounts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No bank accounts added.</p>
                ) : (
                  bankAccounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm leading-none">{acc.accountName}</p>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {acc.bankName ? `${acc.bankName} (${acc.accountNumber?.slice(-4) || 'xxxx'})` : 'BANK'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        ₹{Number(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side Pane - w-2/3 equivalent */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Tab Header with Date Filter and Export */}
          <div className="px-6 py-4 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex border-b border-transparent">
              <button className="pb-3 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 focus:outline-none uppercase tracking-wider">
                Transactions
              </button>
            </div>

            {/* Filter and Download Tools */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value)
                    setPage(0)
                  }}
                  className="pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[130px] font-medium"
                >
                  <option value="ALL">All Time</option>
                  <option value="30_DAYS">Last 30 Days</option>
                  <option value="6_MONTHS">Last 6 Months</option>
                  <option value="THIS_YEAR">This Year</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={handleExportCSV}
                title="Export transactions as CSV"
                className="p-2 text-gray-500 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-400 font-medium">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              
              {/* Screenshot Accurate Empty Vault Illustration */}
              <div className="relative w-24 h-24 mb-5 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                <Landmark className="w-12 h-12 text-slate-300" />
                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
              </div>

              <h3 className="font-bold text-gray-800 text-base">No Transactions</h3>
              <p className="text-gray-400 text-sm max-w-sm mt-1">
                You don't have any transaction in the selected period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Details / Account</th>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {transactions.map(t => {
                    const isCashIn = t.transactionType === 'CASH_IN'
                    const isTransfer = t.transactionType === 'TRANSFER'
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Type Indicator */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isCashIn 
                              ? 'bg-green-50 text-green-700 border border-green-100' 
                              : isTransfer 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {isCashIn ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isCashIn ? 'Cash In' : isTransfer ? 'Transfer' : 'Cash Out'}
                          </span>
                        </td>

                        {/* Details and Accounts */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">{t.remarks || 'Manual Adjustment'}</p>
                            <p className="text-[11px] text-gray-400">
                              {isTransfer ? (
                                <span>{t.sourceAccount?.accountName} → {t.destinationAccount?.accountName}</span>
                              ) : isCashIn ? (
                                <span>Account: {t.destinationAccount?.accountName}</span>
                              ) : (
                                <span>Account: {t.sourceAccount?.accountName}</span>
                              )}
                            </p>
                          </div>
                        </td>

                        {/* Reference Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-[11px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                              {t.referenceType || 'MANUAL'}
                            </span>
                            {t.referenceNumber && (
                              <p className="text-xs text-slate-500 mt-1.5 font-medium">{t.referenceNumber}</p>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(t.transactionDate).toLocaleString()}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`font-bold ${
                            isCashIn 
                              ? 'text-green-600' 
                              : isTransfer 
                              ? 'text-blue-600' 
                              : 'text-rose-600'
                          }`}>
                            {isCashIn ? '+' : isTransfer ? '' : '-'}
                            ₹{Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Simple Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-slate-50/30">
                  <span className="text-xs text-gray-400 font-medium">Page {page + 1} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          ADD/REDUCE MONEY DIALOG
      ======================================================== */}
      {showAddReduceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-150 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-gray-800 text-base">Add / Reduce Money</h3>
              <button 
                onClick={() => setShowAddReduceModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddReduceSubmit} className="p-5 space-y-4 text-sm">
              
              {/* Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAddReduceForm(p => ({ ...p, transactionType: 'CASH_IN' }))}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      addReduceForm.transactionType === 'CASH_IN' 
                        ? 'bg-green-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Add Money (Cash In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddReduceForm(p => ({ ...p, transactionType: 'CASH_OUT' }))}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      addReduceForm.transactionType === 'CASH_OUT' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Reduce Money (Cash Out)
                  </button>
                </div>
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Account</label>
                <select
                  value={addReduceForm.accountId}
                  onChange={(e) => setAddReduceForm(p => ({ ...p, accountId: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Choose Account --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (Balance: ₹{Number(acc.balance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={addReduceForm.amount}
                  onChange={(e) => setAddReduceForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transaction Date</label>
                <input
                  type="datetime-local"
                  required
                  value={addReduceForm.transactionDate}
                  onChange={(e) => setAddReduceForm(p => ({ ...p, transactionDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Ref Number */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reference Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CHEQUE-102, TXN-8941"
                  value={addReduceForm.referenceNumber}
                  onChange={(e) => setAddReduceForm(p => ({ ...p, referenceNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Enter notes about this transaction..."
                  value={addReduceForm.remarks}
                  onChange={(e) => setAddReduceForm(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddReduceModal(false)}
                  className="px-4 py-2 text-sm bg-white hover:bg-slate-50 text-gray-700 font-semibold border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#5c6bc0] hover:bg-[#4c5cb0] text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Save Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TRANSFER MONEY DIALOG
      ======================================================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-150 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-gray-800 text-base">Transfer Money</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4 text-sm">
              
              {/* Source Account Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">From Account</label>
                <select
                  value={transferForm.sourceAccountId}
                  onChange={(e) => setTransferForm(p => ({ ...p, sourceAccountId: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Choose Source --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (Balance: ₹{Number(acc.balance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Account Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">To Account</label>
                <select
                  value={transferForm.destinationAccountId}
                  onChange={(e) => setTransferForm(p => ({ ...p, destinationAccountId: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Choose Destination --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} disabled={acc.id.toString() === transferForm.sourceAccountId}>
                      {acc.accountName} (Balance: ₹{Number(acc.balance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transaction Date</label>
                <input
                  type="datetime-local"
                  required
                  value={transferForm.transactionDate}
                  onChange={(e) => setTransferForm(p => ({ ...p, transactionDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Describe the reason for this transfer..."
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-sm bg-white hover:bg-slate-50 text-gray-700 font-semibold border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#5c6bc0] hover:bg-[#4c5cb0] text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Initiate Transfer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW BANK ACCOUNT DIALOG
      ======================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-150 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-gray-800 text-base">Add New Account</h3>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAccountSubmit} className="p-5 space-y-4 text-sm">
              
              {/* Account Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAccountForm(p => ({ ...p, accountType: 'BANK' }))}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      accountForm.accountType === 'BANK' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountForm(p => ({ ...p, accountType: 'CASH' }))}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      accountForm.accountType === 'CASH' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Cash Box / Wallet
                  </button>
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Account / Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI Current Account, Office Drawer"
                  value={accountForm.accountName}
                  onChange={(e) => setAccountForm(p => ({ ...p, accountName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Bank-Specific Fields */}
              {accountForm.accountType === 'BANK' && (
                <>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India"
                        value={accountForm.bankName}
                        onChange={(e) => setAccountForm(p => ({ ...p, bankName: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 50100412891"
                        value={accountForm.accountNumber}
                        onChange={(e) => setAccountForm(p => ({ ...p, accountNumber: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001042"
                        value={accountForm.ifscCode}
                        onChange={(e) => setAccountForm(p => ({ ...p, ifscCode: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Branch Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Main Branch"
                        value={accountForm.branchName}
                        onChange={(e) => setAccountForm(p => ({ ...p, branchName: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Initial Balance */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Opening / Initial Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={accountForm.initialBalance}
                  onChange={(e) => setAccountForm(p => ({ ...p, initialBalance: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 text-sm bg-white hover:bg-slate-50 text-gray-700 font-semibold border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#5c6bc0] hover:bg-[#4c5cb0] text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Create Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
