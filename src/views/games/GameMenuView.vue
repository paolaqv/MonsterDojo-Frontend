<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/css/game-menu.css'
import '@/assets/css/popup_carrito.css'
import UserNavbar from '@/components/navigation/UserNavbar.vue'
import { getGameCategories, getGames } from '@/services/games.service'

const router = useRouter()

const categoriaFiltro = ref('all')
const searchQuery = ref('')
const categorias = ref([])
const juegos = ref([])
const errorMessage = ref('')

const normalizeImage = (imagen) => {
  if (!imagen) return ''

  if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:image')) {
    return imagen
  }

  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
  const apiBase = base.replace('/api/v1', '')

  if (imagen.startsWith('/')) {
    return `${apiBase}${imagen}`
  }

  return `${apiBase}/${imagen}`
}

const juegosFiltrados = computed(() => {
  return juegos.value.filter((juego) => {
    const categoria = juego.categoria_juego?.nombre || ''
    const nombre = juego.nombre?.toLowerCase() || ''
    const search = searchQuery.value.toLowerCase()

    const coincideCategoria =
      categoriaFiltro.value === 'all' || categoria === categoriaFiltro.value

    const coincideBusqueda =
      !search || nombre.includes(search)

    return coincideCategoria && coincideBusqueda
  })
})

onMounted(async () => {
  try {
    errorMessage.value = ''

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

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los juegos.'
  }
})
</script>

<template>
  <div>
    <UserNavbar />

    <div class="container">
      <form>
        <div class="filters">
          <div class="filter-option">
            <label for="category">Categoría:</label>
            <select id="category" v-model="categoriaFiltro" name="category">
              <option value="all">Todos</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id_catJuego || categoria.id_categoria || categoria.nombre"
                :value="categoria.nombre"
              >
                {{ categoria.nombre }}
              </option>
            </select>
          </div>

          <div class="filter-option">
            <label for="search">Buscar un juego:</label>
            <input
              id="search"
              v-model="searchQuery"
              class="search-bar"
              name="search"
              type="text"
              placeholder="Ingrese el nombre del juego..."
            />
          </div>
        </div>
      </form>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="game-menu">
        <div
          v-for="juego in juegosFiltrados"
          :key="juego.id_juego"
          class="game-card"
        >
          <img
            :src="juego.imagen"
            :alt="`Imagen de ${juego.nombre}`"
            width="100"
          />

          <div class="game-info">
            <h3>{{ juego.nombre }}</h3>
            <p>{{ juego.descripcion }}</p>
            <ul class="tags">
              <li>
                <i class="fas fa-gamepad"></i>
                <span>{{ juego.categoria_juego?.nombre }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
    /* Estilos generales */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        height: 100%;
        width: 100%;
        font-family: 'Poppins', sans-serif;
        background-color: #B7D8E6;
    }

    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        background-color: #192847;
        padding: 10px 20px;
        position: fixed;
        width: 100%;
        top: 0;
        box-sizing: border-box;
        z-index: 1050;
    }

    .nav-logo {
        height: 70px;
        width: 70px;
        background-color: #FAF7E6;
        border: solid #FAF7E6 1px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .nav-logo img {
        height: 100%;
        width: auto;
    }

    .navbar-right {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: auto;
    }

    .menu-toggle {
        display: none;
        font-size: 30px;
        color: #faf7e6;
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 15px;
        z-index: 1500;
    }

    .navbar a {
        color: #faf7e6;
        font-weight: bold;
        text-align: center;
        padding: 12px 25px;
        text-decoration: none;
        font-size: 15px;
    }

    .navbar-right a:hover {
        background-color: #d48600;
        border-radius: 25px;
    }

    .container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 30px;
        margin-top: 60px;
    }

    .filters {
        display: grid;
        grid-template-columns: 1fr 1fr 3fr;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 20px;
    }

    .filter-option {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
    }

    .filter-option label {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .filter-option select,
    .filter-option input {
        padding: 10px;
        border-radius: 20px;
        border: none;
        background-color: #FAF7E6;
        font-size: 15px;
    }

    .game-menu {
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
    }

    .game-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 20px;
        background-color: #FAF7E6;
        border-radius: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .game-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 20px;
    }

    .game-card h3 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 10px;
        text-align: left;
    }

    .game-card p {
        font-size: 15px;
        margin-top: 10px;
    }
    

    .game-card .tags {
        list-style: none;
        padding: 10px;
        background-color: #192847;
        border-radius: 20px;
        color: #FAF7E6;
    }

    .game-card .tags li {
        list-style: none;
        padding: 10px;
        background-color: #192847;
        border-radius: 20px;
        color: #FAF7E6;
    }

    .game-card a {
        display: flex;
        justify-content: center;
        width: 100%;
        padding: 10px;
        background-color: #192847;
        color: #FAF7E6;
        border-radius: 20px;
        margin-top: 10px;
        text-decoration: none;
    }

    /* RESPONSIVE PARA MOBILE*/
    @media screen and (max-width: 768px) {
        .menu-toggle {
            display: block;
        }

        .navbar-right {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 90px;
            right: 0;
            width: 70%;
            max-width: 300px;
            height: 100vh;
            background: rgba(25, 40, 71, 0.95);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            z-index: 1500;
        }

        .navbar-right.active {
            transform: translateX(0);
        }

        .navbar a {
            color: #faf7e6;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            text-decoration: none;
            font-size: 18px;
            border-bottom: 1px solid #faf7e6;
        }

        .navbar-right a:hover {
            background-color: #d48600;
            border-radius: 25px;
        }

        .container {
            margin-top: 60px;
        }

        .filters {
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .game-menu {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
    }

</style>

