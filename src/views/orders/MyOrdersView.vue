<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const selectedGroup = ref('todos')
const pedidos = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const pedidosFiltrados = computed(() => {
  if (selectedGroup.value === 'todos') {
    return pedidos.value
  }

  return pedidos.value.filter(
    (pedido) => String(pedido.estado).toLowerCase() === selectedGroup.value.toLowerCase()
  )
})

const goToNewOrder = () => {
  window.location.href = '/agregar_pedido'
}

const viewPedido = (idPedido) => {
  window.location.href = `/userpedidos/${idPedido}`
}

const cancelPedido = (idPedido) => {
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
      </div>
    </div>

    <div class="container">
      <div class="title">Mis Pedidos</div>

      <div class="group-by-container">
        <form method="GET" action="/ver_pedidos">
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado">Cancelado</option>
            <option value="En progreso">En progreso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </form>

        <button class="new-reserva-button" @click="goToNewOrder">
          Crear Nuevo Pedido
        </button>
      </div>

      <div class="table-responsive">
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
            <tr v-for="pedido in pedidosFiltrados" :key="pedido.id_pedido">
              <td>{{ pedido.id_pedido }}</td>
              <td>{{ pedido.fecha_hora }}</td>
              <td>{{ pedido.estado }}</td>
              <td>{{ pedido.monto_total }}</td>
              <td>
                <div class="action-buttons">
                  <button class="viewPedidoBtn" @click="viewPedido(pedido.id_pedido)">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>

                  <button
                    v-if="pedido.estado === 'Pendiente'"
                    class="cancelPedidoBtn"
                    @click="cancelPedido(pedido.id_pedido)"
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