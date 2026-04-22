import axios from 'axios'

// Auth API
export const authApi = {
  register: (data) => axios.post('/api/auth/register', data),
  login:    (data) => axios.post('/api/auth/login', data),
  getMe:    ()     => axios.get('/api/auth/me'),
  updateMe: (data) => axios.put('/api/auth/me', data),
  changePassword: (data) => axios.put('/api/auth/change-password', data),
}

// Transactions API
export const transactionsApi = {
  getAll:  (params) => axios.get('/api/transactions', { params }),
  create:  (data)   => axios.post('/api/transactions', data),
  update:  (id, data) => axios.put(`/api/transactions/${id}`, data),
  delete:  (id)     => axios.delete(`/api/transactions/${id}`),
}

// Categories API
export const categoriesApi = {
  getAll:  (params) => axios.get('/api/categories', { params }),
  create:  (data)   => axios.post('/api/categories', data),
  update:  (id, data) => axios.put(`/api/categories/${id}`, data),
  delete:  (id)     => axios.delete(`/api/categories/${id}`),
}

// Dashboard API
export const dashboardApi = {
  getSummary:    (params) => axios.get('/api/dashboard/summary', { params }),
  getRecent:     (params) => axios.get('/api/dashboard/recent-transactions', { params }),
  getBreakdown:  (params) => axios.get('/api/dashboard/category-breakdown', { params }),
  getTrend:      ()       => axios.get('/api/dashboard/monthly-trend'),
  getBudgetCards:(params) => axios.get('/api/dashboard/budget-cards', { params }),
}

// Budgets API
export const budgetsApi = {
  getAll:     (params) => axios.get('/api/budgets', { params }),
  create:     (data)   => axios.post('/api/budgets', data),
  update:     (id, data) => axios.put(`/api/budgets/${id}`, data),
  delete:     (id)     => axios.delete(`/api/budgets/${id}`),
  getProgress:(params) => axios.get('/api/budgets/progress', { params }),
}

// Savings Goals API
export const savingsApi = {
  getAll:      (params) => axios.get('/api/savings-goals', { params }),
  create:      (data)   => axios.post('/api/savings-goals', data),
  update:      (id, data) => axios.put(`/api/savings-goals/${id}`, data),
  delete:      (id)     => axios.delete(`/api/savings-goals/${id}`),
  contribute:  (id, data) => axios.patch(`/api/savings-goals/${id}/contribute`, data),
}

// Insights API
export const insightsApi = {
  getAll:    (params) => axios.get('/api/insights', { params }),
  generate:  (data)   => axios.post('/api/insights/generate', data),
  markRead:  (id)     => axios.patch(`/api/insights/${id}/read`),
}

// Reports API
export const reportsApi = {
  getAll:    ()       => axios.get('/api/reports'),
  generate:  (data)   => axios.post('/api/reports/generate', data),
  getOne:    (id)     => axios.get(`/api/reports/${id}`),
  exportCsv: (id)     => axios.get(`/api/reports/${id}/export/csv`, { responseType: 'blob' }),
}
