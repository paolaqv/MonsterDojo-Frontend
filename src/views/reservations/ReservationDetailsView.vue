<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import {
  getReservationByIdAdmin,
  getReservationDetailsAdmin,
} from '@/services/reservations.service'

const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const reserva = ref({
  id_reserva: '',
  fecha_hora: '',
  estado: '',
  usuario: {
    nombre: '',
  },
  mesa: {
    ubicacion: '',
  },
})

const productos = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const reservationId = computed(() => route.params.id)

const formatDateTime = (value) => {
  if (!value) return '-'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (value) => {
  const amount = Number(value || 0)
  return amount.toFixed(2)
}

const totalReserva = computed(() => {
  return normalizedProductos.value
    .reduce((acc, item) => acc + Number(item.total || 0), 0)
    .toFixed(2)
})

const normalizedProductos = computed(() => {
  return productos.value.map((item, index) => {
    const nombre =
      item.producto_rel?.nombre ||
      item.producto?.nombre ||
      item.nombre ||
      `Producto ${index + 1}`

    const cantidad = Number(item.cantidad || 0)
    const precioUnitario = Number(
      item.precio_unitario ?? item.precio ?? item.producto_rel?.precio ?? 0
    )
    const total = cantidad * precioUnitario

    return {
      key: item.id_detalleReserva || `${nombre}-${index}`,
      nombre,
      cantidad,
      precio_unitario: precioUnitario,
      total,
    }
  })
})

const loadReservationDetails = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const [reservationData, detailsData] = await Promise.all([
      getReservationByIdAdmin(reservationId.value),
      getReservationDetailsAdmin(reservationId.value),
    ])

    reserva.value = reservationData
    productos.value = Array.isArray(detailsData) ? detailsData : detailsData?.items || []
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los detalles de la reserva.'
  } finally {
    loading.value = false
  }
}

const goToReceipt = () => {
  router.push({ name: 'receipt-reserva', params: { id: reserva.value.id_reserva } })
}

onMounted(async () => {
  await loadReservationDetails()
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
        <li><RouterLink to="/game-menu">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>
        <li>
          <RouterLink to="/perfil_admin">
            <i class="fa-solid fa-user-gear"></i>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="title">Detalles de la Reserva</div>

      <div v-if="loading">Cargando detalles...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <template v-else>
        <div class="header-container">
          <div>
            <p><strong>Cliente:</strong> {{ reserva.usuario?.nombre || '-' }}</p>
            <p><strong>Mesa:</strong> {{ reserva.mesa?.ubicacion || '-' }}</p>
          </div>

          <div>
            <p><strong>Fecha y hora de la reserva:</strong> {{ formatDateTime(reserva.fecha_hora) }}</p>
            <p><strong>Estado:</strong> {{ reserva.estado || '-' }}</p>
          </div>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="normalizedProductos.length === 0">
                <td colspan="4">No hay productos registrados para esta reserva.</td>
              </tr>

              <tr v-for="item in normalizedProductos" :key="item.key">
                <td>{{ item.nombre }}</td>
                <td>{{ item.cantidad }}</td>
                <td>{{ formatMoney(item.precio_unitario) }}</td>
                <td>{{ formatMoney(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-summary">
          <p><strong>Total:</strong> {{ totalReserva }} Bs.</p>
        </div>

        <button
          v-if="String(reserva.estado || '').trim().toLowerCase() === 'finalizado'"
          class="recibo-btn"
          @click="goToReceipt"
        >
          Ver Recibo
        </button>
      </template>
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

.container {
  padding: 20px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: #f9bf03;
  padding: 15px;
  border-radius: 10px;
}

.header-container div {
  width: 48%;
}

.header-container div p {
  margin: 5px 0;
}

.table-responsive {
  margin-top: 20px;
}

.table-summary {
  margin-top: 20px;
  text-align: right;
  background-color: #f9bf03;
  padding: 15px;
  border-radius: 10px;
  width: 250px;
  margin-left: auto;
}

.table-summary p {
  margin: 5px 0;
}

.recibo-btn {
  display: block;
  margin: 20px auto;
  background-color: #d48600;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 120px;
}
</style>