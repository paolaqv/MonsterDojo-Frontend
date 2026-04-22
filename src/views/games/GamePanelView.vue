<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import menuImg from '@/assets/images/espadas.png'
import editImg from '@/assets/images/dados.png'
import categoryImg from '@/assets/images/category.png'
import {
  createGame,
  createGameCategory,
  getGameById,
  getGameCategories,
  getGames,
  updateGame,
} from '@/services/games.service'

const router = useRouter()

const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
const userRole = storedUser?.rol_id_rol || ''

const isMesero = computed(() => userRole === 'mesero')
const isEncargadoLocal = computed(() => userRole === 'encargadoLocal')

const homeRoute = computed(() => {
  if (isMesero.value) return '/panel-mesero'
  return '/adminpanel'
})

const menuOpen = ref(false)
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
  imagen: null,
  categoria: '',
})

const editForm = ref({
  id: '',
  nombre: '',
  descripcion: '',
  precio_alquiler: '',
  imagen: null,
  categoria: '',
  imagenActual: '',
  activo: true,
})

const categoryForm = ref({
  nombre: '',
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

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

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const loadData = async () => {
  try {
    const [categoriasData, juegosData] = await Promise.all([
      getGameCategories(),
      getGames(),
    ])

    categorias.value = Array.isArray(categoriasData)
      ? categoriasData
      : (categoriasData?.items || categoriasData?.results || [])

    const juegosArray = Array.isArray(juegosData)
      ? juegosData
      : (juegosData?.items || juegosData?.results || [])

    juegos.value = juegosArray.map((juego) => ({
      ...juego,
      imagen: normalizeImage(juego.imagen),
    }))
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

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
  showAddGamePopup.value = true
  currentTab.value = 0
}

const openCategoryPopup = () => {
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

  try {
    const imagenBase64 = await fileToBase64(regForm.value.imagen)

    await createGame({
      nombre: regForm.value.nombre,
      descripcion: regForm.value.descripcion,
      precio_alquiler: Number(regForm.value.precio_alquiler),
      imagen: imagenBase64,
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
  try {
    const data = await getGameById(gameId)

    editForm.value.id = gameId
    editForm.value.nombre = data.nombre
    editForm.value.descripcion = data.descripcion
    editForm.value.precio_alquiler = data.precio_alquiler
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

  try {
    const nuevaImagen = editForm.value.imagen
      ? await fileToBase64(editForm.value.imagen)
      : editForm.value.imagenActual

    await updateGame(editForm.value.id, {
      nombre: editForm.value.nombre,
      descripcion: editForm.value.descripcion,
      precio_alquiler: Number(editForm.value.precio_alquiler),
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
        await updateGame(juego.id_juego, {
          nombre: juego.nombre,
          descripcion: juego.descripcion,
          precio_alquiler: Number(juego.precio_alquiler),
          imagen: juego.imagen,
          categoria_juego_id_catJuego:
            juego.categoria_juego_id_catJuego ??
            juego.categoria_juego?.id_catJuego ??
            juego.categoria_juego?.id_categoria,
          activo: false,
        })

        Swal.fire('¡Archivado!', 'El juego ha sido archivado.', 'success')
        await loadData()
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al archivar el juego.',
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
  await loadData()
})
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
        <li><RouterLink :to="homeRoute">Inicio</RouterLink></li>
        <li><RouterLink to="/game_panel">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>

        <li v-if="isEncargadoLocal"><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li v-if="isEncargadoLocal"><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li v-if="isEncargadoLocal">
          <RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink>
        </li>

        <li><RouterLink to="/logout"><i class="fa-solid fa-sign-out"></i></RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="title">Panel de Juegos</div>

      <div class="actions-container">
        <form method="GET" action="/game_panel">
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar juego" />
            <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
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

        <div v-if="isEncargadoLocal" class="add-buttons">
          <button id="addGameBtn" @click="openAddGamePopup">
            <i class="fa-solid fa-dice"></i> Agregar Juego
          </button>
          <button id="addCategoryBtn" @click="openCategoryPopup">
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
              <th v-if="isEncargadoLocal">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="juego in filteredJuegos" :key="juego.id_juego">
              <td>{{ juego.id_juego }}</td>
              <td>{{ juego.nombre }}</td>
              <td>{{ juego.descripcion }}</td>
              <td>{{ juego.precio_alquiler }}</td>
              <td>
                <img :src="juego.imagen" :alt="`Imagen de ${juego.nombre}`" width="100" />
              </td>
              <td>{{ juego.categoria_juego?.nombre }}</td>
              <td v-if="isEncargadoLocal">
                <div class="action-buttons">
                  <button class="editGameBtn" @click="openEditPopup(juego.id_juego)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="juego.activo"
                    class="deleteGameBtn"
                    @click="confirmDelete($event, juego)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
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

    <div v-if="showAddGamePopup && isEncargadoLocal" class="popup" id="contactPopup">
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Game Icon" class="product-icon" />
        <h2>REGISTRO NUEVO JUEGO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span id="step1" class="step" :class="{ active: currentTab === 0 }" @click="showTab(0)">1</span>
            <span class="step-line" :class="{ active: currentTab > 0 }"></span>
            <span id="step2" class="step" :class="{ active: currentTab === 1 }" @click="showTab(1)">2</span>
            <span class="step-line" :class="{ active: currentTab > 1 }"></span>
            <span id="step3" class="step" :class="{ active: currentTab === 2 }" @click="showTab(2)">3</span>
          </div>
        </div>

        <form id="regForm" @submit.prevent="handleGameSubmit">
          <div v-show="currentTab === 0" class="tab">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input id="nombre" v-model="regForm.nombre" type="text" name="nombre" required />
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <input id="descripcion" v-model="regForm.descripcion" type="text" name="descripcion" required />
            </div>
          </div>

          <div v-show="currentTab === 1" class="tab">
            <div class="form-group">
              <label for="precio_alquiler">Precio Alquiler</label>
              <input id="precio_alquiler" v-model="regForm.precio_alquiler" type="number" step="0.01" required />
            </div>
          </div>

          <div v-show="currentTab === 2" class="tab">
            <div class="form-group">
              <label for="imagen">Imagen</label>
              <input
                id="imagen"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                required
                @change="handleRegImageChange"
              />
            </div>

            <div class="form-group">
              <label for="categoria">Categoría</label>
              <select id="categoria" v-model="regForm.categoria" required>
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
              <button type="button" @click="confirmCancel('regForm')">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditGamePopup && isEncargadoLocal" class="popup" id="editPopup">
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="editImg" alt="Game Icon" class="product-icon" />
        <h2>EDITAR JUEGO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span id="edit-step1" class="step" :class="{ active: currentEditTab === 0 }" @click="showEditTab(0)">1</span>
            <span class="step-line" :class="{ active: currentEditTab > 0 }"></span>
            <span id="edit-step2" class="step" :class="{ active: currentEditTab === 1 }" @click="showEditTab(1)">2</span>
            <span class="step-line" :class="{ active: currentEditTab > 1 }"></span>
            <span id="edit-step3" class="step" :class="{ active: currentEditTab === 2 }" @click="showEditTab(2)">3</span>
          </div>
        </div>

        <form id="editForm" @submit.prevent="handleEditGameSubmit">
          <div v-show="currentEditTab === 0" class="tab">
            <div class="form-group">
              <label for="edit_nombre">Nombre</label>
              <input id="edit_nombre" v-model="editForm.nombre" type="text" required />
            </div>

            <div class="form-group">
              <label for="edit_descripcion">Descripción</label>
              <input id="edit_descripcion" v-model="editForm.descripcion" type="text" required />
            </div>
          </div>

          <div v-show="currentEditTab === 1" class="tab">
            <div class="form-group">
              <label for="edit_precio_alquiler">Precio Alquiler</label>
              <input id="edit_precio_alquiler" v-model="editForm.precio_alquiler" type="number" step="0.01" required />
            </div>
          </div>

          <div v-show="currentEditTab === 2" class="tab">
            <div class="form-group">
              <label for="edit_imagen">Imagen</label>
              <input
                id="edit_imagen"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                @change="handleEditImageChange"
              />
            </div>

            <div class="form-group">
              <label for="edit_categoria">Categoría</label>
              <select id="edit_categoria" v-model="editForm.categoria" required>
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
              <button type="submit">Guardar Cambios</button>
              <button type="button" @click="confirmCancel('editForm')">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCategoryPopup && isEncargadoLocal" class="popup" id="categoryPopup">
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