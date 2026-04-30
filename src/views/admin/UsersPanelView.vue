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
  try {
    if (isEditingUser.value) {
      await updateSecurityUser(userData.id, {
        nombre: userData.nombre,
        correo: userData.correo,
        telefono: userData.telefono ? Number(userData.telefono) : null,
        rol_id_rol: userData.rol_id_rol,
      })
    } else {
    await createSecurityUser({
      nombre: userData.nombre,
      primer_apellido: userData.primer_apellido,
      segundo_apellido: userData.segundo_apellido || null,
      correo_contacto: userData.correo_contacto.trim().toLowerCase(),
      codigo_verificacion: userData.codigo_verificacion.trim(),
      telefono: userData.telefono ? Number(userData.telefono) : null,
      rol_id_rol: userData.rol_id_rol,
      enviar_credenciales: !!userData.enviarCredenciales,
    })
    }

    if (userData.enviarCredenciales && userData.id) {
      try {
        await sendUserCredentials(userData.id)
      } catch {
        // placeholder por ahora
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
  if (permisos.includes('gestionar_usuarios_roles')) accesses.push('Gestión usuarios y roles')
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
      gestionarUsuariosRoles: 'gestionar_usuarios_roles',
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

onMounted(() => {
  loadUsers()
  loadRoles()
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

const handleSubmit = async (event) => {
  event.preventDefault()

  try {
await updateSecurityUser(userData.id, {
  nombre: userData.nombre,
  primer_apellido: userData.primer_apellido,
  segundo_apellido: userData.segundo_apellido || null,
  telefono: userData.telefono ? Number(userData.telefono) : null,
  rol_id_rol: userData.rol_id_rol,
})

    Swal.fire({
      title: '¡Éxito!',
      text: 'Cambios guardados con éxito',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    }).then(() => {
      closeEditPopup()
      clearEditForm()
      loadUsers()
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al guardar los cambios.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
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

          <button type="button" class="new-user-btn" @click="openNewUserPopup">
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
                  <div class="user-actions">
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
        :show="showRolePopup"
        :role-data="selectedRole"
        :is-editing="isEditingRole"
        @close="closeRolePopup"
        @save="saveRole"
      />

      <UserFormPopup
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