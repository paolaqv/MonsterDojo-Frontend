<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const selectedGroup = ref('todos')
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')
const pedidos = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const filteredPedidos = computed(() => {
  let data = [...pedidos.value]

  if (selectedGroup.value !== 'todos') {
    data = data.filter(
      (pedidoInfo) =>
        pedidoInfo.pedido.estado.toLowerCase() === selectedGroup.value.toLowerCase()
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter((pedidoInfo) => {
      const pedido = pedidoInfo.pedido
      return (
        String(pedido.id_pedido).toLowerCase().includes(query) ||
        String(pedido.usuario_rel.nombre).toLowerCase().includes(query) ||
        String(pedido.fecha_hora).toLowerCase().includes(query) ||
        String(pedido.estado).toLowerCase().includes(query) ||
        String(pedidoInfo.total).toLowerCase().includes(query)
      )
    })
  }

  if (sortBy.value) {
    data.sort((a, b) => {
      let valueA = ''
      let valueB = ''

      if (sortBy.value === 'id_pedido') {
        valueA = a.pedido.id_pedido
        valueB = b.pedido.id_pedido
      } else if (sortBy.value === 'usuario_rel.nombre') {
        valueA = a.pedido.usuario_rel.nombre
        valueB = b.pedido.usuario_rel.nombre
      } else if (sortBy.value === 'fecha_hora') {
        valueA = a.pedido.fecha_hora
        valueB = b.pedido.fecha_hora
      } else if (sortBy.value === 'estado') {
        valueA = a.pedido.estado
        valueB = b.pedido.estado
      } else if (sortBy.value === 'monto_total') {
        valueA = a.total
        valueB = b.total
      }

      if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return data
})

const cambiarEstadoPedido = (idPedido, nuevoEstado) => {
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
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/cambiar_estado_pedido/${idPedido}/${nuevoEstado}`, {
        method: 'POST',
      }).then((response) => {
        if (response.ok) {
          Swal.fire('¡Cambiado!', 'El estado del pedido ha sido cambiado.', 'success').then(() => {
            window.location.reload()
          })
        } else {
          Swal.fire('Error', 'No se pudo cambiar el estado del pedido.', 'error')
        }
      })
    }
  })
}

const cancelarPedido = (idPedido) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar el pedido?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/cancelar_pedido/${idPedido}`, {
        method: 'POST',
      }).then((response) => {
        if (response.ok) {
          Swal.fire('¡Cancelado!', 'El pedido ha sido cancelado.', 'success').then(() => {
            window.location.reload()
          })
        } else {
          Swal.fire('Error', 'No se pudo cancelar el pedido.', 'error')
        }
      })
    }
  })
}

const verDetalles = (idPedido) => {
  window.location.href = `/verDetalle-pedido/${idPedido}`
}

const sortTable = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}
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
        <li><RouterLink to="/perfil_admin"><i class="fa-solid fa-user-gear"></i></RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="title">Panel de Pedidos</div>

      <div class="group-by-container">
        <form method="GET" action="/pedidos_panel">
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="realizado">Realizado</option>
          </select>
          <input type="hidden" name="search" :value="searchQuery" />
          <input type="hidden" name="sort_by" :value="sortBy" />
          <input type="hidden" name="sort_order" :value="sortOrder" />
        </form>
      </div>

      <div class="actions-container">
        <form method="GET" action="/pedidos_panel">
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              name="search"
              placeholder="Buscar pedido"
            />
            <button type="submit">Buscar <i class="fa-solid fa-search"></i></button>
          </div>
        </form>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>
                ID
                <button class="filter-btn" @click="sortTable('id_pedido')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Cliente
                <button class="filter-btn" @click="sortTable('usuario_rel.nombre')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Fecha y Hora
                <button class="filter-btn" @click="sortTable('fecha_hora')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Estado
                <button class="filter-btn" @click="sortTable('estado')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Monto Total
                <button class="filter-btn" @click="sortTable('monto_total')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="pedidoInfo in filteredPedidos" :key="pedidoInfo.pedido.id_pedido">
              <td>{{ pedidoInfo.pedido.id_pedido }}</td>
              <td>{{ pedidoInfo.pedido.usuario_rel.nombre }}</td>
              <td>{{ pedidoInfo.pedido.fecha_hora }}</td>
              <td>{{ pedidoInfo.pedido.estado }}</td>
              <td>{{ pedidoInfo.total }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="verDetallesBtn"
                    @click="verDetalles(pedidoInfo.pedido.id_pedido)"
                  >
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                  </button>

                  <button
                    v-if="pedidoInfo.pedido.estado === 'Pendiente'"
                    class="cambiarEstadoBtn"
                    @click="cambiarEstadoPedido(pedidoInfo.pedido.id_pedido, 'En Progreso')"
                  >
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>

                  <button
                    v-else-if="pedidoInfo.pedido.estado === 'En Progreso'"
                    class="cambiarEstadoBtn"
                    @click="cambiarEstadoPedido(pedidoInfo.pedido.id_pedido, 'Finalizado')"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>

                  <button
                    class="cancelarPedidoBtn"
                    @click="cancelarPedido(pedidoInfo.pedido.id_pedido)"
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