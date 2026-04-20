<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import { getOrders, updateOrder } from '@/services/orders.service'

const router = useRouter()

const menuOpen = ref(false)
const selectedGroup = ref('todos')
const pedidos = ref([])
const loading = ref(false)
const errorMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

const pedidosFiltrados = computed(() => {
  if (selectedGroup.value === 'todos') {
    return pedidos.value
  }

  return pedidos.value.filter(
    (pedido) => normalizeEstado(pedido.estado) === selectedGroup.value.toLowerCase()
  )
})

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
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(Number(monto || 0))
}

const loadPedidos = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getOrders()
    pedidos.value = Array.isArray(data) ? data : (data?.items || data?.results || [])
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los pedidos.'
  } finally {
    loading.value = false
  }
}

const goToNewOrder = () => {
  router.push('/agregar-pedido')
}

const viewPedido = (idPedido) => {
  router.push(`/userpedidos/${idPedido}`)
}

const cancelPedido = (pedido) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar el pedido?',
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
      await updateOrder(pedido.id_pedido, {
        ...pedido,
        estado: 'Cancelado',
      })

      await Swal.fire('¡Cancelado!', 'El pedido ha sido cancelado.', 'success')
      await loadPedidos()
    } catch (error) {
      Swal.fire(
        'Error',
        error?.response?.data?.detail || 'No se pudo cancelar el pedido.',
        'error'
      )
    }
  })
}

onMounted(async () => {
  await loadPedidos()
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
      <div class="title">Mis Pedidos</div>

      <div class="group-by-container">
        <form @submit.prevent>
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelado">Cancelado</option>
            <option value="en progreso">En progreso</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </form>

        <button class="new-reserva-button" type="button" @click="goToNewOrder">
          Crear Nuevo Pedido
        </button>
      </div>

      <div v-if="loading">Cargando pedidos...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Monto Total Bs</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="pedidosFiltrados.length === 0">
              <td colspan="5">No hay pedidos disponibles.</td>
            </tr>

            <tr v-for="pedido in pedidosFiltrados" :key="pedido.id_pedido">
              <td>{{ pedido.id_pedido }}</td>
              <td>{{ formatFechaHora(pedido.fecha_hora) }}</td>
              <td>{{ pedido.estado }}</td>
              <td>{{ formatMonto(pedido.monto_total) }}</td>
              <td>
                <div class="action-buttons">
                  <button type="button" class="viewPedidoBtn" @click="viewPedido(pedido.id_pedido)">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(pedido.estado) === 'pendiente'"
                    type="button"
                    class="cancelPedidoBtn"
                    @click="cancelPedido(pedido)"
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