import api from './api'

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}