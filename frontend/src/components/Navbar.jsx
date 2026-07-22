import React, { useEffect, useState, useRef } from 'react'
import { Menu, Bell, User, LogOut, AlertTriangle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/authSlice'
import { productAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  const [lowStockItems, setLowStockItems] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Fetch low stock items to populate notifications
    productAPI.lowStock()
      .then(res => {
        if (res.data && res.data.data) {
          setLowStockItems(res.data.data)
        }
      })
      .catch(err => console.error("Failed to load low stock alerts for notification bell", err))
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm relative z-40">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Welcome back, {user?.name || 'User'}</h2>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Notification Bell Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border border-white rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-50 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Notifications</span>
                {lowStockItems.length > 0 && (
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                    {lowStockItems.length} alert(s)
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {lowStockItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">
                    No new alerts. All products are well stocked!
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setShowNotifications(false); navigate('/inventory'); }}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-slate-50 cursor-pointer flex items-start gap-3 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Stock is low: <span className="font-bold text-rose-600">{item.stock} left</span></p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-7 h-7 bg-[#5c6bc0] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.roles?.[0]?.replace('ROLE_', '')}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Logout">
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  )
}
