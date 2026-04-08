import api from './client'
export const getEvents = (done) => api.get('/agenda', { params: { done } })
export const createEvent = (data) => api.post('/agenda', data)
export const updateEvent = (id, data) => api.put(`/agenda/${id}`, data)
export const toggleDone = (id) => api.patch(`/agenda/${id}/toggle`)
export const deleteEvent = (id) => api.delete(`/agenda/${id}`)