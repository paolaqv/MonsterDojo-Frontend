import api from './api'

export const uploadImage = async (file, tipo) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipo', tipo)

  const { data } = await api.post('/uploads/image', formData)
  return data
}
