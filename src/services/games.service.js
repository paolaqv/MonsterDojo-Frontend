import api from './api'

export const getGameCategories = async () => {
  const { data } = await api.get('/games/categories')
  return data
}

export const createGameCategory = async (payload) => {
  const { data } = await api.post('/games/categories', payload)
  return data
}

export const getGames = async (params = {}) => {
  const { data } = await api.get('/games/', { params })
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