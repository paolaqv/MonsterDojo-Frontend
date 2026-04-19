<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/form-reserva.css'
import logo from '@/assets/images/logo.png'
import { getAvailableTables } from '@/services/tables.service'
import { getProductCategories, getProducts } from '@/services/products.service'
import { getGameCategories, getGames } from '@/services/games.service'
import { checkoutReservation } from '@/services/reservations.service'

const router = useRouter()

const menuOpen = ref(false)
const helpPopupOpen = ref(false)

const fecha = ref('')
const horaInicio = ref('')
const horaFin = ref('')

const mesasDisponibles = ref([])
const categoriasProductos = ref([])
const categoriasJuegos = ref([])
const productos = ref([])
const juegos = ref([])

const categoriaProductosSeleccionada = ref('')
const categoriaJuegosSeleccionada = ref('')

const mesaSeleccionada = ref('')
const productosInput = ref('')
const juegoInput = ref('')
const errorMessage = ref('')

const productosSeleccionados = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const openHelpPopup = () => {
  helpPopupOpen.value = true
}

const closeHelpPopup = () => {
  helpPopupOpen.value = false
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

const total = computed(() => {
  return productosSeleccionados.value
    .reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    .toFixed(2)
})

const mesasVisibles = computed(() => mesasDisponibles.value)

const productosVisibles = computed(() => {
  if (!categoriaProductosSeleccionada.value) {
    return productos.value
  }

  return productos.value.filter(
    (producto) =>
      String(
        producto.categoria_producto_id_catProducto ??
          producto.categoria_producto?.id_catProducto ??
          producto.categoria_producto?.id_categoria
      ) === String(categoriaProductosSeleccionada.value)
  )
})

const juegosVisibles = computed(() => {
  if (!categoriaJuegosSeleccionada.value) {
    return juegos.value
  }

  return juegos.value.filter(
    (juego) =>
      String(
        juego.categoria_juego_id_catJuego ??
          juego.categoria_juego?.id_catJuego ??
          juego.categoria_juego?.id_categoria
      ) === String(categoriaJuegosSeleccionada.value)
  )
})

const addProducto = (id, nombre, precio, cantidad, esJuego = false) => {
  productosSeleccionados.value.push({
    id,
    nombre,
    precio: Number(precio),
    cantidad: Number(cantidad),
    esJuego,
  })
}

const toggleProducto = (producto, event) => {
  const checked = event.target.checked
  const id = producto.id_producto
  const nombre = producto.nombre
  const precio = Number(producto.precio)
  const cantidad = Number(producto.cantidad || 1)

  if (checked) {
    const existe = productosSeleccionados.value.find(
      (item) => item.id === id && item.esJuego === false
    )
    if (!existe) {
      addProducto(id, nombre, precio, cantidad, false)
    }
  } else {
    productosSeleccionados.value = productosSeleccionados.value.filter(
      (item) => !(item.id === id && item.esJuego === false)
    )
  }
}

const updateCantidad = (producto) => {
  const id = producto.id_producto
  const cantidad = Number(producto.cantidad || 1)
  const productoSeleccionado = productosSeleccionados.value.find(
    (item) => item.id === id && item.esJuego === false
  )

  if (productoSeleccionado) {
    productoSeleccionado.cantidad = cantidad
  }
}

const selectJuego = (juego) => {
  juegos.value.forEach((item) => {
    item.checked = item.id_juego === juego.id_juego
  })

  productosSeleccionados.value = productosSeleccionados.value.filter(
    (item) => item.esJuego === false
  )

  addProducto(juego.id_juego, juego.nombre, Number(juego.precio_alquiler), 1, true)
}

const removeProducto = (id, esJuego = false) => {
  productosSeleccionados.value = productosSeleccionados.value.filter(
    (item) => !(item.id === id && item.esJuego === esJuego)
  )

  if (esJuego) {
    const juego = juegos.value.find((item) => item.id_juego === id)
    if (juego) {
      juego.checked = false
    }
  } else {
    const producto = productos.value.find((item) => item.id_producto === id)
    if (producto) {
      producto.checked = false
    }
  }
}

const confirmCancel = () => {
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
      router.push('/inicio_usuario')
    }
  })
}

const loadCatalogs = async () => {
  const [categoriasProd, categoriasGame, productosData, juegosData] = await Promise.all([
    getProductCategories(),
    getGameCategories(),
    getProducts(),
    getGames(),
  ])

  categoriasProductos.value = Array.isArray(categoriasProd)
    ? categoriasProd
    : (categoriasProd?.items || categoriasProd?.results || [])

  categoriasJuegos.value = Array.isArray(categoriasGame)
    ? categoriasGame
    : (categoriasGame?.items || categoriasGame?.results || [])

  const productosArray = Array.isArray(productosData)
    ? productosData
    : (productosData?.items || productosData?.results || [])

  const juegosArray = Array.isArray(juegosData)
    ? juegosData
    : (juegosData?.items || juegosData?.results || [])

  productos.value = productosArray.map((producto) => ({
    ...producto,
    checked: false,
    cantidad: 1,
    imagen: normalizeImage(producto.imagen),
  }))

  juegos.value = juegosArray.map((juego) => ({
    ...juego,
    checked: false,
    imagen: normalizeImage(juego.imagen),
  }))
}

const continuarReserva = async () => {
  try {
    errorMessage.value = ''

    if (!fecha.value || !horaInicio.value || !horaFin.value) {
      errorMessage.value = 'Debes completar fecha, hora de inicio y hora de fin.'
      return
    }

    mesasDisponibles.value = await getAvailableTables({
      date: fecha.value,
      start_time: horaInicio.value,
      end_time: horaFin.value,
    })
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar las mesas disponibles.'
  }
}

const submitConfirmarReserva = async (event) => {
  event.preventDefault()

  if (!mesaSeleccionada.value) {
    return
  }

  const productosPayload = productosSeleccionados.value
    .filter((item) => !item.esJuego)
    .map((item) => ({
      id_producto: item.id,
      cantidad: item.cantidad,
    }))

  const juegoSeleccionado = productosSeleccionados.value.find((item) => item.esJuego)

  try {
    await checkoutReservation({
      date: fecha.value,
      start_time: horaInicio.value,
      end_time: horaFin.value,
      mesa_id: Number(mesaSeleccionada.value),
      productos: productosPayload,
      juego_id: juegoSeleccionado ? juegoSeleccionado.id : null,
    })

    Swal.fire({
      title: '¡Éxito!',
      text: 'Reserva confirmada exitosamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    }).then(() => {
      router.push('/user_reservations')
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error?.response?.data?.detail || 'No se pudo confirmar la reserva.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

onMounted(async () => {
  try {
    await loadCatalogs()
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los catálogos.'
  }
})
</script>

<template>
  <div>
    <div class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <button class="menu-toggle" @click="toggleMenu">
        <span class="fas fa-bars"></span>
      </button>

      <div class="navbar-right" :class="{ active: menuOpen }">
        <RouterLink to="/inicio_usuario">Home</RouterLink>
        <RouterLink to="/food-menu">Menu</RouterLink>
        <RouterLink to="/game-menu">Productos</RouterLink>
        <RouterLink to="/user_reservations">Reservas</RouterLink>
        <RouterLink to="/ver_pedidos">Pedidos</RouterLink>
        <RouterLink to="/perfil_user"><i class="fas fa-user"></i></RouterLink>
        <a href="#" id="helpBtn" @click.prevent="openHelpPopup"><i class="fas fa-question-circle"></i></a>
      </div>
    </div>

    <div class="container">
      <div class="form-section">
        <h2>Reservar una Mesa</h2>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form id="reservaForm" @submit.prevent="continuarReserva">
          <div class="reservation-info">
            <label for="date">Fecha</label>
            <input id="date" v-model="fecha" type="date" name="date" required />

            <label for="start_time">Hora de Inicio</label>
            <input id="start_time" v-model="horaInicio" type="time" name="start_time" required />

            <label for="end_time">Hora de Fin</label>
            <input id="end_time" v-model="horaFin" type="time" name="end_time" required />
          </div>

          <button
            type="submit"
            class="continuar-btn"
            :class="{ hidden: mesasDisponibles.length }"
          >
            Continuar
          </button>
        </form>

        <div class="mesas-section" :class="{ hidden: !mesasDisponibles.length }">
          <h3>Mesas Disponibles</h3>
          <ul>
            <li v-for="mesaInfo in mesasVisibles" :key="mesaInfo.mesa.id_mesa">
              <input
                v-model="mesaSeleccionada"
                type="radio"
                name="mesa"
                class="mesa-radio"
                :value="mesaInfo.mesa.id_mesa"
                :disabled="!mesaInfo.disponible"
              />
              Mesa {{ mesaInfo.mesa.id_mesa }} - Capacidad: {{ mesaInfo.mesa.capacidad }} -
              Ubicación: {{ mesaInfo.mesa.ubicacion }}
              <span v-if="!mesaInfo.disponible">
                (Disponible a partir de {{ mesaInfo.proxima_disponibilidad }})
              </span>
            </li>
          </ul>
          <p
            id="mesa-error"
            style="color: red;"
            :style="{ display: mesaSeleccionada ? 'none' : 'none' }"
          >
            Selecciona una mesa
          </p>
        </div>

        <div class="categoria-section" :class="{ hidden: !mesasDisponibles.length }">
          <label for="categoria_productos">Categoría de Productos</label>
          <select id="categoria_productos" v-model="categoriaProductosSeleccionada">
            <option value="">Todas</option>
            <option
              v-for="categoria in categoriasProductos"
              :key="categoria.id_catProducto"
              :value="categoria.id_catProducto"
            >
              {{ categoria.nombre }}
            </option>
          </select>

          <label for="categoria_juegos">Categoría de Juegos</label>
          <select id="categoria_juegos" v-model="categoriaJuegosSeleccionada">
            <option value="">Todos</option>
            <option
              v-for="categoria in categoriasJuegos"
              :key="categoria.id_catJuego"
              :value="categoria.id_catJuego"
            >
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <div class="productos-section" :class="{ hidden: !mesasDisponibles.length }">
          <h3>Selecciona Productos</h3>
          <table id="productos-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Seleccionar</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="producto in productosVisibles"
                :key="producto.id_producto"
                :data-categoria="producto.categoria_producto_id_catProducto"
              >
                <td>
                  <img
                    :src="producto.imagen"
                    :alt="`Imagen de ${producto.nombre}`"
                    width="50"
                  />
                </td>
                <td>
                  <input
                    v-model="producto.checked"
                    type="checkbox"
                    class="producto-checkbox"
                    :data-id="producto.id_producto"
                    :data-precio="producto.precio"
                    @change="toggleProducto(producto, $event)"
                  />
                </td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.precio }}</td>
                <td>
                  <input
                    v-model="producto.cantidad"
                    type="number"
                    class="cantidad-producto"
                    min="1"
                    @change="updateCantidad(producto)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="juegos-section" :class="{ hidden: !mesasDisponibles.length }">
          <h3>Selecciona un Juego</h3>
          <table id="juegos-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Seleccionar</th>
                <th>Nombre</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="juego in juegosVisibles"
                :key="juego.id_juego"
                :data-categoria="juego.categoria_juego_id_catJuego"
              >
                <td>
                  <img
                    :src="juego.imagen"
                    :alt="`Imagen de ${juego.nombre}`"
                    width="50"
                  />
                </td>
                <td>
                  <input
                    v-model="juego.checked"
                    type="radio"
                    name="juego"
                    class="juego-radio"
                    :data-id="juego.id_juego"
                    :data-precio="juego.precio_alquiler"
                    @change="selectJuego(juego)"
                  />
                </td>
                <td>{{ juego.nombre }}</td>
                <td>{{ juego.precio_alquiler }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="productos-seleccionados-section"
          :class="{ hidden: !mesasDisponibles.length }"
        >
          <h3>Productos Seleccionados</h3>
          <table id="productos-seleccionados-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in productosSeleccionados"
                :key="`${item.esJuego}-${item.id}`"
                :data-id="item.id"
                :data-nombre="item.nombre"
                :data-precio="item.precio"
                :data-cantidad="item.cantidad"
                :data-total="(item.precio * item.cantidad).toFixed(2)"
                :data-es-juego="item.esJuego ? 'true' : 'false'"
              >
                <td>{{ item.nombre }}</td>
                <td>{{ Number(item.precio).toFixed(2) }}</td>
                <td>{{ item.cantidad }}</td>
                <td>{{ (item.precio * item.cantidad).toFixed(2) }}</td>
                <td>
                  <button
                    type="button"
                    class="eliminar-btn"
                    @click="removeProducto(item.id, item.esJuego)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div>Total: $<span id="total">{{ total }}</span></div>
        </div>

        <form
          id="confirmarReservaForm"
          :class="{ hidden: !mesasDisponibles.length }"
          @submit.prevent="submitConfirmarReserva"
        >
          <input type="hidden" name="date" :value="fecha" />
          <input type="hidden" name="start_time" :value="horaInicio" />
          <input type="hidden" name="end_time" :value="horaFin" />
          <input id="mesa-seleccionada" type="hidden" name="mesa" :value="mesaSeleccionada" />
          <input v-model="productosInput" type="hidden" name="productos" />
          <input v-model="juegoInput" type="hidden" name="juego" />
          <button type="submit" :disabled="!mesaSeleccionada">Confirmar Reserva</button>
          <button id="cancelarReservaBtn" type="button" @click="confirmCancel">Cancelar</button>
        </form>
      </div>
    </div>

    <div v-if="helpPopupOpen" id="helpPopup" class="help-popup">
      <div class="help-popup-content">
        <span class="close-btn" @click="closeHelpPopup">&times;</span>
        <h2>Guía de Reserva 🗒️</h2>
        <ol>
          <li>Selecciona la fecha de tu reserva. 📆</li>
          <li>Selecciona la hora de inicio y fin de tu reserva. 🕦</li>
          <li>Haz clic en "Continuar". ➡️</li>
          <li>Elige una mesa de las disponibles. 🪑</li>
          <li>Selecciona los productos y juegos que deseas agregar a tu reserva. 🍕</li>
          <li>Haz clic en "Confirmar Reserva" para completar el proceso. ✅</li>
        </ol>
        <h2>Cosas a tomar en cuenta 🗒️</h2>
        <ol>
          <li>Tomar en cuenta la hora de estadía en restaurante es de 2 horas y medía máximo. 🕦</li>
          <li>Las reservas solo se pueden hacer una vez por fecha. 🗓️</li>
          <li>Las reservas de juegos solo se puede pedir 1 por reserva. 🃏</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style>
.close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  color: #192847;
}

.help-popup {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.help-popup-content {
  position: relative;
  margin: 5% auto;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  background-color: #faf7e6;
  border-radius: 10px;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.help-popup .close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  color: #192847;
}

.help-popup h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #d48600;
  text-align: center;
}

.help-popup ol {
  padding-left: 20px;
  color: #192847;
}

.help-popup ol li {
  margin-bottom: 10px;
}
</style>   
    <style>
        .hidden {
            display: none;
        }

        .custom-checkbox {
            display: inline-block;
            width: 20px;
            height: 20px;
            background-color: #1c1c1c;
            border: 2px solid #d48600;
            border-radius: 5px;
            position: relative;
            cursor: pointer;
        }

        .custom-checkbox input {
            display: none;
        }

        .custom-checkbox input:checked + .checkmark::after {
            content: '✔';
            color: #d48600;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
        }

        .checkmark {
            display: block;
            width: 100%;
            height: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid #d48600;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #1c1c1c;
            color: #d48600;
        }

        td img {
            width: 50px;
            height: auto;
        }

        select, input[type="number"], input[type="date"], input[type="time"] {
            padding: 10px;
            border: 1px solid #d48600;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;
            background-color: #f0f0f0;
        }

        .eliminar-btn {
            background: none;
            border: none;
            color: #d48600;
            cursor: pointer;
            font-size: 18px;
        }

        .eliminar-btn i {
            font-size: 18px;
        }

        .continuar-btn {
            background-color: #1c1c1c;
            color: #d48600;
            border: 1px solid #d48600;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
        }

        .continuar-btn:hover {
            background-color: #d48600;
            color: #1c1c1c;
        }
        
        .swal2-cancel {
            background-color: #192847 !important;
            color: #fff !important;
        }

        .swal2-confirm {
            background-color: #d48600 !important;
            color: #fff !important;
            width: 120px !important;
        }
    </style>