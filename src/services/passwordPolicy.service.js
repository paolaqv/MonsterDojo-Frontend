import api from './api'

export const getPasswordPolicy = async () => {
  const { data } = await api.get('/security/password-policy/')
  return data
}

export const updatePasswordPolicy = async (payload) => {
  const { data } = await api.put('/security/password-policy/', payload)
  return data
}

export const getPublicPasswordPolicy = async () => {
  const { data } = await api.get('/auth/password-policy/public')
  return data
}