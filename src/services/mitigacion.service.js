import api from './api'

export const getMitigaciones = async (riesgoId) => {
  // Ajuste en cómo se envían los query params si es necesario, o la ruta directa
  const { data } = await api.get(`/risks/mitigaciones/?riesgo_id=${riesgoId}`)
  return data
}

export const getMitigacion = async (id) => {
  const { data } = await api.get(`/risks/mitigaciones/${id}`)
  return data
}

export const createMitigacion = async (payload) => {
  const { data } = await api.post('/risks/mitigaciones/', payload)
  return data
}

export const updateMitigacion = async (id, payload) => {
  const { data } = await api.put(`/risks/mitigaciones/${id}`, payload)
  return data
}

export const deleteMitigacion = async (id) => {
  const { data } = await api.delete(`/risks/mitigaciones/${id}`)
  return data
}