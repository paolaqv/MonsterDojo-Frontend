import { defineStore } from 'pinia'
import { getCurrentUser } from '@/services/users.service'

const getStoredUserSafely = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUserSafely(),
    refreshIntervalId: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!localStorage.getItem('token'),
    permissions: (state) => state.user?.permisos || [],
    role: (state) => state.user?.rol_id_rol || state.user?.rol || '',
  },

  actions: {
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    setSession({ access_token, user }) {
      if (access_token) {
        localStorage.setItem('token', access_token)
      }

      if (user) {
        this.setUser(user)
      }
    },

    clearSession() {
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('reset_correo')
      sessionStorage.removeItem('reset_codigo')
sessionStorage.removeItem('reset_codigo_debug')
sessionStorage.removeItem('password_change_correo')
sessionStorage.removeItem('password_policy_cache')
      this.stopAutoRefresh()
    },

    async refreshCurrentUser() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.user = null
        return null
      }

      const user = await getCurrentUser()
      this.setUser(user)
      return user
    },

    hasPermission(permission) {
      return this.permissions.includes(permission)
    },

    hasAnyPermission(permissionList = []) {
      return permissionList.some((permission) => this.permissions.includes(permission))
    },

    hasRole(roleName) {
      return this.role === roleName
    },

    getDefaultRouteByRole() {
      switch (this.role) {
        case 'cliente':
          return '/inicio_usuario'
        case 'encargadoLocal':
          return '/adminpanel'
        case 'encargadoSeguridad':
          return '/panel-seguridad'
        case 'mesero':
          return '/panel-mesero'
        default:
          return '/login'
      }
    },

    startAutoRefresh(intervalMs = 5 * 60 * 1000) {
      if (this.refreshIntervalId) return

      this.refreshIntervalId = window.setInterval(async () => {
        try {
          if (localStorage.getItem('token')) {
            await this.refreshCurrentUser()
          }
        } catch (error) {
          console.error('No se pudo refrescar el usuario actual:', error)
        }
      }, intervalMs)
    },

    stopAutoRefresh() {
      if (this.refreshIntervalId) {
        clearInterval(this.refreshIntervalId)
        this.refreshIntervalId = null
      }
    },
  },
})