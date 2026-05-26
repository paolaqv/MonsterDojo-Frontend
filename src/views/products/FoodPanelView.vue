<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import menuImg from '@/assets/images/menu.png'
import hamburguerImg from '@/assets/images/hamburguer.png'
import categoryImg from '@/assets/images/category.png'
import { usePermissions } from '@/composables/usePermissions'
import {
  createProduct,
  createProductCategory,
  deleteProduct,
  getProductById,
  getProductCategories,
  getProducts,
  updateProduct,
} from '@/services/products.service'
import { uploadImage } from '@/services/uploads.service'

const router = useRouter()
const { hasPermission, hasRole } = usePermissions()

const canViewProducts = computed(() => hasPermission('ver_productos'))
const canManageProducts = computed(() => hasPermission('gestionar_productos'))

const homeRoute = computed(() => {
  if (hasRole('mesero')) return '/panel-mesero'
  if (hasRole('encargadoLocal')) return '/adminpanel'
  if (hasRole('encargadoSeguridad')) return '/panel-seguridad'
  return '/inicio_usuario'
})

const menuOpen = ref(false)
const search = ref('')
const groupBy = ref('')
const categorias = ref([])
const productos = ref([])

const showAddProductPopup = ref(false)
const showEditProductPopup = ref(false)
const showCategoryPopup = ref(false)

const currentTab = ref(0)
const currentEditTab = ref(0)

const regForm = ref({
  nombre: '',
  descripcion: '',
  precio: '',
  max_personas: '',
  imagen: null,
  categoria: '',
})

const editForm = ref({
  id: '',
  nombre: '',
  descripcion: '',
  precio: '',
  max_personas: '',
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
  const { url } = await uploadImage(file, 'producto')
  return url
}

const loadData = async () => {
  try {
    const [categoriasData, productosData] = await Promise.all([
      getProductCategories(),
      getProducts(),
    ])

    categorias.value = Array.isArray(categoriasData)
      ? categoriasData
      : (categoriasData?.items || categoriasData?.results || [])

    const productosArray = Array.isArray(productosData)
      ? productosData
      : (productosData?.items || productosData?.results || [])

    productos.value = productosArray.map((producto) => ({
      ...producto,
      imagen: normalizeImage(producto.imagen),
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
      text: 'No se pudieron cargar los productos.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const filteredProductos = computed(() => {
  let data = [...productos.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    data = data.filter((producto) =>
      `${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(query)
    )
  }

  if (groupBy.value === 'archivados') {
    data = data.filter((producto) => !producto.activo)
  } else if (groupBy.value) {
    data = data.filter(
      (producto) =>
        String(
          producto.categoria_producto_id_catProducto ??
            producto.categoria_producto?.id_catProducto ??
            producto.categoria_producto?.id_categoria
        ) === String(groupBy.value)
    )
  }

  return data
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const openAddProductPopup = () => {
  showAddProductPopup.value = true
  currentTab.value = 0
}

const openCategoryPopup = () => {
  showCategoryPopup.value = true
}

const closePopup = () => {
  showAddProductPopup.value = false
}

const closeEditPopup = () => {
  showEditProductPopup.value = false
}

const closeCategoryPopup = () => {
  showCategoryPopup.value = false
}

const clearForm = () => {
  regForm.value = {
    nombre: '',
    descripcion: '',
    precio: '',
    max_personas: '',
    imagen: null,
    categoria: '',
  }
}

const clearEditForm = () => {
  editForm.value = {
    id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    max_personas: '',
    imagen: null,
    categoria: '',
    imagenActual: '',
    activo: true,
  }
}

const clearCategoryForm = () => {
  categoryForm.value = { nombre: '' }
}

const showTab = (n) => {
  currentTab.value = n
}

const showEditTab = (n) => {
  currentEditTab.value = n
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
    customClass: { confirmButton: 'swal2-confirm', cancelButton: 'swal2-cancel' },
  }).then((result) => {
    if (!result.isConfirmed) return
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
    customClass: { confirmButton: 'swal2-confirm' },
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

const handleProductoSubmit = async (event) => {
  event.preventDefault()
  if (!canManageProducts.value) return

  try {
    const imagenUrl = await uploadAndGetUrl(regForm.value.imagen)

    await createProduct({
      nombre: regForm.value.nombre,
      descripcion: regForm.value.descripcion,
      precio: Number(regForm.value.precio),
      max_personas: Number(regForm.value.max_personas),
      imagen: imagenUrl,
      categoria_producto_id_catProducto: Number(regForm.value.categoria),
      activo: true,
    })

    showSuccessMessage('contactPopup', 'Producto registrado con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text:
        error?.normalizedMessage ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        'Hubo un problema al registrar el producto.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const handleCategorySubmit = async (event) => {
  event.preventDefault()
  if (!canManageProducts.value) return

  try {
    await createProductCategory({ nombre: categoryForm.value.nombre })
    showSuccessMessage('categoryPopup', 'Categoría registrada con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text:
        error?.normalizedMessage ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        'Hubo un problema al registrar la categoría.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const openEditPopup = async (productId) => {
  if (!canManageProducts.value) return

  try {
    const data = await getProductById(productId)

    editForm.value.id = productId
    editForm.value.nombre = data.nombre
    editForm.value.descripcion = data.descripcion
    editForm.value.precio = data.precio
    editForm.value.max_personas = data.max_personas
    editForm.value.categoria =
      data.categoria_producto_id_catProducto ??
      data.categoria_producto?.id_catProducto ??
      data.categoria_producto?.id_categoria ??
      ''
    editForm.value.imagen = null
    editForm.value.imagenActual = data.imagen || ''
    editForm.value.activo = data.activo ?? true

    showEditProductPopup.value = true
    currentEditTab.value = 0
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Error al cargar los datos del producto.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const handleEditProductoSubmit = async (event) => {
  event.preventDefault()
  if (!canManageProducts.value) return

  try {
    const nuevaImagen = editForm.value.imagen
      ? await uploadAndGetUrl(editForm.value.imagen)
      : editForm.value.imagenActual

    await updateProduct(editForm.value.id, {
      nombre: editForm.value.nombre,
      descripcion: editForm.value.descripcion,
      precio: Number(editForm.value.precio),
      max_personas: Number(editForm.value.max_personas),
      imagen: nuevaImagen,
      categoria_producto_id_catProducto: Number(editForm.value.categoria),
      activo: editForm.value.activo,
    })

    showSuccessMessage('editPopup', 'Producto actualizado con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text:
        error?.normalizedMessage ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        'Hubo un problema al actualizar el producto.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { confirmButton: 'swal2-confirm' },
    })
  }
}

const confirmDelete = (event, producto) => {
  event.preventDefault()
  if (!canManageProducts.value) return

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de archivar el producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, archivar',
    cancelButtonText: 'No, cancelar',
    customClass: { confirmButton: 'swal2-confirm', cancelButton: 'swal2-cancel' },
  }).then(async (result) => {
    if (!result.isConfirmed) return
    try {
      await deleteProduct(producto.id_producto)
      Swal.fire('¡Archivado!', 'El producto ha sido archivado.', 'success')
      await loadData()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text:
          error?.normalizedMessage ||
          error?.response?.data?.error?.message ||
          'Hubo un problema al archivar el producto.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'swal2-confirm' },
      })
    }
  })
}

const confirmUnarchive = (event, producto) => {
  event.preventDefault()
  if (!canManageProducts.value) return

  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de desarchivar el producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desarchivar',
    cancelButtonText: 'No, cancelar',
    customClass: { confirmButton: 'swal2-confirm', cancelButton: 'swal2-cancel' },
  }).then(async (result) => {
    if (!result.isConfirmed) return
    try {
      await updateProduct(producto.id_producto, {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        max_personas: Number(producto.max_personas),
        imagen: producto.imagen,
        categoria_producto_id_catProducto:
          producto.categoria_producto_id_catProducto ??
          producto.categoria_producto?.id_catProducto ??
          producto.categoria_producto?.id_categoria,
        activo: true,
      })
      Swal.fire('¡Desarchivado!', 'El producto ha sido desarchivado.', 'success')
      await loadData()
    } catch (error) {
      Swal.fire('Error', 'No se pudo desarchivar el producto.', 'error')
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

        <li v-if="canManageProducts"><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li v-if="canManageProducts"><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li v-if="canManageProducts">
          <RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink>
        </li>

        <li><RouterLink to="/logout"><i class="fa-solid fa-sign-out"></i></RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="actions-container">
        <form @submit.prevent>
          <div class="search-container">
            <input v-model="search" type="text" name="search" placeholder="Buscar producto" />
            <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
          </div>

          <div class="group-by-container">
            <label for="group_by">Agrupar por:</label>
            <select id="group_by" v-model="groupBy" name="group_by">
              <option value="">Todos</option>
              <option value="archivados">Productos Archivados</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catProducto"
                :value="categoria.id_catProducto"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>
        </form>

        <div v-if="canManageProducts" class="add-buttons">
          <button type="button" id="addProductBtn" @click="openAddProductPopup">
            <i class="fa-solid fa-burger"></i> Agregar Producto
          </button>
          <button type="button" id="addCategoryBtn" @click="openCategoryPopup">
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
              <th>Precio</th>
              <th>Máx. Personas</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th v-if="canManageProducts">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredProductos.length === 0">
              <td :colspan="canManageProducts ? 8 : 7" style="text-align:center; padding:20px;">
                No hay productos para mostrar.
              </td>
            </tr>
            <tr v-for="producto in filteredProductos" :key="producto.id_producto">
              <td>{{ producto.id_producto }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.precio }}</td>
              <td>{{ producto.max_personas }}</td>
              <td>
                <img :src="producto.imagen" :alt="`Imagen de ${producto.nombre}`" width="100" />
              </td>
              <td>{{ producto.categoria_producto?.nombre }}</td>
              <td v-if="canManageProducts">
                <div class="action-buttons">
                  <button class="editProductBtn" @click="openEditPopup(producto.id_producto)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="producto.activo"
                    class="deleteProductBtn"
                    @click="confirmDelete($event, producto)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
                    class="unarchiveProductBtn"
                    @click="confirmUnarchive($event, producto)"
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

    <!-- POPUP REGISTRAR PRODUCTO -->
    <Teleport to="body">
    <div
      v-show="showAddProductPopup && canManageProducts"
      id="contactPopup"
      class="popup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content" style="background:#1c1c1c; padding:20px; border-radius:10px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto;">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Product Icon" class="product-icon" />
        <h2>REGISTRO NUEVO PRODUCTO</h2>

        <form id="regForm" @submit.prevent="handleProductoSubmit">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="regForm.nombre" type="text" maxlength="50" required />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <input id="descripcion" v-model="regForm.descripcion" type="text" maxlength="500" required />
          </div>

          <div class="form-group">
            <label for="precio">Precio</label>
            <input id="precio" v-model="regForm.precio" type="number" step="0.01" min="0.01" max="100000" required />
          </div>

          <div class="form-group">
            <label for="max_personas">Máx. Personas</label>
            <input id="max_personas" v-model="regForm.max_personas" type="number" min="1" max="100" required />
          </div>

          <div class="form-group">
            <label for="categoria">Categoría</label>
            <select id="categoria" v-model="regForm.categoria" required>
              <option disabled value="">Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catProducto"
                :value="categoria.id_catProducto"
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

    <!-- POPUP EDITAR PRODUCTO -->
    <Teleport to="body">
    <div
      v-show="showEditProductPopup && canManageProducts"
      id="editPopup"
      class="popup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content" style="background:#1c1c1c; padding:20px; border-radius:10px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto;">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="hamburguerImg" alt="Product Icon" class="product-icon" />
        <h2>EDITAR PRODUCTO</h2>

        <form id="editForm" @submit.prevent="handleEditProductoSubmit">
          <div class="form-group">
            <label for="edit_nombre">Nombre</label>
            <input id="edit_nombre" v-model="editForm.nombre" type="text" maxlength="50" required />
          </div>

          <div class="form-group">
            <label for="edit_descripcion">Descripción</label>
            <input id="edit_descripcion" v-model="editForm.descripcion" type="text" maxlength="500" required />
          </div>

          <div class="form-group">
            <label for="edit_precio">Precio</label>
            <input id="edit_precio" v-model="editForm.precio" type="number" step="0.01" min="0.01" max="100000" required />
          </div>

          <div class="form-group">
            <label for="edit_max_personas">Máx. Personas</label>
            <input id="edit_max_personas" v-model="editForm.max_personas" type="number" min="1" max="100" required />
          </div>

          <div class="form-group">
            <label for="edit_categoria">Categoría</label>
            <select id="edit_categoria" v-model="editForm.categoria" required>
              <option disabled value="">Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catProducto"
                :value="categoria.id_catProducto"
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
            <label for="edit_activo" style="margin:0;">Producto activo</label>
          </div>

          <div class="buttons">
            <button type="submit">Guardar Cambios</button>
            <button type="button" @click="confirmCancel('editForm')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    </Teleport>

    <!-- POPUP NUEVA CATEGORIA -->
    <Teleport to="body">
    <div
      v-show="showCategoryPopup && canManageProducts"
      id="categoryPopup"
      class="popup"
      style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.6) !important; z-index: 99999 !important; display: flex !important; justify-content: center !important; align-items: center !important;"
    >
      <div class="popup-content" style="background:#1c1c1c; padding:20px; border-radius:10px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto;">
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
.group-by-container button,
.add-buttons button {
  margin-left: 10px;
  margin-right: 10px;
}

.add-buttons {
  display: flex;
  gap: 20px;
}
</style>
