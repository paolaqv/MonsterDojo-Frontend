<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/reserva-activa.css'
import logo from '@/assets/images/logo.png'
import { getReservations, updateReservation } from '@/services/reservations.service'

const router = useRouter()

const menuOpen = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const reservas = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

const activeReservation = computed(() => {
  return reservas.value.find(
    (reserva) => normalizeEstado(reserva.estado) === 'reservado'
  ) || null
})

const formatFecha = (fecha) => {
  if (!fecha) return '-'

  const parsed = new Date(fecha)
  if (Number.isNaN(parsed.getTime())) return fecha

  return parsed.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatHora = (fecha) => {
  if (!fecha) return '-'

  const parsed = new Date(fecha)
  if (Number.isNaN(parsed.getTime())) return fecha

  return parsed.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadReservations = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getReservations()
    reservas.value = Array.isArray(data) ? data : (data?.items || data?.results || [])
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo cargar la reserva actual.'
  } finally {
    loading.value = false
  }
}

const cancelReservation = async () => {
  if (!activeReservation.value) return

  const result = await Swal.fire({
    title: '¿Está seguro?',
    text: '¿Desea cancelar la reserva actual?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, volver',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  })

  if (!result.isConfirmed) return

  try {
    await updateReservation(activeReservation.value.id_reserva, {
      ...activeReservation.value,
      estado: 'Cancelado',
    })

    await Swal.fire('¡Cancelada!', 'La reserva ha sido cancelada.', 'success')
    await loadReservations()
  } catch (error) {
    Swal.fire(
      'Error',
      error?.response?.data?.detail || 'No se pudo cancelar la reserva.',
      'error'
    )
  }
}

const editReservation = () => {
  if (!activeReservation.value) return
  router.push({ name: 'editar-reserva', params: { id: activeReservation.value.id_reserva } })
}

onMounted(async () => {
  await loadReservations()
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
      <div class="reservation-section">
        <h2>Reserva Actual</h2>

        <div v-if="loading">Cargando reserva...</div>
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <template v-else-if="activeReservation">
          <div class="reservation-info">
            <label for="date">Fecha:</label>
            <p id="date">{{ formatFecha(activeReservation.fecha_hora) }}</p>

            <label for="time">Hora:</label>
            <p id="time">{{ formatHora(activeReservation.fecha_hora) }}</p>

            <label for="table">Mesa:</label>
            <p id="table">
              {{ activeReservation.mesa?.ubicacion || `Mesa ${activeReservation.mesa_id_mesa || '-'}` }}
            </p>

            <label for="status">Estado:</label>
            <p id="status">{{ activeReservation.estado }}</p>

            <span>
              <i class="fas fa-info-circle"></i>
              Tomar en cuenta: Se permiten hasta 10 minutos de retraso, la reserva se cancela automáticamente en caso de llegar más tarde.
            </span>
          </div>

          <div class="reservation-actions">
            <button type="button" class="cancel-btn" @click="cancelReservation">
              Cancelar Reserva
            </button>
            <button type="button" class="edit-btn" @click="editReservation">
              Modificar Reserva
            </button>
          </div>
        </template>

        <template v-else>
          <div class="reservation-info">
            <p>No tienes una reserva activa.</p>
          </div>

          <div class="reservation-actions">
            <button type="button" class="edit-btn" @click="router.push({ name: 'form-reserva' })">
              Crear Reserva
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>