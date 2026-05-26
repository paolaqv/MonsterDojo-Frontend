<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import menuImg from '@/assets/images/espadas.png'
import editImg from '@/assets/images/dados.png'
import categoryImg from '@/assets/images/category.png'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import { usePermissions } from '@/composables/usePermissions'
import {
  createGame,
  createGameCategory,
  deleteGame,
  getGameById,
  getGameCategories,
  getGames,
  updateGame,
} from '@/services/games.service'
import { uploadImage } from '@/services/uploads.service'

const { hasPermission, hasRole } = usePermissions()

const canViewGames = computed(() => hasPermission('ver_juegos'))
const canManageGames = computed(() => hasPermission('gestionar_juegos'))
// Las categorias de juegos se administran con el mismo permiso de juegos
const canManageGameCategories = computed(() => hasPermission('gestionar_juegos'))

const homeRoute = computed(() => {
  if (hasRole('mesero')) return '/panel-mesero'
  if (hasRole('encargadoLocal')) return '/adminpanel'
  if (hasRole('encargadoSeguridad')) return '/panel-seguridad'
  return '/login'
})

const profileRoute = computed(() => {
  if (hasRole('encargadoLocal') || hasRole('encargadoSeguridad')) return '/perfil_admin'
  return '/perfil_usuario'
})

const search = ref('')
const groupBy = ref('')
const categorias = ref([])
const juegos = ref([])

const showAddGamePopup = ref(false)
const showEditGamePopup = ref(false)
const showCategoryPopup = ref(false)

const currentTab = ref(0)
const currentEditTab = ref(0)

const regForm = ref({
  nombre: '',
  descripcion: '',
  precio_alquiler: '',
  precio_venta: '',
  disponible_venta: false,
  imagen: null,
  categoria: '',
})

const editForm = ref({
  id: '',
  nombre: '',
  descripcion: '',
  precio_alquiler: '',
  precio_venta: '',
  disponible_venta: false,
  imagen: null,
  categoria: '',
  imagenActual: '',
  activo: true,
})

const categoryForm = ref({
  nombre: '',
})

const normalizeImage = (imagen) => {
  if (!imagen) return ''

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:image')
  ) {
    return imagen
  }

  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
  const apiBase = base.replace('/api/v1', '')

  if (imagen.startsWith('/')) {
    return `${apiBase}${imagen}`
  }

  return `${apiBase}/${imagen}`
}

const uploadAndGetUrl = async (file) => {
  if (!file) return ''
  const { url } = await uploadImage(file, 'juego')
  return url
}

const loadData = async () => {
  try {
    const [categoriasData, juegosData] = await Promise.all([
      getGameCategories(),
      getGames(),
    ])

    categorias.value = Array.isArray(categoriasData)
      ? categoriasData
      : categoriasData?.items || categoriasData?.results || []

    const juegosArray = Array.isArray(juegosData)
      ? juegosData
      : juegosData?.items || juegosData?.results || []

    juegos.value = juegosArray.map((juego) => ({
      ...juego,
      imagen: normalizeImage(juego.imagen),
    }))
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'No se pudieron cargar los juegos.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const filteredJuegos = computed(() => {
  let data = [...juegos.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    data = data.filter((juego) =>
      `${juego.nombre} ${juego.descripcion}`.toLowerCase().includes(query)
    )
  }

  if (groupBy.value === 'archivados') {
    data = data.filter((juego) => !juego.activo)
  } else if (groupBy.value) {
    data = data.filter(
      (juego) =>
        String(
          juego.categoria_juego_id_catJuego ??
            juego.categoria_juego?.id_catJuego ??
            juego.categoria_juego?.id_categoria
        ) === String(groupBy.value)
    )
  }

  return data
})

const openAddGamePopup = () => {
  if (!canManageGames.value) return
  showAddGamePopup.value = true
  currentTab.value = 0
}

const openCategoryPopup = () => {
  if (!canManageGameCategories.value) return
  showCategoryPopup.value = true
}

const closePopup = () => {
  showAddGamePopup.value = false
}

const closeEditPopup = () => {
  showEditGamePopup.value = false
}

const closeCategoryPopup = () => {
  showCategoryPopup.value = false
}

const clearForm = () => {
  regForm.value = {
    nombre: '',
    descripcion: '',
    precio_alquiler: '',
    precio_venta: '',
    disponible_venta: false,
    imagen: null,
    categoria: '',
  }
}

const clearEditForm = () => {
  editForm.value = {
    id: '',
    nombre: '',
    descripcion: '',
    precio_alquiler: '',
    precio_venta: '',
    disponible_venta: false,
    imagen: null,
    categoria: '',
    imagenActual: '',
    activo: true,
  }
}

const clearCategoryForm = () => {
  categoryForm.value = {
    nombre: '',
  }
}

const showTab = (n) => {
  currentTab.value = n
}

const showEditTab = (n) => {
  currentEditTab.value = n
}

const confirmCancel = (formType) => {
  let confirmMessage = '¿Está seguro de cancelar? Se perderán los datos.'

  if (formType === 'editForm') {
    confirmMessage = '¿Está seguro de cancelar? Se perderán sus cambios.'
  }

  Swal.fire({
    title: '¿Está seguro?',
    text: confirmMessage,
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
        clearForm()
      } else if (formType === 'editForm') {
        closeEditPopup()
        clearEditForm()
      } else {
        closeCategoryPopup()
        clearCategoryForm()
      }
    }
  })
}

const handleRegImageChange = (event) => {
  regForm.value.imagen = event.target.files[0] || null
}

const handleEditImageChange = (event) => {
  editForm.value.imagen = event.target.files[0] || null
}

const showSuccessMessage = (popupType, message) => {
  Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  }).then(async () => {
    if (popupType === 'contactPopup') {
      closePopup()
      clearForm()
    } else if (popupType === 'editPopup') {
      closeEditPopup()
      clearEditForm()
    } else {
      closeCategoryPopup()
      clearCategoryForm()
    }

    await loadData()
  })
}

const handleGameSubmit = async (event) => {
  event.preventDefault()
  if (!canManageGames.value) return

  try {
    const imagenUrl = await uploadAndGetUrl(regForm.value.imagen)

    await createGame({
      nombre: regForm.value.nombre,
      descripcion: regForm.value.descripcion,
      precio_alquiler: Number(regForm.value.precio_alquiler),
      precio_venta: Number(regForm.value.precio_venta || 0),
      disponible_venta: !!regForm.value.disponible_venta,
      imagen: imagenUrl,
      categoria_juego_id_catJuego: Number(regForm.value.categoria),
      activo: true,
    })

    showSuccessMessage('contactPopup', 'Juego registrado con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al registrar el juego.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const handleCategorySubmit = async (event) => {
  event.preventDefault()
  if (!canManageGameCategories.value) return

  try {
    await createGameCategory({
      nombre: categoryForm.value.nombre,
    })

    showSuccessMessage('categoryPopup', 'Categoría registrada con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al registrar la categoría.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const openEditPopup = async (gameId) => {
  if (!canManageGames.value) return

  try {
    const data = await getGameById(gameId)

    editForm.value.id = gameId
    editForm.value.nombre = data.nombre
    editForm.value.descripcion = data.descripcion
    editForm.value.precio_alquiler = data.precio_alquiler
    editForm.value.precio_venta = data.precio_venta ?? 0
    editForm.value.disponible_venta = !!data.disponible_venta
    editForm.value.categoria =
      data.categoria_juego_id_catJuego ??
      data.categoria_juego?.id_catJuego ??
      data.categoria_juego?.id_categoria ??
      ''
    editForm.value.imagen = null
    editForm.value.imagenActual = data.imagen || ''
    editForm.value.activo = data.activo ?? true

    showEditGamePopup.value = true
    currentEditTab.value = 0
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Error al cargar los datos del juego.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const handleEditGameSubmit = async (event) => {
  event.preventDefault()
  if (!canManageGames.value) return

  try {
    const nuevaImagen = editForm.value.imagen
      ? await uploadAndGetUrl(editForm.value.imagen)
      : editForm.value.imagenActual

    await updateGame(editForm.value.id, {
      nombre: editForm.value.nombre,
      descripcion: editForm.value.descripcion,
      precio_alquiler: Number(editForm.value.precio_alquiler),
      precio_venta: Number(editForm.value.precio_venta || 0),
      disponible_venta: !!editForm.value.disponible_venta,
      imagen: nuevaImagen,
      categoria_juego_id_catJuego: Number(editForm.value.categoria),
      activo: editForm.value.activo,
    })

    showSuccessMessage('editPopup', 'Juego actualizado con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al actualizar el juego.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })
  }
}

const confirmDelete = (event, juego) => {
  event.preventDefault()
  if (!canManageGames.value) return

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de archivar el juego?',
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
        await deleteGame(juego.id_juego)

        Swal.fire('¡Archivado!', 'El juego ha sido archivado.', 'success')
        await loadData()
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.error?.message || 'Hubo un problema al archivar el juego.',
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

const confirmUnarchive = (event, juego) => {
  event.preventDefault()
  if (!canManageGames.value) return

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de desarchivar el juego?',
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
        await updateGame(juego.id_juego, {
          nombre: juego.nombre,
          descripcion: juego.descripcion,
          precio_alquiler: Number(juego.precio_alquiler),
          imagen: juego.imagen,
          categoria_juego_id_catJuego:
            juego.categoria_juego_id_catJuego ??
            juego.categoria_juego?.id_catJuego ??
            juego.categoria_juego?.id_categoria,
          activo: true,
        })

        Swal.fire('¡Desarchivado!', 'El juego ha sido desarchivado.', 'success')
        await loadData()
      } catch (error) {
        Swal.fire('Error', 'No se pudo desarchivar el juego.', 'error')
      }
    }
  })
}

onMounted(async () => {
  if (!canViewGames.value) return
  await loadData()
})
</script>

<template>
  <div>
    <StaffNavbar :homeRoute="homeRoute" :profileRoute="profileRoute" />

    <div class="container">
      <div class="title">Panel de Juegos</div>

      <div class="actions-container">
        <form @submit.prevent>
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar juego" />
            <button type="button">Buscar <i class="fa-solid fa-search"></i></button>
          </div>

          <div class="group-by-container">
            <label for="group_by">Agrupar por:</label>
            <select id="group_by" v-model="groupBy" name="group_by">
              <option value="">Todos</option>
              <option value="archivados">Productos Archivados</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catJuego"
                :value="categoria.id_catJuego"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>
        </form>

        <div v-if="canManageGames || canManageGameCategories" class="add-buttons">
          <button v-if="canManageGames" id="addGameBtn" type="button" @click="openAddGamePopup">
            <i class="fa-solid fa-dice"></i> Agregar Juego
          </button>
          <button
            v-if="canManageGameCategories"
            id="addCategoryBtn"
            type="button"
            @click="openCategoryPopup"
          >
            <i class="fa-solid fa-list"></i> Agregar Categoría
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Alquiler</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th v-if="canManageGames">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredJuegos.length === 0">
              <td :colspan="canManageGames ? 7 : 6">No hay juegos disponibles.</td>
            </tr>

            <tr v-for="juego in filteredJuegos" :key="juego.id_juego">
              <td>{{ juego.id_juego }}</td>
              <td>{{ juego.nombre }}</td>
              <td>{{ juego.descripcion }}</td>
              <td>{{ juego.precio_alquiler }}</td>
              <td>
                <img :src="juego.imagen" :alt="`Imagen de ${juego.nombre}`" width="100" />
              </td>
              <td>{{ juego.categoria_juego?.nombre }}</td>

              <td v-if="canManageGames">
                <div class="action-buttons">
                  <button type="button" class="editGameBtn" @click="openEditPopup(juego.id_juego)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="juego.activo"
                    type="button"
                    class="deleteGameBtn"
                    @click="confirmDelete($event, juego)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
                    type="button"
                    class="unarchiveProductBtn"
                    @click="confirmUnarchive($event, juego)"
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

    <Teleport to="body">
    <div
      v-show="showAddGamePopup && canManageGames"
      class="popup"
      id="contactPopup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Game Icon" class="product-icon" />
        <h2>REGISTRO NUEVO JUEGO</h2>

        <form id="regForm" @submit.prevent="handleGameSubmit">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="regForm.nombre" type="text" maxlength="50" required />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <input id="descripcion" v-model="regForm.descripcion" type="text" maxlength="500" required />
          </div>

          <div class="form-group">
            <label for="precio_alquiler">Precio Alquiler</label>
            <input id="precio_alquiler" v-model="regForm.precio_alquiler" type="number" step="0.01" min="0" max="100000" required />
          </div>

          <div class="form-group">
            <label for="precio_venta">Precio Venta</label>
            <input id="precio_venta" v-model="regForm.precio_venta" type="number" step="0.01" min="0" max="100000" required />
          </div>

          <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input id="disponible_venta" v-model="regForm.disponible_venta" type="checkbox" />
            <label for="disponible_venta" style="margin:0;">Disponible para venta</label>
          </div>

          <div class="form-group">
            <label for="categoria">Categoría</label>
            <select id="categoria" v-model="regForm.categoria" required>
              <option disabled value="">Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catJuego"
                :value="categoria.id_catJuego"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="imagen">Imagen</label>
            <input
              id="imagen"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              required
              @change="handleRegImageChange"
            />
          </div>

          <div class="buttons">
            <button type="submit">Registrar</button>
            <button type="button" @click="confirmCancel('regForm')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div
      v-show="showEditGamePopup && canManageGames"
      class="popup"
      id="editPopup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="editImg" alt="Game Icon" class="product-icon" />
        <h2>EDITAR JUEGO</h2>

        <form id="editForm" @submit.prevent="handleEditGameSubmit">
          <div class="form-group">
            <label for="edit_nombre">Nombre</label>
            <input id="edit_nombre" v-model="editForm.nombre" type="text" maxlength="50" required />
          </div>

          <div class="form-group">
            <label for="edit_descripcion">Descripción</label>
            <input id="edit_descripcion" v-model="editForm.descripcion" type="text" maxlength="500" required />
          </div>

          <div class="form-group">
            <label for="edit_precio_alquiler">Precio Alquiler</label>
            <input id="edit_precio_alquiler" v-model="editForm.precio_alquiler" type="number" step="0.01" min="0" max="100000" required />
          </div>

          <div class="form-group">
            <label for="edit_precio_venta">Precio Venta</label>
            <input id="edit_precio_venta" v-model="editForm.precio_venta" type="number" step="0.01" min="0" max="100000" required />
          </div>

          <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input id="edit_disponible_venta" v-model="editForm.disponible_venta" type="checkbox" />
            <label for="edit_disponible_venta" style="margin:0;">Disponible para venta</label>
          </div>

          <div class="form-group">
            <label for="edit_categoria">Categoría</label>
            <select id="edit_categoria" v-model="editForm.categoria" required>
              <option disabled value="">Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catJuego"
                :value="categoria.id_catJuego"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit_imagen">Imagen (opcional, deja vacío para mantener la actual)</label>
            <input
              id="edit_imagen"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              @change="handleEditImageChange"
            />
            <img
              v-if="editForm.imagenActual && !editForm.imagen"
              :src="editForm.imagenActual"
              alt="Imagen actual"
              style="margin-top:8px; max-width:120px; border-radius:6px;"
            />
          </div>

          <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input id="edit_activo" v-model="editForm.activo" type="checkbox" />
            <label for="edit_activo" style="margin:0;">Juego activo</label>
          </div>

          <div class="buttons">
            <button type="submit">Guardar Cambios</button>
            <button type="button" @click="confirmCancel('editForm')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div
      v-show="showCategoryPopup && canManageGameCategories"
      class="popup"
      id="categoryPopup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closeCategoryPopup">&times;</span>
        <img :src="categoryImg" alt="Category Icon" class="product-icon" />
        <h2>REGISTRO NUEVA CATEGORÍA</h2>

        <form id="categoryForm" @submit.prevent="handleCategorySubmit">
          <div class="form-group">
            <label for="categoria_nombre">Nombre de la categoría</label>
            <input
              id="categoria_nombre"
              v-model="categoryForm.nombre"
              type="text"
              required
            />
          </div>

          <div class="buttons">
            <button type="submit">Registrar</button>
            <button type="button" @click="confirmCancel('categoryForm')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
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
.add-buttons button {
  margin-left: 10px;
  margin-right: 10px;
}
.add-buttons {
  display: flex;
  gap: 20px;
}
.form-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 15px;
}
.form-group label {
  margin-right: 10px;
}
.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
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
  width: 150px;
}
</style>