import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const permissions = computed(() => authStore.permissions)
  const role = computed(() => authStore.role)

  const hasPermission = (permission) => {
    return authStore.hasPermission(permission)
  }

  const hasAnyPermission = (permissionList = []) => {
    return authStore.hasAnyPermission(permissionList)
  }

  const hasRole = (roleName) => {
    return authStore.hasRole(roleName)
  }

  return {
    user,
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasRole,
  }
}