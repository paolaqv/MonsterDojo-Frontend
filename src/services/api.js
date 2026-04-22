import axios from 'axios'
import Swal from 'sweetalert2'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      const alreadyRedirecting = sessionStorage.getItem('session_expired_shown')

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!alreadyRedirecting) {
        sessionStorage.setItem('session_expired_shown', 'true')

        await Swal.fire({
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'OK',
        })

        sessionStorage.removeItem('session_expired_shown')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api