import api from './api'

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}

export const updateCurrentUser = async (payload) => {
  const { data } = await api.put('/users/me/profile', payload)
  return data
}

export const getSecurityUsers = async () => {
  const { data } = await api.get('/security/users')
  return data
}

export const getSecurityUserById = async (userId) => {
  const { data } = await api.get(`/security/users/${userId}`)
  return data
}

export const updateSecurityUser = async (userId, payload) => {
  const { data } = await api.put(`/security/users/${userId}`, payload)
  return data
}

export const deleteSecurityUser = async (userId) => {
  const { data } = await api.delete(`/security/users/${userId}`)
  return data
}