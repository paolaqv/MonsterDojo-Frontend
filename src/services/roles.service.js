import api from './api'

export const getRoles = async () => {
  const { data } = await api.get('/roles/')
  return data
}

export const getRoleById = async (roleId) => {
  const { data } = await api.get(`/roles/${roleId}`)
  return data
}

export const getPermissions = async () => {
  const { data } = await api.get('/roles/permissions')
  return data
}

export const createRole = async (payload) => {
  const { data } = await api.post('/roles/', payload)
  return data
}

export const updateRole = async (roleId, payload) => {
  const { data } = await api.put(`/roles/${roleId}`, payload)
  return data
}

export const deleteRole = async (roleId) => {
  const { data } = await api.delete(`/roles/${roleId}`)
  return data
}