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
import {
  createProduct,
  createProductCategory,
  getProductById,
  getProductCategories,
  getProducts,
  updateProduct,
} from '@/services/products.service'

const router = useRouter()

const menuOpen = ref(false)
const search = ref('')
const groupBy = ref('')
const categorias = ref([])
const productos = ref([])
const selectedCategory = ref('')

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
      customClass: {
        confirmButton: 'swal2-confirm',
      },
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

const handleProductoSubmit = async (event) => {
  event.preventDefault()

  try {
    const imagenBase64 = await fileToBase64(regForm.value.imagen)

    await createProduct({
      nombre: regForm.value.nombre,
      descripcion: regForm.value.descripcion,
      precio: Number(regForm.value.precio),
      max_personas: Number(regForm.value.max_personas),
      imagen: imagenBase64,
      categoria_producto_id_catProducto: Number(regForm.value.categoria),
      activo: true,
    })

    showSuccessMessage('contactPopup', 'Producto registrado con éxito')
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'Hubo un problema al registrar el producto.',
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
    await createProductCategory({
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

const openEditPopup = async (productId) => {
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

  try {
    const nuevaImagen = editForm.value.imagen
      ? await fileToBase64(editForm.value.imagen)
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
      text: error?.response?.data?.detail || 'Hubo un problema al actualizar el producto.',
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

        Swal.fire('¡Archivado!', 'El producto ha sido archivado.', 'success')
        await loadData()
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

const confirmUnarchive = (event, producto) => {
  event.preventDefault()

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
    if (result.isConfirmed) {
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
        <li><RouterLink to="/adminpanel">Inicio</RouterLink></li>
        <li><RouterLink to="/userspanel">Usuarios</RouterLink></li>
        <li><RouterLink to="/game_panel">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>
        <li>
          <RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="actions-container">
        <form method="GET" action="/food_panel">
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

        <div class="add-buttons">
          <button id="addProductBtn" @click="openAddProductPopup">
            <i class="fa-solid fa-burger"></i> Agregar Producto
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
              <th>Precio</th>
              <th>Máx. Personas</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
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
              <td>
                <div class="action-buttons">
                  <button class="editProductBtn" @click="openEditPopup(producto.id_producto)">
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="producto.activo"
                    class="deleteProductBtn"
                    @click="confirmDelete($event, producto)"click="confirmDelete($event, producto.id_producto)"

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

    <div v-if="showAddProductPopup" id="contactPopup" class="popup">
      <div class="popup-content">
        <span class="close-btn" @click="closePopup">&times;</span>
        <img :src="menuImg" alt="Product Icon" class="product-icon" />
        <h2>REGISTRO NUEVO PRODUCTO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span id="step1" class="step" :class="{ active: currentTab === 0 }" @click="showTab(0)">1</span>
            <span class="step-line" :class="{ active: currentTab > 0 }"></span>
            <span id="step2" class="step" :class="{ active: currentTab === 1 }" @click="showTab(1)">2</span>
            <span class="step-line" :class="{ active: currentTab > 1 }"></span>
            <span id="step3" class="step" :class="{ active: currentTab === 2 }" @click="showTab(2)">3</span>
          </div>
        </div>

        <form id="regForm" @submit.prevent="handleProductoSubmit">
          <div v-show="currentTab === 0" class="tab">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input id="nombre" v-model="regForm.nombre" type="text" name="nombre" required />
              <span id="error-nombre" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <input id="descripcion" v-model="regForm.descripcion" type="text" name="descripcion" required />
              <span id="error-descripcion" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentTab === 1" class="tab">
            <div class="form-group">
              <label for="precio">Precio</label>
              <input id="precio" v-model="regForm.precio" type="number" name="precio" step="0.01" required />
              <span id="error-precio" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="max_personas">Máx. Personas</label>
              <input id="max_personas" v-model="regForm.max_personas" type="number" name="max_personas" required />
              <span id="error-max_personas" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentTab === 2" class="tab">
            <div class="form-group">
              <label for="imagen">Imagen</label>
              <input
                id="imagen"
                type="file"
                name="imagen"
                accept="image/png, image/jpeg, image/jpg"
                required
                @change="handleRegImageChange"
              />
              <span id="error-imagen" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="categoria">Categoría</label>
              <select id="categoria" v-model="regForm.categoria" name="categoria" required>
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
              <button type="button" @click="confirmCancel('regForm')">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditProductPopup" id="editPopup" class="popup">
      <div class="popup-content">
        <span class="close-btn" @click="closeEditPopup">&times;</span>
        <img :src="hamburguerImg" alt="Product Icon" class="product-icon" />
        <h2>EDITAR PRODUCTO</h2>

        <div class="step-indicator">
          <div class="step-container">
            <span id="edit-step1" class="step" :class="{ active: currentEditTab === 0 }" @click="showEditTab(0)">1</span>
            <span class="step-line" :class="{ active: currentEditTab > 0 }"></span>
            <span id="edit-step2" class="step" :class="{ active: currentEditTab === 1 }" @click="showEditTab(1)">2</span>
            <span class="step-line" :class="{ active: currentEditTab > 1 }"></span>
            <span id="edit-step3" class="step" :class="{ active: currentEditTab === 2 }" @click="showEditTab(2)">3</span>
          </div>
        </div>

   <form id="editForm" @submit.prevent="handleEditProductoSubmit">
          <div v-show="currentEditTab === 0" class="tab">
            <div class="form-group">
              <label for="edit_nombre">Nombre</label>
              <input id="edit_nombre" v-model="editForm.nombre" type="text" name="nombre" required />
              <span id="edit-error-nombre" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="edit_descripcion">Descripción</label>
              <input id="edit_descripcion" v-model="editForm.descripcion" type="text" name="descripcion" required />
              <span id="edit-error-descripcion" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentEditTab === 1" class="tab">
            <div class="form-group">
              <label for="edit_precio">Precio</label>
              <input id="edit_precio" v-model="editForm.precio" type="number" name="precio" step="0.01" required />
              <span id="edit-error-precio" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="edit_max_personas">Máx. Personas</label>
              <input id="edit_max_personas" v-model="editForm.max_personas" type="number" name="max_personas" required />
              <span id="edit-error-max_personas" class="error-message"></span>
            </div>
          </div>

          <div v-show="currentEditTab === 2" class="tab">
            <div class="form-group">
              <label for="edit_imagen">Imagen</label>
              <input
                id="edit_imagen"
                type="file"
                name="imagen"
                accept="image/png, image/jpeg, image/jpg"
                @change="handleEditImageChange"
              />
              <span id="edit-error-imagen" class="error-message"></span>
            </div>

            <div class="form-group">
              <label for="edit_categoria">Categoría</label>
              <select id="edit_categoria" v-model="editForm.categoria" name="categoria" required>
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
              <button type="submit">Guardar Cambios</button>
              <button type="button" @click="confirmCancel('editForm')">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCategoryPopup" id="categoryPopup" class="popup">
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
              required
            />
            <span id="error-categoria_nombre" class="error-message"></span>
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
    <!-- Estilos para las alertas -->
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