import api from './api'

export const getActiveReservation = async () => {
  const response = await api.get('/reservations/active')
  return response.data
}