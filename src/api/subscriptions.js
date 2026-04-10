import api from './client'
export const getStatus = () => api.get('/subscriptions/status')
export const upgradeToPro = (data) => api.post('/subscriptions/upgrade', data)
export const cancelPro = () => api.delete('/subscriptions/cancel')