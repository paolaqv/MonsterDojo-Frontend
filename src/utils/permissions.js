export const getStoredUser = () => {
  return JSON.parse(localStorage.getItem('user') || 'null')
}

export const hasPermission = (permission) => {
  const user = getStoredUser()
  const permissions = user?.permisos || []
  return permissions.includes(permission)
}

export const hasAnyPermission = (permissions = []) => {
  const user = getStoredUser()
  const current = user?.permisos || []
  return permissions.some((permission) => current.includes(permission))
}