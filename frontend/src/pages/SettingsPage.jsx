import React from 'react'
import { useSelector } from 'react-redux'
import { User } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useSelector(s => s.auth)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your application settings</p>
      </div>

      <div className="max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#5c6bc0]/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#5c6bc0]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profile</h3>
              <p className="text-xs text-gray-400">Your account info</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-2 border-b border-gray-50">
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-50">
              <p className="text-gray-500">Username</p>
              <p className="font-medium text-gray-800">{user?.username}</p>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-50">
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user?.email || '—'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Role</p>
              <p className="font-medium text-gray-800">
                {user?.roles?.map(r => r.replace('ROLE_', '')).join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
