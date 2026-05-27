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
import { useAuthStore } from '@/stores/auth'
import {
  createGame,
  createGameCategory,
  getGameById,
  getGameCategories,
  getGames,
  updateGame,
  uploadGameImage,
} from '@/services/games.service'

const { hasPermission, hasRole } = usePermissions()

/*
 * Permisos del módulo.
 * Todas las acciones funcionales de juegos dependen de permisos,
 * no de un rol predefinido.
 */
const canViewGames = computed(() => hasPermission('ver_juegos'))
const canManageGames = computed(() => hasPermission('gestionar_juegos'))


const homeRoute = computed(() => authStore.getDefaultRouteByRole())

const profileRoute = computed(() => {
  if (hasRole('encargadoLocal') || hasRole('encargadoSeguridad')) {
    return '/perfil_admin'
  }

  return '/perfil_usuario'
})

const loading = ref(false)
const errorMessage = ref('')

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

const getCategoryName = (juego) => {
  if (juego.categoria_juego?.nombre) {
    return juego.categoria_juego.nombre
  }

  const categoryId =
    juego.categoria_juego_id_catJuego ??
    juego.categoria_juego?.id_catJuego ??
    juego.categoria_juego?.id_categoria

  const categoria = categorias.value.find(
    (item) => String(item.id_catJuego) === String(categoryId)
  )

  return categoria?.nombre || 'Sin categoría'
}

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.error?.message ||
    error?.message ||
    fallbackMessage
  )
}

const loadData = async () => {
  if (!canViewGames.value) {
    errorMessage.value = 'No cuenta con permiso para visualizar juegos.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

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
    errorMessage.value = getErrorMessage(
      error,
      'No se pudieron cargar los juegos.'
    )
  } finally {
    loading.value = false
  }
}

const filteredJuegos = computed(() => {
  let data = [...juegos.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()

    data = data.filter((juego) =>
      `${juego.nombre} ${juego.descripcion}`
        .toLowerCase()
        .includes(query)
    )
  }

  if (groupBy.value === 'archivados') {
    data = data.filter((juego) => !juego.activo)
  } else if (groupBy.value) {
    data = data.filter((juego) => {
      const categoryId =
        juego.categoria_juego_id_catJuego ??
        juego.categoria_juego?.id_catJuego ??
        juego.categoria_juego?.id_categoria

      return String(categoryId) === String(groupBy.value)
    })
  }

  return data
})

const openAddGamePopup = () => {
  if (!canManageGames.value) return

  currentTab.value = 0
  showAddGamePopup.value = true
}

const openCategoryPopup = () => {
  if (!canManageGames.value) return

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

const showTab = (step) => {
  currentTab.value = step
}

const showEditTab = (step) => {
  currentEditTab.value = step
}

const confirmCancel = (formType) => {
  const confirmMessage =
    formType === 'editForm'
      ? '¿Está seguro de cancelar? Se perderán sus cambios.'
      : '¿Está seguro de cancelar? Se perderán los datos.'

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
    if (!result.isConfirmed) return

    if (formType === 'regForm') {
      closePopup()
      clearForm()
      return
    }

    if (formType === 'editForm') {
      closeEditPopup()
      clearEditForm()
      return
    }

    closeCategoryPopup()
    clearCategoryForm()
  })
}

const handleRegImageChange = (event) => {
  regForm.value.imagen = event.target.files[0] || null
}

const handleEditImageChange = (event) => {
  editForm.value.imagen = event.target.files[0] || null
}

const showSuccessMessage = async (popupType, message) => {
  await Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  })

  if (popupType === 'gamePopup') {
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
}

const handleGameSubmit = async (event) => {
  event.preventDefault()

  if (!canManageGames.value) return

  try {
    if (!regForm.value.imagen) {
      throw new Error('Debe seleccionar una imagen para el juego.')
    }

    const uploadedImage = await uploadGameImage(regForm.value.imagen)

    await createGame({
      nombre: regForm.value.nombre.trim(),
      descripcion: regForm.value.descripcion.trim(),
      precio_alquiler: Number(regForm.value.precio_alquiler),
      precio_venta: Number(regForm.value.precio_venta),
      disponible_venta: Boolean(regForm.value.disponible_venta),
      imagen: uploadedImage.url,
      categoria_juego_id_catJuego: Number(regForm.value.categoria),
      activo: true,
    })

    await showSuccessMessage('gamePopup', 'Juego registrado con éxito.')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(error, 'Hubo un problema al registrar el juego.'),
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

  if (!canManageGames.value) return

  try {
    await createGameCategory({
      nombre: categoryForm.value.nombre.trim(),
    })

    await showSuccessMessage(
      'categoryPopup',
      'Categoría registrada con éxito.'
    )
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(
        error,
        'Hubo un problema al registrar la categoría.'
      ),
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

    editForm.value = {
      id: data.id_juego ?? gameId,
      nombre: data.nombre ?? '',
      descripcion: data.descripcion ?? '',
      precio_alquiler: data.precio_alquiler ?? '',
      precio_venta: data.precio_venta ?? '',
      disponible_venta: data.disponible_venta ?? false,
      imagen: null,
      categoria: String(
        data.categoria_juego_id_catJuego ??
          data.categoria_juego?.id_catJuego ??
          data.categoria_juego?.id_categoria ??
          ''
      ),
      imagenActual: data.imagen ?? '',
      activo: data.activo ?? true,
    }

    currentEditTab.value = 0
    showEditGamePopup.value = true
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(error, 'Error al cargar los datos del juego.'),
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const handleEditGameSubmit = async (event) => {
  event.preventDefault()

  if (!canManageGames.value) return

  try {
    let imagenUrl = editForm.value.imagenActual

    if (editForm.value.imagen) {
      const uploadedImage = await uploadGameImage(editForm.value.imagen)
      imagenUrl = uploadedImage.url
    }

    await updateGame(editForm.value.id, {
      nombre: editForm.value.nombre.trim(),
      descripcion: editForm.value.descripcion.trim(),
      precio_alquiler: Number(editForm.value.precio_alquiler),
      precio_venta: Number(editForm.value.precio_venta),
      disponible_venta: Boolean(editForm.value.disponible_venta),
      imagen: imagenUrl,
      categoria_juego_id_catJuego: Number(editForm.value.categoria),
      activo: editForm.value.activo,
    })

    await showSuccessMessage('editPopup', 'Juego actualizado con éxito.')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(
        error,
        'Hubo un problema al actualizar el juego.'
      ),
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
    if (!result.isConfirmed) return

    try {
      await updateGame(juego.id_juego, {
        nombre: juego.nombre,
        descripcion: juego.descripcion,
        precio_alquiler: Number(juego.precio_alquiler),
        precio_venta: Number(juego.precio_venta),
        disponible_venta: Boolean(juego.disponible_venta),
        imagen: juego.imagen,
        categoria_juego_id_catJuego:
          juego.categoria_juego_id_catJuego ??
          juego.categoria_juego?.id_catJuego ??
          juego.categoria_juego?.id_categoria,
        activo: false,
      })

      await Swal.fire('¡Archivado!', 'El juego ha sido archivado.', 'success')
      await loadData()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: getErrorMessage(
          error,
          'Hubo un problema al archivar el juego.'
        ),
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal2-confirm',
        },
      })
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
    if (!result.isConfirmed) return

    try {
      await updateGame(juego.id_juego, {
        nombre: juego.nombre,
        descripcion: juego.descripcion,
        precio_alquiler: Number(juego.precio_alquiler),
        precio_venta: Number(juego.precio_venta),
        disponible_venta: Boolean(juego.disponible_venta),
        imagen: juego.imagen,
        categoria_juego_id_catJuego:
          juego.categoria_juego_id_catJuego ??
          juego.categoria_juego?.id_catJuego ??
          juego.categoria_juego?.id_categoria,
        activo: true,
      })

      await Swal.fire(
        '¡Desarchivado!',
        'El juego ha sido desarchivado.',
        'success'
      )

      await loadData()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: getErrorMessage(
          error,
          'No se pudo desarchivar el juego.'
        ),
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal2-confirm',
        },
      })
    }
  })
}

onMounted(async () => {
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
            <input
              v-model="search"
              type="text"
              name="search"
              placeholder="Buscar juego"
            />

            <button type="button">
              Buscar <i class="fa-solid fa-search"></i>
            </button>
          </div>

          <div class="group-by-container">
            <label for="group_by">Agrupar por:</label>

            <select id="group_by" v-model="groupBy" name="group_by">
              <option value="">Todos</option>
              <option value="archivados">Juegos Archivados</option>

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

        <div v-if="canManageGames" class="add-buttons">
          <button
            id="addGameBtn"
            type="button"
            @click="openAddGamePopup"
          >
            <i class="fa-solid fa-dice"></i> Agregar Juego
          </button>

          <button
            id="addCategoryBtn"
            type="button"
            @click="openCategoryPopup"
          >
            <i class="fa-solid fa-list"></i> Agregar Categoría
          </button>
        </div>
      </div>

      <div v-if="loading" class="state-message">
        Cargando juegos...
      </div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Alquiler</th>
              <th>Precio Venta</th>
              <th>Venta</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th v-if="canManageGames">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredJuegos.length === 0">
              <td :colspan="canManageGames ? 9 : 8">
                No hay juegos disponibles.
              </td>
            </tr>

            <tr v-for="juego in filteredJuegos" :key="juego.id_juego">
              <td>{{ juego.id_juego }}</td>
              <td>{{ juego.nombre }}</td>
              <td>{{ juego.descripcion }}</td>
              <td>{{ juego.precio_alquiler }}</td>
              <td>{{ juego.precio_venta }}</td>
              <td>{{ juego.disponible_venta ? 'Disponible' : 'No disponible' }}</td>

              <td>
                <img
                  v-if="juego.imagen"
                  :src="juego.imagen"
                  :alt="`Imagen de ${juego.nombre}`"
                  width="100"
                />
                <span v-else>Sin imagen</span>
              </td>

              <td>{{ getCategoryName(juego) }}</td>

              <td v-if="canManageGames">
                <div class="action-buttons">
                  <button
                    type="button"
                    class="editGameBtn"
                    @click="openEditPopup(juego.id_juego)"
                  >
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

    <!-- Popup registrar juego -->
    <div
      v-if="showAddGamePopup && canManageGames"
      id="contactPopup"
      class="popup"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Game Icon" class="product-icon" />
        <h2>REGISTRO NUEVO JUEGO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span
              class="step"
              :class="{ active: currentTab === 0 }"
              @click="showTab(0)"
            >
              1
            </span>

            <span class="step-line" :class="{ active: currentTab > 0 }"></span>

            <span
              class="step"
              :class="{ active: currentTab === 1 }"
              @click="showTab(1)"
            >
              2
            </span>

            <span class="step-line" :class="{ active: currentTab > 1 }"></span>

            <span
              class="step"
              :class="{ active: currentTab === 2 }"
              @click="showTab(2)"
            >
              3
            </span>
          </div>
        </div>

        <form id="regForm" @submit.prevent="handleGameSubmit">
          <div v-show="currentTab === 0" class="form-step">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input
                id="nombre"
                v-model="regForm.nombre"
                type="text"
                name="nombre"
                maxlength="50"
                required
              />
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <input
                id="descripcion"
                v-model="regForm.descripcion"
                type="text"
                name="descripcion"
                maxlength="500"
                required
              />
            </div>
          </div>

          <div v-show="currentTab === 1" class="form-step">
            <div class="form-group">
              <label for="precio_alquiler">Precio Alquiler</label>
              <input
                id="precio_alquiler"
                v-model="regForm.precio_alquiler"
                type="number"
                name="precio_alquiler"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group">
              <label for="precio_venta">Precio Venta</label>
              <input
                id="precio_venta"
                v-model="regForm.precio_venta"
                type="number"
                name="precio_venta"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group checkbox-group">
              <label for="disponible_venta">Disponible para venta</label>
              <input
                id="disponible_venta"
                v-model="regForm.disponible_venta"
                type="checkbox"
                name="disponible_venta"
              />
            </div>
          </div>

          <div v-show="currentTab === 2" class="form-step">
            <div class="form-group">
              <label for="imagen">Imagen</label>
              <input
                id="imagen"
                type="file"
                name="imagen"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                required
                @change="handleRegImageChange"
              />
            </div>

            <div class="form-group">
              <label for="categoria">Categoría</label>
              <select
                id="categoria"
                v-model="regForm.categoria"
                name="categoria"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>

                <option
                  v-for="categoria in categorias"
                  :key="categoria.id_catJuego"
                  :value="categoria.id_catJuego"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <div class="buttons">
              <button type="submit">Registrar</button>
              <button type="button" @click="confirmCancel('regForm')">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Popup editar juego -->
    <div
      v-if="showEditGamePopup && canManageGames"
      id="editPopup"
      class="popup"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="editImg" alt="Game Icon" class="product-icon" />
        <h2>EDITAR JUEGO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span
              class="step"
              :class="{ active: currentEditTab === 0 }"
              @click="showEditTab(0)"
            >
              1
            </span>

            <span class="step-line" :class="{ active: currentEditTab > 0 }"></span>

            <span
              class="step"
              :class="{ active: currentEditTab === 1 }"
              @click="showEditTab(1)"
            >
              2
            </span>

            <span class="step-line" :class="{ active: currentEditTab > 1 }"></span>

            <span
              class="step"
              :class="{ active: currentEditTab === 2 }"
              @click="showEditTab(2)"
            >
              3
            </span>
          </div>
        </div>

        <form id="editForm" @submit.prevent="handleEditGameSubmit">
          <div v-show="currentEditTab === 0" class="form-step">
            <div class="form-group">
              <label for="edit_nombre">Nombre</label>
              <input
                id="edit_nombre"
                v-model="editForm.nombre"
                type="text"
                name="nombre"
                maxlength="50"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_descripcion">Descripción</label>
              <input
                id="edit_descripcion"
                v-model="editForm.descripcion"
                type="text"
                name="descripcion"
                maxlength="500"
                required
              />
            </div>
          </div>

          <div v-show="currentEditTab === 1" class="form-step">
            <div class="form-group">
              <label for="edit_precio_alquiler">Precio Alquiler</label>
              <input
                id="edit_precio_alquiler"
                v-model="editForm.precio_alquiler"
                type="number"
                name="precio_alquiler"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_precio_venta">Precio Venta</label>
              <input
                id="edit_precio_venta"
                v-model="editForm.precio_venta"
                type="number"
                name="precio_venta"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group checkbox-group">
              <label for="edit_disponible_venta">Disponible para venta</label>
              <input
                id="edit_disponible_venta"
                v-model="editForm.disponible_venta"
                type="checkbox"
                name="disponible_venta"
              />
            </div>
          </div>

          <div v-show="currentEditTab === 2" class="form-step">
            <div class="form-group">
              <label for="edit_imagen">Imagen</label>
              <input
                id="edit_imagen"
                type="file"
                name="imagen"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                @change="handleEditImageChange"
              />

              <div v-if="editForm.imagenActual" class="current-image">
                <p>Imagen actual:</p>
                <img
                  :src="normalizeImage(editForm.imagenActual)"
                  :alt="`Imagen actual de ${editForm.nombre}`"
                  width="100"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="edit_categoria">Categoría</label>
              <select
                id="edit_categoria"
                v-model="editForm.categoria"
                name="categoria"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>

                <option
                  v-for="categoria in categorias"
                  :key="categoria.id_catJuego"
                  :value="String(categoria.id_catJuego)"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <div class="buttons">
              <button type="submit">Guardar Cambios</button>
              <button type="button" @click="confirmCancel('editForm')">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Popup registrar categoría -->
    <div
      v-if="showCategoryPopup && canManageGames"
      id="categoryPopup"
      class="popup"
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
              name="nombre"
              maxlength="200"
              required
            />
          </div>

          <div class="buttons">
            <button type="submit">Registrar</button>
            <button type="button" @click="confirmCancel('categoryForm')">
              Cancelar
            </button>
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

.state-message {
  margin-top: 20px;
  text-align: center;
}

.form-step {
  display: block;
  width: 100%;
}

.checkbox-group input {
  width: auto;
}

.current-image {
  margin-top: 10px;
}

.current-image p {
  margin-bottom: 6px;
  color: #faf7e6;
  font-size: 13px;
}

.current-image img {
  display: block;
  border-radius: 8px;
  object-fit: cover;
}

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
  max-width: 450px;
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