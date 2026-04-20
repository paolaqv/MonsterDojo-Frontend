<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import { getReservations, updateReservation } from '@/services/reservations.service'

const router = useRouter()

const menuOpen = ref(false)
const selectedGroup = ref('todas')
const reservas = ref([])
const errorMessage = ref('')
const loading = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

const reservasFiltradas = computed(() => {
  if (selectedGroup.value === 'todas') {
    return reservas.value
  }

  return reservas.value.filter(
    (reserva) => normalizeEstado(reserva.estado) === selectedGroup.value.toLowerCase()
  )
})

const loadReservas = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getReservations()

    reservas.value = Array.isArray(data)
      ? data
      : (data?.items || data?.results || [])
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar las reservas.'
  } finally {
    loading.value = false
  }
}

const goToNewReservation = () => {
  router.push({ name: 'form-reserva' })
}

const editReserva = (idReserva) => {
  router.push({ name: 'editar-reserva', params: { id: idReserva } })
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
  router.push({ name: 'detalle-reserva', params: { id: idReserva } })
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
        <RouterLink to="/inicio_usuario">Home</RouterLink>
        <RouterLink to="/food-menu">Menu</RouterLink>
        <RouterLink to="/game-menu">Productos</RouterLink>
        <RouterLink to="/user_reservation">Reservas</RouterLink>
        <RouterLink to="/ver_pedidos">Pedidos</RouterLink>
        <RouterLink to="/perfil_user"><i class="fas fa-user"></i></RouterLink>
      </div>
    </div>

    <div class="container">
      <div class="title">Mis Reservas</div>

      <div class="group-by-container">
        <form @submit.prevent>
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todas">Todas</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </form>

        <button class="new-reserva-button" type="button" @click="goToNewReservation">
          Crear Nueva Reserva
        </button>
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
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Monto Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="5">No hay reservas disponibles.</td>
            </tr>

            <tr v-for="reserva in reservasFiltradas" :key="reserva.id_reserva">
              <td>{{ reserva.id_reserva }}</td>
              <td>{{ formatFechaHora(reserva.fecha_hora) }}</td>
              <td>{{ reserva.estado }}</td>
              <td>{{ formatMonto(reserva.monto_total) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="normalizeEstado(reserva.estado) === 'reservado'"
                    type="button"
                    class="editReservaBtn"
                    @click="editReserva(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(reserva.estado) === 'reservado'"
                    type="button"
                    class="deleteReservaBtn"
                    @click="deleteReserva(reserva)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(reserva.estado) === 'finalizado'"
                    type="button"
                    class="verDetallesBtn"
                    @click="verDetalles(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
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
.error-message {
  color: red;
  font-size: 0.9em;
  margin: 12px 0;
}
</style>
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

        .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .group-by-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            gap: 5px; 
        }

        .group-by-container form {
            display: flex;
            align-items: center;
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

        .new-reserva-button {
            background-color: #192847;
            color: #FAF7E6;
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: background-color 0.3s ease, color 0.3s ease;
            width: auto;
        }

        .new-reserva-button:hover {
            background-color: #d48600;
            color: #192847;
        }
    </style>