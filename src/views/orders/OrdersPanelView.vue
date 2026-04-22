<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'
import { getOrders, updateOrder } from '@/services/orders.service'

const router = useRouter()

const menuOpen = ref(false)
const selectedGroup = ref('todos')
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')
const pedidos = ref([])
const loading = ref(false)
const errorMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

const normalizedPedidos = computed(() => {
  return pedidos.value.map((item) => {
    if (item?.pedido) {
      return {
        pedido: item.pedido,
        total: Number(item.total ?? item.pedido?.monto_total ?? 0),
      }
    }

    return {
      pedido: item,
      total: Number(item?.monto_total ?? item?.total ?? 0),
    }
  })
})

const filteredPedidos = computed(() => {
  let data = [...normalizedPedidos.value]

  if (selectedGroup.value !== 'todos') {
    data = data.filter(
      (pedidoInfo) =>
        normalizeEstado(pedidoInfo.pedido.estado) === selectedGroup.value.toLowerCase()
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter((pedidoInfo) => {
      const pedido = pedidoInfo.pedido
      return (
        String(pedido.id_pedido || '').toLowerCase().includes(query) ||
        String(pedido.usuario_rel?.nombre || pedido.usuario?.nombre || '').toLowerCase().includes(query) ||
        String(pedido.fecha_hora || '').toLowerCase().includes(query) ||
        String(pedido.estado || '').toLowerCase().includes(query) ||
        String(pedidoInfo.total || '').toLowerCase().includes(query)
      )
    })
  }

  if (sortBy.value) {
    data.sort((a, b) => {
      let valueA = ''
      let valueB = ''

      if (sortBy.value === 'id_pedido') {
        valueA = Number(a.pedido.id_pedido || 0)
        valueB = Number(b.pedido.id_pedido || 0)
      } else if (sortBy.value === 'usuario_rel.nombre') {
        valueA = String(a.pedido.usuario_rel?.nombre || a.pedido.usuario?.nombre || '')
        valueB = String(b.pedido.usuario_rel?.nombre || b.pedido.usuario?.nombre || '')
      } else if (sortBy.value === 'fecha_hora') {
        valueA = String(a.pedido.fecha_hora || '')
        valueB = String(b.pedido.fecha_hora || '')
      } else if (sortBy.value === 'estado') {
        valueA = String(a.pedido.estado || '')
        valueB = String(b.pedido.estado || '')
      } else if (sortBy.value === 'monto_total') {
        valueA = Number(a.total || 0)
        valueB = Number(b.total || 0)
      }

      if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return data
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

const loadOrders = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getOrders()
    pedidos.value = Array.isArray(data) ? data : (data?.items || data?.results || [])
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los pedidos.'
  } finally {
    loading.value = false
  }
}

const cambiarEstadoPedido = (pedidoInfo, nuevoEstado) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cambiar el estado del pedido?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      await updateOrder(pedidoInfo.pedido.id_pedido, {
        ...pedidoInfo.pedido,
        estado: nuevoEstado,
      })

      await Swal.fire('¡Cambiado!', 'El estado del pedido ha sido cambiado.', 'success')
      await loadOrders()
    } catch (error) {
      Swal.fire(
        'Error',
        error?.response?.data?.detail || 'No se pudo cambiar el estado del pedido.',
        'error'
      )
    }
  })
}

const cancelarPedido = (pedidoInfo) => {
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
      await updateOrder(pedidoInfo.pedido.id_pedido, {
        ...pedidoInfo.pedido,
        estado: 'Cancelado',
      })

      await Swal.fire('¡Cancelado!', 'El pedido ha sido cancelado.', 'success')
      await loadOrders()
    } catch (error) {
      Swal.fire(
        'Error',
        error?.response?.data?.detail || 'No se pudo cancelar el pedido.',
        'error'
      )
    }
  })
}

const verDetalles = (idPedido) => {
  router.push(`/verDetalle-pedido/${idPedido}`)
}

const sortTable = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

onMounted(async () => {
  await loadOrders()
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
      <div class="title">Panel de Pedidos</div>

      <div class="group-by-container">
        <form @submit.prevent>
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En Progreso</option>
            <option value="finalizado">Finalizado</option>
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
              placeholder="Buscar pedido"
            />
            <button type="button">Buscar <i class="fa-solid fa-search"></i></button>
          </div>
        </form>
      </div>

      <div v-if="loading">Cargando pedidos...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>
                ID
                <button type="button" class="filter-btn" @click="sortTable('id_pedido')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Cliente
                <button type="button" class="filter-btn" @click="sortTable('usuario_rel.nombre')">
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
                Estado
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
            <tr v-if="filteredPedidos.length === 0">
              <td colspan="6">No hay pedidos disponibles.</td>
            </tr>

            <tr v-for="pedidoInfo in filteredPedidos" :key="pedidoInfo.pedido.id_pedido">
              <td>{{ pedidoInfo.pedido.id_pedido }}</td>
              <td>{{ pedidoInfo.pedido.usuario_rel?.nombre || pedidoInfo.pedido.usuario?.nombre || '-' }}</td>
              <td>{{ formatFechaHora(pedidoInfo.pedido.fecha_hora) }}</td>
              <td>{{ pedidoInfo.pedido.estado }}</td>
              <td>{{ formatMonto(pedidoInfo.total) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    type="button"
                    class="verDetallesBtn"
                    @click="verDetalles(pedidoInfo.pedido.id_pedido)"
                  >
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(pedidoInfo.pedido.estado) === 'pendiente'"
                    type="button"
                    class="cambiarEstadoBtn"
                    @click="cambiarEstadoPedido(pedidoInfo, 'En Progreso')"
                  >
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>

                  <button
                    v-else-if="normalizeEstado(pedidoInfo.pedido.estado) === 'en progreso'"
                    type="button"
                    class="cambiarEstadoBtn"
                    @click="cambiarEstadoPedido(pedidoInfo, 'Finalizado')"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>

                  <button
                    v-if="normalizeEstado(pedidoInfo.pedido.estado) !== 'finalizado' && normalizeEstado(pedidoInfo.pedido.estado) !== 'cancelado'"
                    type="button"
                    class="cancelarPedidoBtn"
                    @click="cancelarPedido(pedidoInfo)"
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
        .container {
            padding: 20px;
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