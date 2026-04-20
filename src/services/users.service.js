import api from './api'

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}

export const updateCurrentUser = async (payload) => {
  const { data } = await api.put('/users/me/profile', payload)
  return data
}