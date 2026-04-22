<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/userspanel.css'
import '@/assets/css/popup.css'
import logo from '@/assets/images/logo.png'
import editUserImg from '@/assets/images/editar_usuario.png'
import {
  deleteSecurityUser,
  getSecurityUserById,
  getSecurityUsers,
  updateSecurityUser,
} from '@/services/users.service'

const menuOpen = ref(false)
const search = ref('')
const users = ref([])
const showEditPopup = ref(false)
const currentEditTab = ref(0)

const editForm = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
})

const filteredUsers = computed(() => {
  if (!search.value.trim()) {
    return users.value
  }

  const query = search.value.toLowerCase()

  return users.value.filter((user) => {
    return (
      String(user.nombre).toLowerCase().includes(query) ||
      String(user.correo).toLowerCase().includes(query) ||
      String(user.telefono ?? '').toLowerCase().includes(query)
    )
  })
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const loadUsers = async () => {
  try {
    users.value = await getSecurityUsers()
  } catch (error) {
    console.error('Error loading users:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los usuarios.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

onMounted(() => {
  loadUsers()
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
    console.error('Error loading the user data:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el usuario.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const closeEditPopup = () => {
  showEditPopup.value = false
}

const clearEditForm = () => {
  editForm.value = {
    id: '',
    name: '',
    email: '',
    phone: '',
  }
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

const showSuccessMessage = (message) => {
  Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  }).then(() => {
    closeEditPopup()
    clearEditForm()
    loadUsers()
  })
}

const handleSubmit = async (event) => {
  event.preventDefault()

  try {
    await updateSecurityUser(editForm.value.id, {
      nombre: editForm.value.name,
      correo: editForm.value.email,
      telefono: editForm.value.phone ? Number(editForm.value.phone) : null,
    })

    showSuccessMessage('Cambios guardados con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al guardar los cambios.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
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
          customClass: {
            confirmButton: 'swal2-confirm',
          },
        }).then(() => {
          loadUsers()
        })
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.detail || 'No se pudo eliminar el usuario.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'swal2-confirm',
          },
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
        <li><RouterLink to="/adminpanel">Inicio</RouterLink></li>
        <li><RouterLink to="/userspanel">Usuarios</RouterLink></li>
        <li><RouterLink to="/game_panel">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>
        <li><RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="title">Panel de Usuarios</div>

      <div class="actions-container">
        <form method="GET" action="/userspanel">
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar usuario" />
            <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
          </div>
        </form>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id_usuario">
              <td>{{ user.nombre }}</td>
              <td>{{ user.correo }}</td>
              <td>{{ user.telefono }}</td>
              <td>
                <button class="editUserBtn" @click="openEditPopup(user.id_usuario)">
                  <i class="fa-solid fa-edit"></i>
                </button>
<button class="deleteUserBtn" @click="confirmDelete(user.id_usuario)">
  <i class="fa-solid fa-trash"></i>
</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showEditPopup" id="editPopup" class="popup">
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
              <span id="error-edit-name" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentEditTab === 1" class="tab">
            <div class="form-group">
              <label for="editEmail">Correo</label>
              <input id="editEmail" v-model="editForm.email" type="email" name="email" required />
              <span id="error-edit-email" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentEditTab === 2" class="tab">
            <div class="form-group">
              <label for="editPhone">Teléfono</label>
              <input id="editPhone" v-model="editForm.phone" type="text" name="phone" required />
              <span id="error-edit-phone" class="error-message"></span>
            </div>

            <div class="buttons">
              <button type="submit">Guardar Cambios</button>
              <button type="button" @click="confirmCancel">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
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
    </style>