<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import mesaImg from '@/assets/images/mesa.png'
import comedorImg from '@/assets/images/comedor.png'

const menuOpen = ref(false)
const search = ref('')
const groupBy = ref('')
const mesas = ref([])

const showAddPopup = ref(false)
const showEditPopup = ref(false)

const regForm = ref({
  capacidad: '',
  ubicacion: '',
})

const editForm = ref({
  id: '',
  capacidad: '',
  ubicacion: '',
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const filteredMesas = computed(() => {
  let data = [...mesas.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    data = data.filter((mesa) => {
      return (
        String(mesa.id_mesa).toLowerCase().includes(query) ||
        String(mesa.capacidad).toLowerCase().includes(query) ||
        String(mesa.ubicacion).toLowerCase().includes(query)
      )
    })
  }

  if (groupBy.value === 'archivados') {
    data = data.filter((mesa) => !mesa.activo)
  }

  return data
})

const openAddPopup = () => {
  showAddPopup.value = true
}

const closePopup = () => {
  showAddPopup.value = false
}

const closeEditPopup = () => {
  showEditPopup.value = false
}

const confirmCancel = (formType) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar? Se perderán los datos.',
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
      if (formType === 'regForm') {
        closePopup()
        regForm.value = {
          capacidad: '',
          ubicacion: '',
        }
      } else if (formType === 'editForm') {
        closeEditPopup()
        editForm.value = {
          id: '',
          capacidad: '',
          ubicacion: '',
        }
      }
    }
  })
}

const showSuccessMessage = (popupId, formId, message) => {
  Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  }).then(() => {
    if (popupId === 'contactPopup') {
      closePopup()
      regForm.value = {
        capacidad: '',
        ubicacion: '',
      }
    } else if (popupId === 'editPopup') {
      closeEditPopup()
      editForm.value = {
        id: '',
        capacidad: '',
        ubicacion: '',
      }
    }
    window.location.href = '/registro_mesa'
  })
}

const handleMesaSubmit = async (event) => {
  event.preventDefault()

  const formData = new FormData()
  formData.append('capacidad', regForm.value.capacidad)
  formData.append('ubicacion', regForm.value.ubicacion)

  try {
    const response = await fetch('/add_mesa', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      showSuccessMessage('contactPopup', 'regForm', 'Producto registrado con éxito')
    } else {
      const text = await response.text()
      throw new Error(text)
    }
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al registrar el producto.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const openEditMesa = async (mesaId) => {
  try {
    const response = await fetch(`/get_mesa/${mesaId}`)
    const data = await response.json()

    editForm.value = {
      id: mesaId,
      capacidad: data.capacidad,
      ubicacion: data.ubicacion,
    }

    showEditPopup.value = true
  } catch (error) {
    console.error('Error al cargar los datos del producto:', error)
  }
}

const handleEditMesaSubmit = async (event) => {
  event.preventDefault()

  const formData = new FormData()
  formData.append('capacidad', editForm.value.capacidad)
  formData.append('ubicacion', editForm.value.ubicacion)

  try {
    const response = await fetch(`/update_mesa/${editForm.value.id}`, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      showSuccessMessage('editPopup', 'editForm', 'Producto actualizado con éxito')
    } else {
      const text = await response.text()
      throw new Error(text)
    }
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al actualizar el producto.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const confirmDelete = (event, mesaId) => {
  event.preventDefault()

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de archivar el producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, archivar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/delete_mesa/${mesaId}`, {
          method: 'POST',
        })

        if (response.ok) {
          Swal.fire('¡Archivado!', 'El producto ha sido archivado.', 'success').then(() => {
            window.location.href = '/registro_mesa'
          })
        } else {
          const text = await response.text()
          throw new Error(text)
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al archivar el producto.',
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

const confirmUnarchive = (event, mesaId) => {
  event.preventDefault()

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de desarchivar la mesa?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desarchivar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetch(`/unarchive_mesa/${mesaId}`, {
          method: 'POST',
        })
        Swal.fire('¡Desarchivado!', 'El producto ha sido desarchivado.', 'success').then(() =>
          window.location.reload()
        )
      } catch (error) {
        Swal.fire('Error', 'No se pudo desarchivar el producto.', 'error')
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
      <div class="title">Registro de mesas</div>

      <div class="actions-container">
        <form method="GET" action="/registro_mesa">
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar mesa" />
            <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
          </div>

          <div class="group-by-container">
            <label for="group_by">Agrupar por:</label>
            <select id="group_by" v-model="groupBy" name="group_by">
              <option value="">Todos</option>
              <option value="archivados">Productos Archivados</option>
            </select>
          </div>
        </form>

        <div class="add-buttons">
          <button id="addProductBtn" @click="openAddPopup">
            <i class="fa-solid fa-chair"></i> Registrar mesa
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capacidad</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="mesa in filteredMesas" :key="mesa.id_mesa">
              <td>{{ mesa.id_mesa }}</td>
              <td>{{ mesa.capacidad }}</td>
              <td>{{ mesa.ubicacion }}</td>
              <td>
                <div class="action-buttons">
                  <button class="editProductBtn" @click="openEditMesa(mesa.id_mesa)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="mesa.activo"
                    class="deleteProductBtn"
                    @click="confirmDelete($event, mesa.id_mesa)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
                    class="unarchiveProductBtn"
                    @click="confirmUnarchive($event, mesa.id_mesa)"
                  >
                    <i class="fa-solid fa-box-open"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showAddPopup" id="contactPopup" class="popup">
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="mesaImg" alt="Product Icon" class="product-icon" />
        <h2>REGISTRO DE MESA</h2>

        <form
          id="regForm"
          action="/add_mesa"
          method="POST"
          enctype="multipart/form-data"
          @submit="handleMesaSubmit"
        >
          <div class="form-group">
            <label for="capacidad">Capacidad</label>
            <input id="capacidad" v-model="regForm.capacidad" type="number" name="capacidad" required />
            <span id="error-capacidad" class="error-message"></span>
          </div>

          <div class="form-group">
            <label for="ubicacion">Ubicación</label>
            <input id="ubicacion" v-model="regForm.ubicacion" type="text" name="ubicacion" required />
            <span id="error-ubicacion" class="error-message"></span>
          </div>

          <div class="buttons">
            <button type="submit">Registrar</button>
            <button type="button" @click="confirmCancel('regForm')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditPopup" id="editPopup" class="popup">
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="comedorImg" alt="Product Icon" class="product-icon" />
        <h2>EDITAR MESA</h2>

        <form id="editForm" method="POST" @submit="handleEditMesaSubmit">
          <div class="form-group">
            <label for="edit_capacidad">Capacidad</label>
            <input
              id="edit_capacidad"
              v-model="editForm.capacidad"
              type="number"
              name="capacidad"
              required
            />
            <span id="edit-error-capacidad" class="error-message"></span>
          </div>

          <div class="form-group">
            <label for="edit_ubicacion">Ubicación</label>
            <input
              id="edit_ubicacion"
              v-model="editForm.ubicacion"
              type="text"
              name="ubicacion"
              required
            />
            <span id="edit-error-ubicacion" class="error-message"></span>
          </div>

          <div class="buttons">
            <button type="submit">Guardar Cambios</button>
            <button type="button" @click="confirmCancel('editForm')">Cancelar</button>
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

        .action-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .action-buttons button {
            background-color: var(--alt-primary-color);
            color: var(--light-color);
            border: none;
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
        }

        .action-buttons button i {
            pointer-events: none;
        }

        .search-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 10px;
            gap: 20px; 
        }

        .search-container button,
        .group-by-container button,
        .add-buttons button {
            margin-left: 10px;
            margin-right: 10px;
        }

        .add-buttons {
            display: flex;
            gap: 20px; /* Espacio entre los botones de agregar producto y categoría */
        }

        .add-product button,
        .add-category button {
            width: auto;
            background-color: var(--alt-primary-color);
            color: var(--light-color);
            font-size: 15px;
            border: none;
            padding: 10px;
            border-radius: 20px;
            cursor: pointer;
            margin-left: 10px;
            margin-right: 10px;
        }
        
        .group-by-container {
            display: flex;
            justify-content: flex-start;            
            align-items: center;
            margin-top: 10px;
            gap: 5px; 
        }

        .group-by-container label {
            font-size: 14px;
        }

        .group-by-container select {
            font-size: 14px;
            padding: 5px;
            width: 150px; /* Ajustar el tamaño del select */
        }
    </style>