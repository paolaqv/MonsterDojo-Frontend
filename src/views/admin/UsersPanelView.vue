<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import '@/assets/css/userspanel.css'
import '@/assets/css/popup.css'
import logo from '@/assets/images/logo.png'
import editUserImg from '@/assets/images/editar_usuario.png'
import '@/assets/css/roles-panel.css'
import RoleFormPopup from '@/views/security/RoleFormPopup.vue'
import UserFormPopup from '@/views/security/UserFormPopup.vue'
import {
  createSecurityUser,
  deleteSecurityUser,
  getSecurityUserById,
  getSecurityUsers,
  sendUserCredentials,
  updateSecurityUser,
} from '@/services/users.service'
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from '@/services/roles.service'

const authStore = useAuthStore()
const canManageUsers = computed(() => {
  return authStore.hasPermission('gestionar_usuarios')
})

const canManageRoles = computed(() => {
  return authStore.hasPermission('gestionar_roles')
})
const menuOpen = ref(false)
const search = ref('')
const users = ref([])
const showEditPopup = ref(false)
const currentEditTab = ref(0)
const activeTab = ref('users')

const showRolePopup = ref(false)
const isEditingRole = ref(false)
const roles = ref([])
const selectedRole = ref(null)
const roleSearch = ref('')
const roleFilter = ref('todos')

const showUserPopup = ref(false)
const isEditingUser = ref(false)
const selectedUser = ref(null)

const editForm = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
})

const filteredUsers = computed(() => {
  if (!search.value.trim()) return users.value

  const query = search.value.toLowerCase()

  return users.value.filter((user) => {
    const fullName = `${user.nombre || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.toLowerCase()

    return (
      fullName.includes(query) ||
      String(user.correo).toLowerCase().includes(query) ||
      String(user.telefono ?? '').toLowerCase().includes(query) ||
      String(user.rol_id_rol ?? '').toLowerCase().includes(query)
    )
  })
})

const filteredRoles = computed(() => {
  let data = [...roles.value]

  if (roleSearch.value.trim()) {
    const query = roleSearch.value.toLowerCase()
    data = data.filter((role) => {
      return (
        String(role.id_rol).toLowerCase().includes(query) ||
        String(role.nombre).toLowerCase().includes(query)
      )
    })
  }

  if (roleFilter.value === 'activos') {
    data = data.filter((role) => role.activo)
  } else if (roleFilter.value === 'inactivos') {
    data = data.filter((role) => !role.activo)
  }

  return data
})

const roleNameMap = computed(() => {
  const map = {}
  roles.value.forEach((role) => {
    map[role.id_rol] = role.nombre
  })
  return map
})

const getUserRoleLabel = (user) => {
  return roleNameMap.value[user.rol_id_rol] || user.rol_id_rol || 'Sin rol'
}

const openNewUserPopup = () => {
  selectedUser.value = null
  isEditingUser.value = false
  showUserPopup.value = true
}

const openEditUserPopup = async (userId) => {
  try {
    const data = await getSecurityUserById(userId)
    selectedUser.value = JSON.parse(JSON.stringify(data))
    isEditingUser.value = true
    showUserPopup.value = true
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el usuario.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const closeUserPopup = () => {
  showUserPopup.value = false
  selectedUser.value = null
}

const saveUser = async (userData) => {
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]+$/
  const phoneRegex = /^\d{7,10}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const nombre = userData.nombre?.trim() || ''
  const primerApellido = userData.primer_apellido?.trim() || ''
  const segundoApellido = userData.segundo_apellido?.trim() || null
  const telefono = String(userData.telefono ?? '').trim()
  const rolId = userData.rol_id_rol?.trim() || ''

  const correoContacto = userData.correo_contacto?.trim().toLowerCase() || ''
  const codigoVerificacion = userData.codigo_verificacion?.trim() || ''
  const correo = userData.correo?.trim().toLowerCase() || ''

  if (!nombre || nombre.length < 2 || nombre.length > 50 || !nameRegex.test(nombre)) {
    Swal.fire({
      title: 'Datos inválidos',
      text: 'El nombre debe tener entre 2 y 50 caracteres y contener solo letras.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  if (
    !primerApellido ||
    primerApellido.length < 2 ||
    primerApellido.length > 50 ||
    !nameRegex.test(primerApellido)
  ) {
    Swal.fire({
      title: 'Datos inválidos',
      text: 'El primer apellido debe tener entre 2 y 50 caracteres y contener solo letras.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  if (
    segundoApellido &&
    (segundoApellido.length > 50 || !nameRegex.test(segundoApellido))
  ) {
    Swal.fire({
      title: 'Datos inválidos',
      text: 'El segundo apellido debe contener solo letras y no superar los 50 caracteres.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  if (!phoneRegex.test(telefono)) {
    Swal.fire({
      title: 'Datos inválidos',
      text: 'El teléfono debe tener entre 7 y 10 dígitos numéricos.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  if (!rolId) {
    Swal.fire({
      title: 'Datos inválidos',
      text: 'Debes seleccionar un rol.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  const selectedRole = roles.value.find((role) => role.id_rol === rolId)

  if (!selectedRole || !selectedRole.activo) {
    Swal.fire({
      title: 'Rol no válido',
      text: 'Debes seleccionar un rol activo.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
    return
  }

  if (isEditingUser.value) {
    if (!correo || !emailRegex.test(correo)) {
      Swal.fire({
        title: 'Datos inválidos',
        text: 'El correo institucional del usuario no es válido.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })
      return
    }
  } else {
    if (!correoContacto || !emailRegex.test(correoContacto)) {
      Swal.fire({
        title: 'Datos inválidos',
        text: 'Ingresa un correo de contacto válido.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })
      return
    }

    if (!/^\d{6}$/.test(codigoVerificacion)) {
      Swal.fire({
        title: 'Datos inválidos',
        text: 'El código de verificación debe contener 6 dígitos.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })
      return
    }
  }

  try {
    if (isEditingUser.value) {
      await updateSecurityUser(userData.id, {
        nombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        correo,
        telefono: Number(telefono),
        rol_id_rol: rolId,
      })
    } else {
      await createSecurityUser({
        nombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        correo_contacto: correoContacto,
        codigo_verificacion: codigoVerificacion,
        telefono: Number(telefono),
        rol_id_rol: rolId,
        enviar_credenciales: !!userData.enviarCredenciales,
      })
    }

    if (userData.enviarCredenciales && userData.id) {
      try {
        await sendUserCredentials(userData.id)
      } catch {
        // Se conserva el comportamiento actual si falla el reenvío.
      }
    }

    Swal.fire({
      title: '¡Éxito!',
      text: isEditingUser.value
        ? 'Usuario actualizado correctamente.'
        : 'Usuario creado correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })

    closeUserPopup()
    await loadUsers()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'No se pudo guardar el usuario.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const handleSendCredentials = async (user) => {
  try {
    await sendUserCredentials(user.id_usuario)

    Swal.fire({
      title: 'Credenciales enviadas',
      text: 'La solicitud de envío fue procesada.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  } catch {
    Swal.fire({
      title: 'Función visible',
      text: 'La opción de envío de credenciales está lista visualmente, pero el envío real aún no está activo.',
      icon: 'info',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

/* roles */
const getRoleAccessSummary = (role) => {
  const accesses = []
  const permisos = role.permisos || []

  if (permisos.includes('ver_usuarios')) accesses.push('Ver usuarios')
  if (permisos.includes('gestionar_usuarios')) {accesses.push('Gestión de usuarios')}
  if (permisos.includes('gestionar_roles')) {accesses.push('Gestión de roles y accesos')}
  if (permisos.includes('ver_pedidos_detalle')) accesses.push('Ver pedidos y detalle')
  if (permisos.includes('gestionar_pedidos')) accesses.push('Gestión pedidos')
  if (permisos.includes('ver_productos')) accesses.push('Ver productos')
  if (permisos.includes('gestionar_productos')) accesses.push('Gestión productos')
  if (permisos.includes('ver_juegos')) accesses.push('Ver juegos')
  if (permisos.includes('gestionar_juegos')) accesses.push('Gestión juegos')
  if (permisos.includes('ver_mesas')) accesses.push('Ver mesas')
  if (permisos.includes('gestionar_mesas')) accesses.push('Gestión mesas')
  if (permisos.includes('ver_reservas_detalle')) accesses.push('Ver reservas y detalle')
  if (permisos.includes('crear_reservas')) accesses.push('Crear reservas')
  if (permisos.includes('gestionar_reservas')) accesses.push('Gestión reservas')
  if (permisos.includes('ver_auditoria')) {accesses.push('Ver auditoría')}
  if (permisos.includes('ver_politica_contrasenas')) {accesses.push('Ver política de contraseñas')}
  if (permisos.includes('gestionar_politica_contrasenas')) {accesses.push('Gestión de política de contraseñas')}

  return accesses

}

const openNewRolePopup = () => {
  selectedRole.value = null
  isEditingRole.value = false
  showRolePopup.value = true
}

const openEditRolePopup = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
  isEditingRole.value = true
  showRolePopup.value = true
}

const closeRolePopup = () => {
  showRolePopup.value = false
  selectedRole.value = null
}

const saveRole = async (roleData) => {
  try {
    const permissionMap = {
      verUsuarios: 'ver_usuarios',
      gestionarUsuarios: 'gestionar_usuarios',
      gestionarRoles: 'gestionar_roles',      
      verAuditoria: 'ver_auditoria',
      verPoliticaContrasenas: 'ver_politica_contrasenas',
      gestionarPoliticaContrasenas: 'gestionar_politica_contrasenas',
      verPedidos: 'ver_pedidos_detalle',
      gestionarPedidos: 'gestionar_pedidos',
      verProductos: 'ver_productos',
      gestionarProductos: 'gestionar_productos',
      verJuegos: 'ver_juegos',
      gestionarJuegos: 'gestionar_juegos',
      verMesas: 'ver_mesas',
      gestionarMesas: 'gestionar_mesas',
      verReservas: 'ver_reservas_detalle',
      crearReservas: 'crear_reservas',
      gestionarReservas: 'gestionar_reservas',
    }

    const permisos = Object.entries(roleData.accesos)
      .filter(([, value]) => value)
      .map(([key]) => permissionMap[key])

    const payload = {
      nombre: roleData.nombre,
      activo: roleData.activo,
      permisos,
    }

    if (isEditingRole.value) {
      await updateRole(roleData.id_rol, payload)
    } else {
      await createRole({
        id_rol: roleData.id_rol,
        ...payload,
      })
    }

    Swal.fire({
      title: '¡Éxito!',
      text: isEditingRole.value ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })

    closeRolePopup()
    await loadRoles()
    await authStore.refreshCurrentUser()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'No se pudo guardar el rol.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const toggleRoleStatus = (role) => {
  const newStatus = !role.activo

  Swal.fire({
    title: '¿Está seguro?',
    text: `¿Desea ${newStatus ? 'activar' : 'desactivar'} el rol "${role.nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${newStatus ? 'activar' : 'desactivar'}`,
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      await updateRole(role.id_rol, {
        nombre: role.nombre,
        activo: newStatus,
      })

      await Swal.fire({
        title: '¡Éxito!',
        text: `El rol fue ${newStatus ? 'activado' : 'desactivado'} correctamente.`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })

      await loadRoles()
      await authStore.refreshCurrentUser()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.detail || 'No se pudo actualizar el estado del rol.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })
      await loadRoles()
    }
  })
}

const confirmDeleteRole = (roleId) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de eliminar el rol?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteRole(roleId)
        await loadRoles()
        await authStore.refreshCurrentUser()
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.detail || 'No se pudo eliminar el rol.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: { confirmButton: 'swal2-confirm' },
        })
      }
    }
  })
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const loadUsers = async () => {
  try {
    users.value = await getSecurityUsers()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los usuarios.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const loadRoles = async () => {
  try {
    roles.value = await getRoles()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'No se pudieron cargar los roles.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

onMounted(async() => {
  await authStore.refreshCurrentUser()
  await loadUsers()
  await loadRoles()
})

const showEditTab = (n) => {
  currentEditTab.value = n
}

const openEditPopup = async (userId) => {
  try {
    const data = await getSecurityUserById(userId)

    editForm.value = {
      id: userId,
      name: data.nombre,
      email: data.correo,
      phone: data.telefono ?? '',
    }

    showEditPopup.value = true
    showEditTab(0)
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el usuario.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const closeEditPopup = () => {
  showEditPopup.value = false
}

const clearEditForm = () => {
  editForm.value = { id: '', name: '', email: '', phone: '' }
}

const confirmCancel = () => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar? Se perderán sus cambios.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, mantener',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      closeEditPopup()
      clearEditForm()
    }
  })
}

const confirmDelete = (userId) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de eliminar el registro?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteSecurityUser(userId)

        Swal.fire({
          title: '¡Eliminado!',
          text: 'El usuario ha sido eliminado.',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { confirmButton: 'swal2-confirm' },
        }).then(() => {
          loadUsers()
        })
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.detail || 'No se pudo eliminar el usuario.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: { confirmButton: 'swal2-confirm' },
        })
      }
    }
  })
}
</script>

<template>
  <div>
    <nav class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <div class="nav-hamburger" @click="toggleMenu">
        <i class="fa fa-bars"></i>
      </div>

      <ul class="nav-items" :class="{ 'nav-items-active': menuOpen }">
        <li><RouterLink to="/panel-seguridad">Inicio</RouterLink></li>
        <li><RouterLink to="/userspanel">Gestión de Usuarios y Roles</RouterLink></li>
        <li><RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="title">Gestión de Usuarios y Roles</div>

      <div class="role-tabs">
        <button
          v-wave
          type="button"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          Usuarios
        </button>
        <button
          v-if="canManageRoles"
          v-wave
          type="button"
          :class="{ active: activeTab === 'roles' }"
          @click="activeTab = 'roles'"
        >
          Roles y Accesos
        </button>
      </div>

      <div v-if="activeTab === 'users'">
        <div class="actions-container users-toolbar">
          <form method="GET" action="/userspanel">
            <div class="search-container">
              <input v-model="search" type="text" name="search" placeholder="Buscar usuario" />
              <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
            </div>
          </form>
          <button
            v-if="canManageUsers"
            type="button"
            class="new-user-btn"
            @click="openNewUserPopup"
          >
            <i class="fa-solid fa-user-plus"></i> Nuevo usuario
          </button>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id_usuario">
                <td>{{ user.nombre }} {{ user.primer_apellido || ''}} {{ user.segundo_apellido || '' }}</td>
                <td>{{ user.correo }}</td>
                <td>{{ user.telefono }}</td>
                <td>{{ getUserRoleLabel(user) }}</td>
                <td>
                <div v-if="canManageUsers" class="user-actions">
                  <button class="editUserBtn" @click="openEditUserPopup(user.id_usuario)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button class="mailUserBtn" @click="handleSendCredentials(user)">
                    <i class="fa-solid fa-envelope"></i>
                  </button>

                  <button class="deleteUserBtn" @click="confirmDelete(user.id_usuario)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>

                <span v-else>Solo lectura</span>
                </td>
              </tr>

              <tr v-if="filteredUsers.length === 0">
                <td colspan="5">No hay usuarios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'roles'">
        <div class="roles-toolbar">
          <div class="roles-filters">
            <input v-model="roleSearch" type="text" placeholder="Buscar rol" />

            <select v-model="roleFilter">
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          <div class="roles-header-actions">
            <button type="button" @click="openNewRolePopup">
              <i class="fa-solid fa-user-shield"></i> Nuevo rol
            </button>
          </div>
        </div>

        <div class="roles-table">
          <table>
            <thead>
              <tr>
                <th>ID Rol</th>
                <th>Nombre</th>
                <th>Activo</th>
                <th>Accesos</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredRoles.length === 0">
                <td colspan="5">No hay roles registrados.</td>
              </tr>

              <tr v-for="role in filteredRoles" :key="role.id_rol">
                <td>{{ role.id_rol }}</td>
                <td>{{ role.nombre }}</td>
                <td>
                  <label class="modern-switch">
                    <input
                      type="checkbox"
                      :checked="role.activo"
                      @click.prevent="toggleRoleStatus(role)"
                    />
                    <span class="slider"></span>
                  </label>
                </td>
                <td>
                  <div class="access-chip-list">
                    <span
                      v-for="access in getRoleAccessSummary(role).slice(0, 3)"
                      :key="access"
                      class="access-chip"
                    >
                      {{ access }}
                    </span>
                    <span
                      v-if="getRoleAccessSummary(role).length > 3"
                      class="access-chip"
                    >
                      +{{ getRoleAccessSummary(role).length - 3 }} más
                    </span>
                  </div>
                </td>
                <td>
                  <div class="role-actions">
                    <button type="button" @click="openEditRolePopup(role)">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button type="button" @click="confirmDeleteRole(role.id_rol)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <RoleFormPopup
        v-if="canManageRoles"
        :show="showRolePopup"
        :role-data="selectedRole"
        :is-editing="isEditingRole"
        @close="closeRolePopup"
        @save="saveRole"
      />

      <UserFormPopup
        v-if="canManageUsers"
        :show="showUserPopup"
        :user-data="selectedUser"
        :roles="roles"
        :is-editing="isEditingUser"
        @close="closeUserPopup"
        @save="saveUser"
      />
    </div>

    <!-- <div v-if="showEditPopup" id="editPopup" class="popup">
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="editUserImg" alt="User Icon" class="user-icon" />
        <h2>EDITAR USUARIO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span
              id="editStep1"
              class="step"
              :class="{ active: currentEditTab === 0 }"
              @click="showEditTab(0)"
            >
              1
            </span>
            <span class="step-line" :class="{ active: currentEditTab > 0 }"></span>
            <span
              id="editStep2"
              class="step"
              :class="{ active: currentEditTab === 1 }"
              @click="showEditTab(1)"
            >
              2
            </span>
            <span class="step-line" :class="{ active: currentEditTab > 1 }"></span>
            <span
              id="editStep3"
              class="step"
              :class="{ active: currentEditTab === 2 }"
              @click="showEditTab(2)"
            >
              3
            </span>
          </div>
        </div>

        <form id="editForm" method="POST" @submit="handleSubmit">
          <div v-show="currentEditTab === 0" class="tab">
            <div class="form-group">
              <label for="editName">Nombre</label>
              <input id="editName" v-model="editForm.name" type="text" name="name" required />
            </div>
          </div>

          <div v-show="currentEditTab === 1" class="tab">
            <div class="form-group">
              <label for="editEmail">Correo</label>
              <input id="editEmail" v-model="editForm.email" type="email" name="email" required />
            </div>
          </div>

          <div v-show="currentEditTab === 2" class="tab">
            <div class="form-group">
              <label for="editPhone">Teléfono</label>
              <input id="editPhone" v-model="editForm.phone" type="text" name="phone" required />
            </div>

            <div class="buttons">
              <button type="submit">Guardar Cambios</button>
              <button type="button" @click="confirmCancel">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div> -->
  </div>
</template>

<style>
.swal2-cancel {
  background-color: #192847 !important;
  color: #fff !important;
}

.swal2-confirm {
  background-color: #d48600 !important;
  color: #fff !important;
  width: 120px !important;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.table-responsive {
  margin-top: 20px;
}

.users-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.new-user-btn,
.mailUserBtn {
  background: #192847;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
}

.user-actions {
  display: flex;
  gap: 8px;
}
</style>