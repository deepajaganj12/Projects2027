import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
}

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query, params) => api.get('/products/search', { params: { query, ...params } }),
  posSearch: (query) => api.get('/products/pos/search', { params: { query } }),
  lowStock: () => api.get('/products/low-stock'),
  byCategory: (id, params) => api.get(`/products/category/${id}`, { params }),
}

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getConsolidated: (date) => api.get('/orders/today-consolidated', date ? { params: { date } } : {}),
}

export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
}

export const bankAccountAPI = {
  getAll: () => api.get('/bank-accounts'),
  create: (data) => api.post('/bank-accounts', data),
  getTransactions: (params) => api.get('/bank-accounts/transactions', { params }),
  addReduceMoney: (data) => api.post('/bank-accounts/transaction', data),
  transferMoney: (data) => api.post('/bank-accounts/transfer', data),
}

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  adjust: (data) => api.post('/inventory/adjust', data),
  history: (productId) => api.get(`/inventory/history/${productId}`),
}

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
}

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
}

export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

export const purchaseAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  approve: (id) => api.put(`/purchases/${id}/approve`),
  cancel: (id) => api.put(`/purchases/${id}/cancel`),
}
