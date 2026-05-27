import api from './api'

export const getRiesgos = async () => {
  const { data } = await api.get('/risks/riesgos/')
  return data
}

export const getRiesgo = async (id) => {
  const { data } = await api.get(`/risks/riesgos/${id}`)
  return data
}

export const createRiesgo = async (payload) => {
  const { data } = await api.post('/risks/riesgos/', payload)
  return data
}

export const updateRiesgo = async (id, payload) => {
  const { data } = await api.put(`/risks/riesgos/${id}`, payload)
  return data
}

export const deleteRiesgo = async (id) => {
  const { data } = await api.delete(`/risks/riesgos/${id}`)
  return data
}