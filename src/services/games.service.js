import api from './api'

export const getGames = async () => {
  const response = await api.get('/games/')
  console.log('Respuesta games:', response.data)
  return response.data
}

export const getGameById = async (id) => {
  const response = await api.get(`/games/${id}`)
  return response.data
}