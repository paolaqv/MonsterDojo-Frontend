import api from './api'

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/orders/', { params })
  return data
}

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`)
  return data
}

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders/', payload)
  return data
}

export const updateOrder = async (orderId, payload) => {
  const { data } = await api.put(`/orders/${orderId}`, payload)
  return data
}

export const getOrderDetails = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}/details`)
  return data
}

export const getOrderDetailById = async (detailId) => {
  const { data } = await api.get(`/orders/details/${detailId}`)
  return data
}

export const createOrderDetail = async (payload) => {
  const { data } = await api.post('/orders/details', payload)
  return data
}