import api from './api'

export const getProductCategories = async () => {
  const { data } = await api.get('/products/categories')
  return data
}

export const createProductCategory = async (payload) => {
  const { data } = await api.post('/products/categories', payload)
  return data
}

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products/', { params })
  return data
}

export const getProductById = async (productId) => {
  const { data } = await api.get(`/products/${productId}`)
  return data
}

export const createProduct = async (payload) => {
  const { data } = await api.post('/products/', payload)
  return data
}

export const updateProduct = async (productId, payload) => {
  const { data } = await api.put(`/products/${productId}`, payload)
  return data
}