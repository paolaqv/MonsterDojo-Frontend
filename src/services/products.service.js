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

export const uploadProductImage = async (file) => {
  if (!file) {
    const err = new Error('Debe seleccionar una imagen para el producto.')
    err.normalizedMessage = err.message
    throw err
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipo', 'producto')

  const { data } = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': undefined,
    },
  })

  if (!data || !data.url) {
    const err = new Error('La respuesta del servidor de imágenes es inválida.')
    err.normalizedMessage = err.message
    throw err
  }

  return data
}