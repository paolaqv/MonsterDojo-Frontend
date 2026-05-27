import api from './api'

//mitigaciones
export const getMitigaciones = async (riesgoId) => {
  const { data } = await api.get(`/mitigaciones/?riesgo_id=${riesgoId}`)
  return data
}

export const getMitigacion = async (id) => {
  const { data } = await api.get(`/mitigaciones/${id}`)
  return data
}

export const createMitigacion = async (payload) => {
  const { data } = await api.post('/mitigaciones/', payload)
  return data
}

export const updateMitigacion = async (id, payload) => {
  const { data } = await api.put(`/mitigaciones/${id}`, payload)
  return data
}

export const deleteMitigacion = async (id) => {
  const { data } = await api.delete(`/mitigaciones/${id}`)
  return data
}