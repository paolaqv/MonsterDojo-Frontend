import api from './api'

export const getActivos = async () => {
  const { data } = await api.get('/risks/activos/')
  return data
}

export const getActivo = async (id) => {
  const { data } = await api.get(`/risks/activos/${id}`)
  return data
}

export const createActivo = async (payload) => {
  const { data } = await api.post('/risks/activos/', payload)
  return data
}

export const updateActivo = async (id, payload) => {
  const { data } = await api.put(`/risks/activos/${id}`, payload)
  return data
}

export const deleteActivo = async (id) => {
  const { data } = await api.delete(`/risks/activos/${id}`)
  return data
}