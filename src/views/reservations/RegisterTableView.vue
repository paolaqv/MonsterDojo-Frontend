<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import '@/assets/css/popup_panel.css'
import mesaImg from '@/assets/images/mesa.png'
import comedorImg from '@/assets/images/comedor.png'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import { usePermissions } from '@/composables/usePermissions'
import {
  archiveTable,
  createTable,
  getTableById,
  getTables,
  unarchiveTable,
  updateTable,
} from '@/services/tables.service'

const { hasPermission, hasRole } = usePermissions()

const loading = ref(false)
const errorMessage = ref('')
const search = ref('')
const groupBy = ref('')
const mesas = ref([])

const canManageTables = computed(() => hasPermission('gestionar_mesas'))
const homeRoute = computed(() =>
  hasRole('encargadoLocal') ? '/adminpanel' : '/panel-mesero'
)

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

const loadTables = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getTables()
    mesas.value = Array.isArray(data) ? data : data?.items || data?.results || []
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar las mesas.'
  } finally {
    loading.value = false
  }
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
  if (!canManageTables.value) return
  showAddPopup.value = true
}

const closePopup = () => {
  showAddPopup.value = false
}

const closeEditPopup = () => {
  showEditPopup.value = false
}

const resetRegForm = () => {
  regForm.value = {
    capacidad: '',
    ubicacion: '',
  }
}

const resetEditForm = () => {
  editForm.value = {
    id: '',
    capacidad: '',
    ubicacion: '',
  }
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
    if (!result.isConfirmed) return

    if (formType === 'regForm') {
      closePopup()
      resetRegForm()
    } else if (formType === 'editForm') {
      closeEditPopup()
      resetEditForm()
    }
  })
}

const handleMesaSubmit = async (event) => {
  event.preventDefault()
  if (!canManageTables.value) return

  try {
    await createTable({
      capacidad: Number(regForm.value.capacidad),
      ubicacion: regForm.value.ubicacion,
    })

    await Swal.fire({
      title: '¡Éxito!',
      text: 'Mesa registrada con éxito.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })

    closePopup()
    resetRegForm()
    await loadTables()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al registrar la mesa.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const openEditMesa = async (mesaId) => {
  if (!canManageTables.value) return

  try {
    const data = await getTableById(mesaId)

    editForm.value = {
      id: mesaId,
      capacidad: data.capacidad,
      ubicacion: data.ubicacion,
    }

    showEditPopup.value = true
  } catch (error) {
    Swal.fire('Error', 'No se pudo cargar la mesa.', 'error')
  }
}

const handleEditMesaSubmit = async (event) => {
  event.preventDefault()
  if (!canManageTables.value) return

  try {
    await updateTable(editForm.value.id, {
      capacidad: Number(editForm.value.capacidad),
      ubicacion: editForm.value.ubicacion,
    })

    await Swal.fire({
      title: '¡Éxito!',
      text: 'Mesa actualizada con éxito.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })

    closeEditPopup()
    resetEditForm()
    await loadTables()
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al actualizar la mesa.',
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
  if (!canManageTables.value) return

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de archivar la mesa?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, archivar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      await archiveTable(mesaId)
      await Swal.fire('¡Archivado!', 'La mesa ha sido archivada.', 'success')
      await loadTables()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.detail || 'Hubo un problema al archivar la mesa.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal2-confirm',
        },
      })
    }
  })
}

const confirmUnarchive = (event, mesaId) => {
  event.preventDefault()
  if (!canManageTables.value) return

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
    if (!result.isConfirmed) return

    try {
      await unarchiveTable(mesaId)
      await Swal.fire('¡Desarchivado!', 'La mesa ha sido desarchivada.', 'success')
      await loadTables()
    } catch (error) {
      Swal.fire(
        'Error',
        error?.response?.data?.detail || 'No se pudo desarchivar la mesa.',
        'error'
      )
    }
  })
}

onMounted(async () => {
  await loadTables()
})
</script>

<template>
  <div>
    <StaffNavbar :homeRoute="homeRoute" profileRoute="/perfil_admin" />

    <div class="container">
      <div class="title">Registro de mesas</div>

      <div class="actions-container">
        <form @submit.prevent>
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar mesa" />
            <button type="button">Buscar <i class="fa-solid fa-search"></i></button>
          </div>

          <div class="group-by-container">
            <label for="group_by">Agrupar por:</label>
            <select id="group_by" v-model="groupBy" name="group_by">
              <option value="">Todos</option>
              <option value="archivados">Mesas Archivadas</option>
            </select>
          </div>
        </form>

<div v-if="canManageTables" class="add-buttons">
          <button id="addProductBtn" type="button" @click="openAddPopup">
            <i class="fa-solid fa-chair"></i> Registrar mesa
          </button>
        </div>
      </div>

      <div v-if="loading">Cargando mesas...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capacidad</th>
              <th>Ubicación</th>
              <th v-if="canManageTables">Acciones</th>            
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredMesas.length === 0">
              <td :colspan="canManageTables ? 4 : 3">No hay mesas registradas.</td>
            </tr>

            <tr v-for="mesa in filteredMesas" :key="mesa.id_mesa">
              <td>{{ mesa.id_mesa }}</td>
              <td>{{ mesa.capacidad }}</td>
              <td>{{ mesa.ubicacion }}</td>
              <td v-if="canManageTables">
                <div class="action-buttons">
                  <button type="button" class="editProductBtn" @click="openEditMesa(mesa.id_mesa)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="mesa.activo"
                    type="button"
                    class="deleteProductBtn"
                    @click="confirmDelete($event, mesa.id_mesa)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
                    type="button"
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
        <img :src="mesaImg" alt="Mesa Icon" class="product-icon" />
        <h2>REGISTRO DE MESA</h2>

        <form id="regForm" @submit="handleMesaSubmit">
          <div class="form-group">
            <label for="capacidad">Capacidad</label>
            <input id="capacidad" v-model="regForm.capacidad" type="number" name="capacidad" required />
          </div>

          <div class="form-group">
            <label for="ubicacion">Ubicación</label>
            <input id="ubicacion" v-model="regForm.ubicacion" type="text" name="ubicacion" required />
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
        <img :src="comedorImg" alt="Comedor Icon" class="product-icon" />
        <h2>EDITAR MESA</h2>

        <form id="editForm" @submit="handleEditMesaSubmit">
          <div class="form-group">
            <label for="edit_capacidad">Capacidad</label>
            <input
              id="edit_capacidad"
              v-model="editForm.capacidad"
              type="number"
              name="capacidad"
              required
            />
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
    <style scoped>
.popup {
  display: flex !important;
  justify-content: center;
  align-items: center;
  position: fixed !important;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 3000 !important;
}

.popup-content {
  position: relative;
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #1c1c1c;
  border-radius: 10px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  color: #faf7e6;
}

.product-icon {
  width: 100px;
  height: 100px;
  display: block;
  margin: 0 auto 20px;
}
</style>