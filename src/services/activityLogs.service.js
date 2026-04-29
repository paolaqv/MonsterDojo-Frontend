import api from './api'

export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get('/logs/', { params })
  return data
}

export const getCriticalLogs = async () => {
  const { data } = await api.get('/logs/', {
    params: { critical_only: true },
  })
  return data
}