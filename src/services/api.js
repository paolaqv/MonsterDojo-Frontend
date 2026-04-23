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
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''

    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/security-question') ||
      requestUrl.includes('/auth/verify-security-answer') ||
      requestUrl.includes('/auth/reset-password') ||
      requestUrl.includes('/auth/security-question')

    if (status === 401 && !isAuthRoute) {
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
    if (status === 403) {
      await Swal.fire({
        title: 'Acceso denegado',
        text:
          error?.response?.data?.detail ||
          'No tienes permisos para realizar esta acción.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
    }

    return Promise.reject(error)
  }
)

export default api