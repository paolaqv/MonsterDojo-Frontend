import api from './api'

export const getTables = async (params = {}) => {
  const { data } = await api.get('/tables/', { params })
  return data
}

export const getTableById = async (tableId) => {
  const { data } = await api.get(`/tables/${tableId}`)
  return data
}

export const createTable = async (payload) => {
  const { data } = await api.post('/tables/', payload)
  return data
}

export const updateTable = async (tableId, payload) => {
  const { data } = await api.put(`/tables/${tableId}`, payload)
  return data
}

export const getAvailableTables = async ({ date, start_time, end_time }) => {
  const { data } = await api.get('/tables/available', {
    params: { date, start_time, end_time },
  })
  return data
}

export const archiveTable = async (tableId) => {
  const { data } = await api.put(`/tables/${tableId}/archive`)
  return data
}

export const unarchiveTable = async (tableId) => {
  const { data } = await api.put(`/tables/${tableId}/unarchive`)
  return data
}
