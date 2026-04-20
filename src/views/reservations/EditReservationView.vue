<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/form-reserva.css'
import logo from '@/assets/images/logo.png'

import {
  getReservationById,
  getReservationDetails,
  updateReservationCheckout,
} from '@/services/reservations.service'
import { getProducts } from '@/services/products.service'
import { getGames } from '@/services/games.service'

const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const reservationId = computed(() => route.params.id)

const reserva = ref({
  id_reserva: '',
  fecha_hora: '',
  mesa: {
    id_mesa: '',
    capacidad: '',
    ubicacion: '',
  },
  id_mesa: null,
})

const productos = ref([])
const juegos = ref([])
const detalleReservas = ref([])
const productosSeleccionados = ref([])
const selectedJuegoId = ref(null)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const total = computed(() => {
  return productosSeleccionados.value
    .reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    .toFixed(2)
})

const formatDateParts = (fechaHora) => {
  if (!fechaHora || typeof fechaHora !== 'string') {
    return { date: '', start_time: '', end_time: '' }
  }

  const [datePart, timePartRaw] = fechaHora.split('T')
  if (!datePart || !timePartRaw) {
    return { date: '', start_time: '', end_time: '' }
  }

  const [hours, minutes] = timePartRaw.slice(0, 5).split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { date: '', start_time: '', end_time: '' }
  }

  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + 150

  const pad = (value) => String(value).padStart(2, '0')

  return {
    date: datePart,
    start_time: `${pad(hours)}:${pad(minutes)}`,
    end_time: `${pad(Math.floor((endMinutes % 1440) / 60))}:${pad(endMinutes % 60)}`,
  }
}

const addProducto = (id, nombre, precio, cantidad, esJuego = false) => {
  const existe = productosSeleccionados.value.find(
    (item) => item.id === id && item.esJuego === esJuego
  )

  if (existe) {
    existe.cantidad = Number(cantidad)
    return
  }

  productosSeleccionados.value.push({
    id,
    nombre,
    precio: Number(precio),
    cantidad: Number(cantidad),
    esJuego,
  })
}

const removeProducto = (id, esJuego = false) => {
  productosSeleccionados.value = productosSeleccionados.value.filter(
    (item) => !(item.id === id && item.esJuego === esJuego)
  )

  if (esJuego) {
    selectedJuegoId.value = null
    const juego = juegos.value.find((item) => item.id_juego === id)
    if (juego) juego.checked = false
  } else {
    const producto = productos.value.find((item) => item.id_producto === id)
    if (producto) producto.checked = false
  }
}

const toggleProducto = (producto, event) => {
  const checked = event.target.checked
  const id = producto.id_producto
  const nombre = producto.nombre
  const precio = Number(producto.precio)
  const cantidad = Number(producto.cantidad || 1)

  if (checked) {
    addProducto(id, nombre, precio, cantidad, false)
  } else {
    removeProducto(id, false)
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

  selectedJuegoId.value = juego.id_juego
  addProducto(juego.id_juego, juego.nombre, Number(juego.precio_alquiler), 1, true)
}

const confirmCancel = async () => {
  const result = await Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar? Se perderán los cambios no guardados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, volver',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  })

  if (result.isConfirmed) {
    router.push({ name: 'user_reservation' })
  }
}

const loadCatalogs = async () => {
  const [productosData, juegosData] = await Promise.all([getProducts(), getGames()])

  productos.value = (Array.isArray(productosData) ? productosData : productosData?.items || []).map(
    (item) => ({
      ...item,
      checked: false,
      cantidad: 1,
    })
  )

  juegos.value = (Array.isArray(juegosData) ? juegosData : juegosData?.items || []).map((item) => ({
    ...item,
    checked: false,
  }))
}

const loadReservation = async () => {
  const [reservationData, detailsData] = await Promise.all([
    getReservationById(reservationId.value),
    getReservationDetails(reservationId.value),
  ])

  console.log('reservationData =>', reservationData)

reserva.value = {
  ...reservationData,
  id_mesa:
    reservationData?.id_mesa ??
    reservationData?.mesa_id ??
    reservationData?.mesa_id_mesa ??
    reservationData?.mesa?.id_mesa ??
    null,
  mesa: reservationData?.mesa ?? reservationData?.mesa_rel ?? null,
}

  detalleReservas.value = Array.isArray(detailsData) ? detailsData : detailsData?.items || []
}

const syncSelectionFromReservation = () => {
  productosSeleccionados.value = []

  detalleReservas.value.forEach((detalle) => {
    const productId =
      detalle.producto_rel?.id_producto ||
      detalle.producto?.id_producto ||
      detalle.producto_id_producto
    const nombre =
      detalle.producto_rel?.nombre ||
      detalle.producto?.nombre ||
      detalle.nombre
    const precio = Number(detalle.precio)
    const cantidad = Number(detalle.cantidad)

    if (!productId) return

    addProducto(productId, nombre, precio, cantidad, false)

    const producto = productos.value.find((item) => item.id_producto === productId)
    if (producto) {
      producto.checked = true
      producto.cantidad = cantidad
    }
  })
}

const submitForm = async () => {
  try {
    saving.value = true

    const { date, start_time, end_time } = formatDateParts(reserva.value.fecha_hora)

    const productosPayload = productosSeleccionados.value
      .filter((item) => !item.esJuego)
      .map((item) => ({
        id_producto: item.id,
        cantidad: item.cantidad,
      }))

const payload = {
  date,
  start_time,
  end_time,
  mesa_id:
    reserva.value?.id_mesa ??
    reserva.value?.mesa_id ??
    reserva.value?.mesa_id_mesa ??
    reserva.value?.mesa?.id_mesa ??
    null,
  productos: productosPayload,
  ...(selectedJuegoId.value ? { juego_id: selectedJuegoId.value } : {}),
}
console.log('payload update reservation =>', payload)
    await updateReservationCheckout(reservationId.value, payload)

    await Swal.fire({
      title: '¡Éxito!',
      text: 'Cambios guardados exitosamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal2-confirm',
      },
    })

    router.push({ name: 'user_reservation' })
  } catch (error) {
    Swal.fire(
      'Error',
      error?.response?.data?.detail || 'No se pudo actualizar la reserva.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    await loadCatalogs()
    await loadReservation()
    syncSelectionFromReservation()
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los datos de la reserva.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <button class="menu-toggle" type="button" @click="toggleMenu">
        <span class="fas fa-bars"></span>
      </button>

      <div class="navbar-right" :class="{ active: menuOpen }">
        <RouterLink to="/inicio_usuario">Home</RouterLink>
        <RouterLink to="/food-menu">Menu</RouterLink>
        <RouterLink to="/game-menu">Productos</RouterLink>
        <RouterLink to="/user_reservation">Reservas</RouterLink>
        <RouterLink to="/ver_pedidos">Pedidos</RouterLink>
        <RouterLink to="/perfil_user"><i class="fas fa-user"></i></RouterLink>
      </div>
    </div>

    <div class="container">
      <div class="form-section">
        <h2>Editar Reserva</h2>

        <div v-if="loading">Cargando datos...</div>
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <form v-else id="editarReservaForm" @submit.prevent="submitForm">
<div class="mesas-section">
  <h3>Mesa Seleccionada</h3>
  <p v-if="reserva.id_mesa">
    Mesa {{ reserva.id_mesa }}
    <span v-if="reserva.mesa?.capacidad"> - Capacidad: {{ reserva.mesa.capacidad }}</span>
    <span v-if="reserva.mesa?.ubicacion"> - Ubicación: {{ reserva.mesa.ubicacion }}</span>
  </p>
  <p v-else>No se pudo obtener la mesa de la reserva.</p>
</div>

          <div class="productos-section">
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
                <tr v-for="producto in productos" :key="producto.id_producto">
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
                      @change="toggleProducto(producto, $event)"
                    />
                  </td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.precio }}</td>
                  <td>
                    <input
                      v-model="producto.cantidad"
                      type="number"
                      min="1"
                      class="cantidad-producto"
                      @change="updateCantidad(producto)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="juegos-section">
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
                <tr v-for="juego in juegos" :key="juego.id_juego">
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
                      name="juego_radio"
                      class="juego-radio"
                      @change="selectJuego(juego)"
                    />
                  </td>
                  <td>{{ juego.nombre }}</td>
                  <td>{{ juego.precio_alquiler }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="productos-seleccionados-section">
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
                <tr v-for="item in productosSeleccionados" :key="`${item.esJuego}-${item.id}`">
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

            <div>Total: Bs {{ total }}</div>
          </div>

          <button type="submit" id="guardarCambiosBtn" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>

          <button type="button" id="cancelarEdicionBtn" @click="confirmCancel">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
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