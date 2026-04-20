import api from './api'

export const getReservations = async (params = {}) => {
  const { data } = await api.get('/reservations/', { params })
  return data
}

export const getReservationById = async (reservationId) => {
  const { data } = await api.get(`/reservations/${reservationId}`)
  return data
}

export const getReservationByIdAdmin = async (reservationId) => {
  const { data } = await api.get(`/reservations/admin/${reservationId}`)
  return data
}

export const createReservation = async (payload) => {
  const { data } = await api.post('/reservations/', payload)
  return data
}

export const updateReservation = async (reservationId, payload) => {
  const { data } = await api.put(`/reservations/${reservationId}`, payload)
  return data
}

export const getReservationDetails = async (reservationId) => {
  const { data } = await api.get(`/reservations/${reservationId}/details`)
  return data
}

export const getReservationDetailsAdmin = async (reservationId) => {
  const { data } = await api.get(`/reservations/admin/${reservationId}/details`)
  return data
}

export const getReservationDetailById = async (detailId) => {
  const { data } = await api.get(`/reservations/details/${detailId}`)
  return data
}

export const createReservationDetail = async (payload) => {
  const { data } = await api.post('/reservations/details', payload)
  return data
}

export const checkoutReservation = async (payload) => {
  const { data } = await api.post('/reservations/checkout', payload)
  return data
}

export const updateReservationCheckout = async (reservationId, payload) => {
  const { data } = await api.put(`/reservations/${reservationId}/checkout`, payload)
  return data
}