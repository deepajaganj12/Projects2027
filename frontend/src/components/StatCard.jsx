import React from 'react'

export default function StatCard({ title, value, icon: Icon, color, change, suffix = '' }) {
  // Map colors to entire card container styles (bg, text, border) to match the custom screenshot theme
  const cardStyles = {
    green: {
      bg: 'bg-emerald-50/70 border-emerald-100/80',
      title: 'text-emerald-600',
      value: 'text-emerald-700',
      iconBg: 'bg-white/90 text-emerald-600',
    },
    orange: {
      bg: 'bg-amber-50/70 border-amber-100/80',
      title: 'text-amber-600',
      value: 'text-amber-700',
      iconBg: 'bg-white/90 text-amber-600',
    },
    red: {
      bg: 'bg-rose-50 border-rose-100',
      title: 'text-rose-600',
      value: 'text-rose-700',
      iconBg: 'bg-white/90 text-rose-600',
    },
    indigo: {
      bg: 'bg-indigo-50/70 border-indigo-100/80',
      title: 'text-indigo-600',
      value: 'text-indigo-700',
      iconBg: 'bg-white/90 text-indigo-600',
    },
    blue: {
      bg: 'bg-sky-50 border-sky-100',
      title: 'text-sky-600',
      value: 'text-sky-700',
      iconBg: 'bg-white/90 text-sky-600',
    },
    purple: {
      bg: 'bg-purple-50/70 border-purple-100/80',
      title: 'text-purple-600',
      value: 'text-purple-700',
      iconBg: 'bg-white/90 text-purple-600',
    },
    gray: {
      bg: 'bg-slate-50 border-slate-100',
      title: 'text-slate-500',
      value: 'text-slate-700',
      iconBg: 'bg-white/90 text-slate-600',
    }
  }

  const currentStyle = cardStyles[color] || cardStyles.indigo

  return (
    <div className={`rounded-xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md ${currentStyle.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${currentStyle.iconBg}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${currentStyle.title}`}>{title}</p>
        <p className={`text-2xl font-bold mt-1 leading-tight ${currentStyle.value}`}>{suffix}{value}</p>
      </div>
    </div>
  )
}
