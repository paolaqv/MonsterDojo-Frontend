<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import {
  getAdminReservations,
  updateReservation,
} from '@/services/reservations.service'

const router = useRouter()

const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
const userRole = storedUser?.rol_id_rol || ''
const homeRoute = userRole === 'encargadoLocal' ? '/adminpanel' : '/panel-mesero'

const menuOpen = ref(false)
const selectedGroup = ref('todas')
const reservas = ref([])
const errorMessage = ref('')
const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

const reservasFiltradas = computed(() => {
  let data = [...reservas.value]

  if (selectedGroup.value !== 'todas') {
    data = data.filter(
      (reserva) => normalizeEstado(reserva.estado) === selectedGroup.value.toLowerCase()
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter((reserva) => {
      return (
        String(reserva.id_reserva || '').toLowerCase().includes(query) ||
        String(reserva.usuario?.nombre || reserva.usuario_rel?.nombre || '').toLowerCase().includes(query) ||
        String(reserva.fecha_hora || '').toLowerCase().includes(query) ||
        String(reserva.estado || '').toLowerCase().includes(query) ||
        String(reserva.monto_total || '').toLowerCase().includes(query)
      )
    })
  }

  if (sortBy.value) {
    data.sort((a, b) => {
      let valueA = ''
      let valueB = ''

      if (sortBy.value === 'id_reserva') {
        valueA = Number(a.id_reserva || 0)
        valueB = Number(b.id_reserva || 0)
      } else if (sortBy.value === 'nombre') {
        valueA = String(a.usuario?.nombre || a.usuario_rel?.nombre || '')
        valueB = String(b.usuario?.nombre || b.usuario_rel?.nombre || '')
      } else if (sortBy.value === 'fecha_hora') {
        valueA = String(a.fecha_hora || '')
        valueB = String(b.fecha_hora || '')
      } else if (sortBy.value === 'estado') {
        valueA = String(a.estado || '')
        valueB = String(b.estado || '')
      } else if (sortBy.value === 'monto_total') {
        valueA = Number(a.monto_total || 0)
        valueB = Number(b.monto_total || 0)
      }

      if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return data
})

const loadReservas = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getAdminReservations()

    reservas.value = Array.isArray(data)
      ? data
      : (data?.items || data?.results || [])
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar las reservas.'
  } finally {
    loading.value = false
  }
}

const deleteReserva = (reserva) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar la reserva?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, volver',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      await updateReservation(reserva.id_reserva, {
        ...reserva,
        estado: 'Cancelado',
      })

      await Swal.fire('¡Cancelada!', 'La reserva ha sido cancelada.', 'success')
      await loadReservas()
    } catch (error) {
      Swal.fire(
        'Error',
        error?.response?.data?.detail || 'No se pudo cancelar la reserva.',
        'error'
      )
    }
  })
}

const verDetalles = (idReserva) => {
  router.push({ name: 'verDetalle-reserva', params: { id: idReserva } })
}

const sortTable = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const formatFechaHora = (fecha) => {
  if (!fecha) return '-'

  const parsedDate = new Date(fecha)
  if (Number.isNaN(parsedDate.getTime())) return fecha

  return parsedDate.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMonto = (monto) => {
  if (monto === null || monto === undefined || monto === '') return '-'

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(Number(monto))
}

onMounted(async () => {
  await loadReservas()
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
        <li><RouterLink :to="homeRoute">Inicio</RouterLink></li>
        <li><RouterLink to="/game_panel">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>
        <li>
          <RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink>
        </li>
        <li><RouterLink to="/logout"><i class="fa-solid fa-sign-out"></i></RouterLink></li>
      </div>
    </div>

    <div class="container">
      <div class="title">Panel de Reservas</div>

      <div class="group-by-container">
        <form @submit.prevent>
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todas">Todas</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </form>
      </div>

      <div class="actions-container">
        <form @submit.prevent>
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              name="search"
              placeholder="Buscar reserva"
            />
            <button type="button">Buscar <i class="fa-solid fa-search"></i></button>
          </div>
        </form>
      </div>

      <div v-if="loading" class="info-message">
        Cargando reservas...
      </div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>
                ID
                <button type="button" class="filter-btn" @click="sortTable('id_reserva')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Cliente
                <button type="button" class="filter-btn" @click="sortTable('nombre')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Fecha y Hora
                <button type="button" class="filter-btn" @click="sortTable('fecha_hora')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Estado Reserva
                <button type="button" class="filter-btn" @click="sortTable('estado')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Monto Total
                <button type="button" class="filter-btn" @click="sortTable('monto_total')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="6">No hay reservas disponibles.</td>
            </tr>

            <tr v-for="reserva in reservasFiltradas" :key="reserva.id_reserva">
              <td>{{ reserva.id_reserva }}</td>
              <td>{{ reserva.usuario?.nombre || reserva.usuario_rel?.nombre || '-' }}</td>
              <td>{{ formatFechaHora(reserva.fecha_hora) }}</td>
              <td>{{ reserva.estado }}</td>
              <td>{{ formatMonto(reserva.monto_total) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    type="button"
                    class="verDetallesBtn"
                    @click="verDetalles(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(reserva.estado) === 'reservado'"
                    type="button"
                    class="deleteReservaBtn"
                    @click="deleteReserva(reserva)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  gap: 20px;
}
.table-responsive {
  margin-top: 20px;
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
</style>