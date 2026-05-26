import axios from 'axios'
import Swal from 'sweetalert2'
import { sanitizePayload } from '@/utils/inputSanitizer'
import {
  startGlobalLoading,
  stopGlobalLoading,
  resetGlobalLoading,
} from '@/services/globalLoading'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

const getErrorMessage = (error) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.detail ||
  'Ocurrió un error inesperado.'

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const method = String(config.method || '').toLowerCase()

    /*
      Se ejecuta para todas las peticiones:
      GET, POST, PUT, PATCH y DELETE.
    */
    startGlobalLoading()

    const isFormData = config.data instanceof FormData

    if (['post', 'put', 'patch'].includes(method) && config.data && !isFormData) {
      config.data = sanitizePayload(config.data)
    }

    if (isFormData) {
      delete config.headers['Content-Type']
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    stopGlobalLoading()
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    stopGlobalLoading()
    return response
  },

  async (error) => {
    stopGlobalLoading()

    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''
    const apiMessage = getErrorMessage(error)
    const detail = error?.response?.data?.detail || ''

    /*
      Esto solo controla mensajes de autenticación.
      No restringe el loading.
    */
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/security-question') ||
      requestUrl.includes('/auth/verify-security-answer') ||
      requestUrl.includes('/auth/reset-password') ||
      requestUrl.includes('/auth/change-password-required') ||
      requestUrl.includes('/auth/password-recovery/request') ||
      requestUrl.includes('/auth/password-recovery/verify') ||
      requestUrl.includes('/auth/password-recovery/reset') ||
      requestUrl.includes('/auth/email-verification/request') ||
      requestUrl.includes('/auth/email-verification/confirm')

    const isRealSessionProblem =
      detail.includes('No se pudo validar la credencial') ||
      detail.includes('Could not validate credentials') ||
      detail.includes('Token expirado') ||
      detail.includes('token expired')

    if (status === 401 && !isAuthRoute && isRealSessionProblem) {
      const alreadyRedirecting = sessionStorage.getItem(
        'session_expired_shown'
      )

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!alreadyRedirecting) {
        sessionStorage.setItem('session_expired_shown', 'true')

        resetGlobalLoading()

        await Swal.fire({
          title: 'Sesión expirada',
          text:
            apiMessage ||
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'OK',
        })

        sessionStorage.removeItem('session_expired_shown')
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      resetGlobalLoading()

      await Swal.fire({
        title: 'Acceso denegado',
        text:
          apiMessage ||
          'No tienes permisos para realizar esta acción.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
    }

    if (status === 404 && !isAuthRoute) {
      console.warn(apiMessage || 'Recurso no encontrado.')
    }

    error.normalizedMessage = apiMessage

    return Promise.reject(error)
  }
)

export default api