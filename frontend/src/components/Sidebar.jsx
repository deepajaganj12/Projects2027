import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard, Package, Tag, Users, Warehouse,
  ShoppingCart, ClipboardList, CreditCard, BarChart2,
  UserCog, Settings, Truck, Landmark
} from 'lucide-react'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'POS Billing', highlight: true },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: Tag, label: 'Categories' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/inventory', icon: Warehouse, label: 'Inventory' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/cash-bank', icon: Landmark, label: 'Cash & Bank' },
  { path: '/reports', icon: BarChart2, label: 'Reports', restricted: true },
  { path: '/suppliers', icon: Truck, label: 'Suppliers', restricted: true },
  { path: '/employees', icon: UserCog, label: 'Employees', restricted: true },
  { path: '/settings', icon: Settings, label: 'Settings', restricted: true },
]

export default function Sidebar({ isOpen }) {
  const { user } = useSelector((state) => state.auth)
  const isCashier = user?.roles?.includes('ROLE_CASHIER')

  // Filter out restricted menus for Cashiers
  const visibleMenuItems = menuItems.filter(item => !(isCashier && item.restricted))

  return (
    <aside className={`${ isOpen ? 'w-64' : 'w-18' } bg-white border-r border-gray-200/80 text-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
      {/* Sidebar Logo Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 flex-shrink-0">
        {isOpen && (
          <div>
            <h1 className="font-bold text-[#5c6bc0] text-base leading-tight">JJ Traders</h1>
            <p className="text-[10px] text-gray-400 font-medium">Rice Billing System</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {visibleMenuItems.map(({ path, icon: Icon, label, highlight }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-indigo-50/80 text-[#5c6bc0] font-semibold shadow-sm'
                  : highlight
                  ? 'text-[#5c6bc0] font-semibold hover:bg-indigo-50/40'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {/* Visual active indicator bar */}
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#5c6bc0]' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                
                {isOpen && <span className="text-xs tracking-wide truncate">{label}</span>}
                
                {isOpen && highlight && (
                  <span className="ml-auto text-[9px] bg-indigo-100 text-[#5c6bc0] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    POS
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-[#5c6bc0] rounded-r-md" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      {isOpen && (
        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider text-center">ShopFlow POS v1.0</p>
        </div>
      )}
    </aside>
  )
}
