import api from './api'

export const getGameCategories = async () => {
  const { data } = await api.get('/games/categories')
  return data
}

export const createGameCategory = async (payload) => {
  const { data } = await api.post('/games/categories', payload)
  return data
}

export const getGames = async () => {
  const { data } = await api.get('/games/')
  return data
}

export const getGameById = async (gameId) => {
  const { data } = await api.get(`/games/${gameId}`)
  return data
}

export const createGame = async (payload) => {
  const { data } = await api.post('/games/', payload)
  return data
}

export const updateGame = async (gameId, payload) => {
  const { data } = await api.put(`/games/${gameId}`, payload)
  return data
}

export const uploadGameImage = async (file) => {
  if (!file) {
    const err = new Error('Debe seleccionar una imagen para el juego.')
    err.normalizedMessage = err.message
    throw err
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipo', 'juego')

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