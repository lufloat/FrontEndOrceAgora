import api from './client'
export const getTemplates = (categoryId) => api.get('/templates', { params: { categoryId } })
export const createTemplate = (data) => api.post('/templates', data)
export const updateTemplate = (id, data) => api.put(`/templates/${id}`, data)
export const duplicateTemplate = (id) => api.post(`/templates/${id}/duplicate`)
export const deleteTemplate = (id) => api.delete(`/templates/${id}`)