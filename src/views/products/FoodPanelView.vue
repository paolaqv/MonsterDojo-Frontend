<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import menuImg from '@/assets/images/menu.png'
import hamburguerImg from '@/assets/images/hamburguer.png'
import categoryImg from '@/assets/images/category.png'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'
import {
  createProduct,
  createProductCategory,
  getProductById,
  getProductCategories,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '@/services/products.service'

const { hasPermission, hasRole } = usePermissions()
const authStore = useAuthStore()
/*
 * Permisos del módulo.
 * Las funcionalidades de productos dependen de permisos,
 * no de un rol fijo.
 */
const canViewProducts = computed(() => hasPermission('ver_productos'))
const canManageProducts = computed(() => hasPermission('gestionar_productos'))

/*
 * Las rutas se utilizan únicamente para navegación.
 * No autorizan acciones del módulo.
 */
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

  const base =
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api/v1'

  const apiBase = base.replace('/api/v1', '')

  if (imagen.startsWith('/')) {
    return `${apiBase}${imagen}`
  }

  return `${apiBase}/${imagen}`
}

const getCategoryName = (producto) => {
  if (producto.categoria_producto?.nombre) {
    return producto.categoria_producto.nombre
  }

  const categoryId =
    producto.categoria_producto_id_catProducto ??
    producto.categoria_producto?.id_catProducto ??
    producto.categoria_producto?.id_categoria

  const categoria = categorias.value.find(
    (item) => String(item.id_catProducto) === String(categoryId)
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
  if (!canViewProducts.value) {
    errorMessage.value = 'No cuenta con permiso para visualizar productos.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    const [categoriasData, productosData] = await Promise.all([
      getProductCategories(),
      getProducts(),
    ])

    categorias.value = Array.isArray(categoriasData)
      ? categoriasData
      : categoriasData?.items || categoriasData?.results || []

    const productosArray = Array.isArray(productosData)
      ? productosData
      : productosData?.items || productosData?.results || []

    productos.value = productosArray.map((producto) => ({
      ...producto,
      imagen: normalizeImage(producto.imagen),
    }))
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'No se pudieron cargar los productos.'
    )
  } finally {
    loading.value = false
  }
}

const filteredProductos = computed(() => {
  let data = [...productos.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()

    data = data.filter((producto) =>
      `${producto.nombre} ${producto.descripcion}`
        .toLowerCase()
        .includes(query)
    )
  }

  if (groupBy.value === 'archivados') {
    data = data.filter((producto) => !producto.activo)
  } else if (groupBy.value) {
    data = data.filter((producto) => {
      const categoryId =
        producto.categoria_producto_id_catProducto ??
        producto.categoria_producto?.id_catProducto ??
        producto.categoria_producto?.id_categoria

      return String(categoryId) === String(groupBy.value)
    })
  }

  return data
})

const openAddProductPopup = () => {
  if (!canManageProducts.value) return

  currentTab.value = 0
  showAddProductPopup.value = true
}

const openCategoryPopup = () => {
  if (!canManageProducts.value) return

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

  if (popupType === 'productPopup') {
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

const handleProductoSubmit = async (event) => {
  event.preventDefault()

  if (!canManageProducts.value) return

  try {
    if (!regForm.value.imagen) {
      throw new Error('Debe seleccionar una imagen para el producto.')
    }

    const uploadedImage = await uploadProductImage(regForm.value.imagen)

    await createProduct({
      nombre: regForm.value.nombre.trim(),
      descripcion: regForm.value.descripcion.trim(),
      precio: Number(regForm.value.precio),
      max_personas: Number(regForm.value.max_personas),
      imagen: uploadedImage.url,
      categoria_producto_id_catProducto: Number(regForm.value.categoria),
      activo: true,
    })

    await showSuccessMessage(
      'productPopup',
      'Producto registrado con éxito.'
    )
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(
        error,
        'Hubo un problema al registrar el producto.'
      ),
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

  if (!canManageProducts.value) return

  try {
    await createProductCategory({
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

const openEditPopup = async (productId) => {
  if (!canManageProducts.value) return

  try {
    const data = await getProductById(productId)

    editForm.value = {
      id: data.id_producto ?? productId,
      nombre: data.nombre ?? '',
      descripcion: data.descripcion ?? '',
      precio: data.precio ?? '',
      max_personas: data.max_personas ?? '',
      imagen: null,
      categoria: String(
        data.categoria_producto_id_catProducto ??
          data.categoria_producto?.id_catProducto ??
          data.categoria_producto?.id_categoria ??
          ''
      ),
      imagenActual: data.imagen ?? '',
      activo: data.activo ?? true,
    }

    currentEditTab.value = 0
    showEditProductPopup.value = true
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(
        error,
        'Error al cargar los datos del producto.'
      ),
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const handleEditProductoSubmit = async (event) => {
  event.preventDefault()

  if (!canManageProducts.value) return

  try {
    let imagenUrl = editForm.value.imagenActual

    if (editForm.value.imagen) {
      const uploadedImage = await uploadProductImage(editForm.value.imagen)
      imagenUrl = uploadedImage.url
    }

    await updateProduct(editForm.value.id, {
      nombre: editForm.value.nombre.trim(),
      descripcion: editForm.value.descripcion.trim(),
      precio: Number(editForm.value.precio),
      max_personas: Number(editForm.value.max_personas),
      imagen: imagenUrl,
      categoria_producto_id_catProducto: Number(editForm.value.categoria),
      activo: editForm.value.activo,
    })

    await showSuccessMessage(
      'editPopup',
      'Producto actualizado con éxito.'
    )
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: getErrorMessage(
        error,
        'Hubo un problema al actualizar el producto.'
      ),
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
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
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
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
        activo: false,
      })

      await Swal.fire(
        '¡Archivado!',
        'El producto ha sido archivado.',
        'success'
      )

      await loadData()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: getErrorMessage(
          error,
          'Hubo un problema al archivar el producto.'
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
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
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

      await Swal.fire(
        '¡Desarchivado!',
        'El producto ha sido desarchivado.',
        'success'
      )

      await loadData()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: getErrorMessage(
          error,
          'No se pudo desarchivar el producto.'
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
      <div class="title">Panel de Productos</div>

      <div class="actions-container">
        <form @submit.prevent>
          <div class="search-container">
            <input
              v-model="search"
              type="text"
              name="search"
              placeholder="Buscar producto"
            />

            <button type="button">
              Buscar <i class="fa-solid fa-search"></i>
            </button>
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
          <button
            id="addProductBtn"
            type="button"
            @click="openAddProductPopup"
          >
            <i class="fa-solid fa-burger"></i> Agregar Producto
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
        Cargando productos...
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
              <th>Precio</th>
              <th>Máx. Personas</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th v-if="canManageProducts">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredProductos.length === 0">
              <td :colspan="canManageProducts ? 8 : 7">
                No hay productos disponibles.
              </td>
            </tr>

            <tr
              v-for="producto in filteredProductos"
              :key="producto.id_producto"
            >
              <td>{{ producto.id_producto }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.precio }}</td>
              <td>{{ producto.max_personas }}</td>

              <td>
                <img
                  v-if="producto.imagen"
                  :src="producto.imagen"
                  :alt="`Imagen de ${producto.nombre}`"
                  width="100"
                />
                <span v-else>Sin imagen</span>
              </td>

              <td>{{ getCategoryName(producto) }}</td>

              <td v-if="canManageProducts">
                <div class="action-buttons">
                  <button
                    type="button"
                    class="editProductBtn"
                    @click="openEditPopup(producto.id_producto)"
                  >
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="producto.activo"
                    type="button"
                    class="deleteProductBtn"
                    @click="confirmDelete($event, producto)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-else
                    type="button"
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

    <!-- Popup registrar producto -->
    <div
      v-if="showAddProductPopup && canManageProducts"
      id="contactPopup"
      class="popup"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Product Icon" class="product-icon" />
        <h2>REGISTRO NUEVO PRODUCTO</h2>

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

        <form id="regForm" @submit.prevent="handleProductoSubmit">
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
              <label for="precio">Precio</label>
              <input
                id="precio"
                v-model="regForm.precio"
                type="number"
                name="precio"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group">
              <label for="max_personas">Máx. Personas</label>
              <input
                id="max_personas"
                v-model="regForm.max_personas"
                type="number"
                name="max_personas"
                min="1"
                max="1000"
                required
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
                  :key="categoria.id_catProducto"
                  :value="categoria.id_catProducto"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <div class="buttons">
              <button type="submit">Registrar</button>
              <button
                type="button"
                @click="confirmCancel('regForm')"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Popup editar producto -->
    <div
      v-if="showEditProductPopup && canManageProducts"
      id="editPopup"
      class="popup"
    >
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="hamburguerImg" alt="Product Icon" class="product-icon" />
        <h2>EDITAR PRODUCTO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span
              class="step"
              :class="{ active: currentEditTab === 0 }"
              @click="showEditTab(0)"
            >
              1
            </span>

            <span
              class="step-line"
              :class="{ active: currentEditTab > 0 }"
            ></span>

            <span
              class="step"
              :class="{ active: currentEditTab === 1 }"
              @click="showEditTab(1)"
            >
              2
            </span>

            <span
              class="step-line"
              :class="{ active: currentEditTab > 1 }"
            ></span>

            <span
              class="step"
              :class="{ active: currentEditTab === 2 }"
              @click="showEditTab(2)"
            >
              3
            </span>
          </div>
        </div>

        <form id="editForm" @submit.prevent="handleEditProductoSubmit">
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
              <label for="edit_precio">Precio</label>
              <input
                id="edit_precio"
                v-model="editForm.precio"
                type="number"
                name="precio"
                step="0.01"
                min="0"
                max="100000"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_max_personas">Máx. Personas</label>
              <input
                id="edit_max_personas"
                v-model="editForm.max_personas"
                type="number"
                name="max_personas"
                min="1"
                max="1000"
                required
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
                  :key="categoria.id_catProducto"
                  :value="String(categoria.id_catProducto)"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <div class="buttons">
              <button type="submit">Guardar Cambios</button>
              <button
                type="button"
                @click="confirmCancel('editForm')"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Popup registrar categoría -->
    <div
      v-if="showCategoryPopup && canManageProducts"
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
            <button
              type="button"
              @click="confirmCancel('categoryForm')"
            >
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