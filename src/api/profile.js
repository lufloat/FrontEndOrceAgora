import api from './client'
export const getProfile = () => api.get('/profile')
export const updateProfile = (data) => api.put('/profile', data)
export const updateLogo = (logoBase64) => api.put('/profile/logo', { logoBase64 })