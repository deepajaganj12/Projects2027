import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ columns, data, loading, pagination, onPageChange }) {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  )
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center text-gray-400 py-12">No data found</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-gray-500">Showing page {pagination.page + 1} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.last}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
