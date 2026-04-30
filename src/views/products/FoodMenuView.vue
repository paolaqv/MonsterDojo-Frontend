<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/css/food-menu.css'
import UserNavbar from '@/components/navigation/UserNavbar.vue'
import { getProductCategories, getProducts } from '@/services/products.service'

const router = useRouter()

const categorias = ref([])
const productosPorCategoria = ref({})
const errorMessage = ref('')

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

const getCategoriaId = (categoria) => {
  return categoria.id_catProducto ?? categoria.id_categoria ?? categoria.id
}

const getProductoCategoriaId = (producto) => {
  return (
    producto.categoria_producto?.id_catProducto ??
    producto.categoria_producto?.id_categoria ??
    producto.categoria_id_categoria ??
    producto.id_catProducto ??
    producto.id_categoria
  )
}

const categoriasConProductos = computed(() => {
  return categorias.value.filter((categoria) => {
    const categoriaId = getCategoriaId(categoria)
    return productosPorCategoria.value[categoriaId]?.length
  })
})

onMounted(async () => {
  try {
    errorMessage.value = ''

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

    const productosNormalizados = productosArray.map((producto) => ({
      ...producto,
      imagen: normalizeImage(producto.imagen),
    }))

    const agrupados = {}

    categorias.value.forEach((categoria) => {
      const categoriaId = getCategoriaId(categoria)
      agrupados[categoriaId] = []
    })

    productosNormalizados.forEach((producto) => {
      const categoriaId = getProductoCategoriaId(producto)

      if (!agrupados[categoriaId]) {
        agrupados[categoriaId] = []
      }

      agrupados[categoriaId].push(producto)
    })

    productosPorCategoria.value = agrupados
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los productos.'
  }
})
</script>

<template>
  <div>
    <UserNavbar />

    <div class="container">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="menu-section">
        <div
          v-for="categoria in categoriasConProductos"
          :key="getCategoriaId(categoria)"
          class="menu-section"
        >
          <div class="menu-category">
            <h2>{{ categoria.nombre }}</h2>

            <div class="menu-items">
              <div
                v-for="producto in productosPorCategoria[getCategoriaId(categoria)]"
                :key="producto.id_producto"
                class="menu-item"
              >
                <img
                  :src="producto.imagen"
                  :alt="`Imagen de ${producto.nombre}`"
                  width="100"
                />

                <div class="item-info">
                  <h3>{{ producto.nombre }}</h3>
                  <p>{{ producto.descripcion }}</p>
                  <p>Precio: ${{ producto.precio }}</p>
                  <p>Máximo de personas: {{ producto.max_personas }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
.error-message {
  color: red;
  font-size: 0.9em;
  margin: 12px 0;
}
</style>