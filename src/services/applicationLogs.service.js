import api from './api'

export const getApplicationLogs = async (params = {}) => {
  const { data } = await api.get('/logs/application/', { params })
  return data
}
