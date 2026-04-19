import api from './api'

export const login = async ({ correo, password }) => {
  const { data } = await api.post('/auth/login', { correo, password })

  if (data?.access_token) {
    localStorage.setItem('token', data.access_token)
  }

  if (data?.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  return data
}

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const getSecurityQuestion = async (correo) => {
  const { data } = await api.post('/auth/security-question', { correo })
  return data
}

export const verifySecurityAnswer = async ({ correo, respuesta_seguridad }) => {
  const { data } = await api.post('/auth/verify-security-answer', {
    correo,
    respuesta_seguridad,
  })
  return data
}

export const resetPassword = async ({
  correo,
  respuesta_seguridad,
  new_password,
}) => {
  const { data } = await api.post('/auth/reset-password', {
    correo,
    respuesta_seguridad,
    new_password,
  })
  return data
}

export const changeSecurityQuestion = async ({
  correo,
  password,
  nueva_pregunta_seguridad,
  nueva_respuesta_seguridad,
}) => {
  const { data } = await api.put('/auth/security-question', {
    correo,
    password,
    nueva_pregunta_seguridad,
    nueva_respuesta_seguridad,
  })
  return data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('reset_correo')
  sessionStorage.removeItem('reset_answer')
}

export const getStoredUser = () => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}