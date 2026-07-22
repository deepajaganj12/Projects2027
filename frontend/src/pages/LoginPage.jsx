import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { setCredentials } from '../redux/authSlice'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.login(data)
      const payload = res.data.data
      dispatch(setCredentials({ user: payload, token: payload.token }))
      toast.success(`Welcome back, ${payload.name || payload.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">JJ Traders Rice Billing</h1>
          <p className="text-indigo-200 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="Enter username"
            />
            {errors.username && <p className="text-red-300 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPass ? 'text' : 'password'}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition pr-12"
                placeholder="Enter password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-indigo-300 hover:text-white">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-indigo-300 font-medium mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-indigo-200">
            <div className="flex justify-between"><span>Admin:</span><span className="font-mono">admin / admin123</span></div>
            <div className="flex justify-between"><span>Manager:</span><span className="font-mono">manager / manager123</span></div>
            <div className="flex justify-between"><span>Cashier:</span><span className="font-mono">cashier / cashier123</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
