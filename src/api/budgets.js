import api from './client'
export const getBudgets = (params) => api.get('/budgets', { params })
export const getBudget = (id) => api.get(`/budgets/${id}`)
export const getByToken = (token) => api.get(`/budgets/approve/${token}`)
export const createBudget = (data) => api.post('/budgets', data)
export const deleteBudget = (id) => api.delete(`/budgets/${id}`)
export const downloadPdf = (id) => api.get(`/budgets/${id}/pdf`, { responseType: 'blob' })
export const processApproval = (token, data) => api.post(`/budgets/approve/${token}`, data)