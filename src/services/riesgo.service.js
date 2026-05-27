import api from './api'

//activos
export const getActivos = async () => {
  const { data } = await api.get('/activos/')
  return data
}

export const getActivo = async (id) => {
  const { data } = await api.get(`/activos/${id}`)
  return data
}

export const createActivo = async (payload) => {
  const { data } = await api.post('/activos/', payload)
  return data
}

export const updateActivo = async (id, payload) => {
  const { data } = await api.put(`/activos/${id}`, payload)
  return data
}

export const deleteActivo = async (id) => {
  const { data } = await api.delete(`/activos/${id}`)
  return data
}

//eriegos
export const getRiesgos = async () => {
  const { data } = await api.get('/riesgos/')
  return data
}

export const getRiesgo = async (id) => {
  const { data } = await api.get(`/riesgos/${id}`)
  return data
}

export const createRiesgo = async (payload) => {
  const { data } = await api.post('/riesgos/', payload)
  return data
}

export const updateRiesgo = async (id, payload) => {
  const { data } = await api.put(`/riesgos/${id}`, payload)
  return data
}

export const deleteRiesgo = async (id) => {
  const { data } = await api.delete(`/riesgos/${id}`)
  return data
}