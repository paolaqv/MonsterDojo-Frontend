// src/services/riskAnalysis.service.js
import api from './api'

// Obtener todos los riesgos
export const getRiesgos = async () => {
  const { data } = await api.get('/risk-analysis/')
  return data
}

// Obtener un riesgo por ID
export const getRiesgo = async (id) => {
  const { data } = await api.get(`/risk-analysis/${id}`)
  return data
}

// Crear nuevo riesgo
export const createRiesgo = async (payload) => {
  const { data } = await api.post('/risk-analysis/', payload)
  return data
}

// Actualizar riesgo
export const updateRiesgo = async (id, payload) => {
  const { data } = await api.put(`/risk-analysis/${id}`, payload)
  return data
}

// Eliminar riesgo
export const deleteRiesgo = async (id) => {
  const { data } = await api.delete(`/risk-analysis/${id}`)
  return data
}

// Obtener resumen para dashboard
export const getDashboardSummary = async () => {
  const { data } = await api.get('/risk-analysis/dashboard/summary')
  return data
}