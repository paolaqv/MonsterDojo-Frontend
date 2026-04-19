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
const selectedGroup = ref('todas')
const reservas = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const reservasFiltradas = computed(() => {
  if (selectedGroup.value === 'todas') {
    return reservas.value
  }

  return reservas.value.filter(
    (reserva) => String(reserva.estado).toLowerCase() === selectedGroup.value.toLowerCase()
  )
})

const goToNewReservation = () => {
  window.location.href = '/form_reserva'
}

const editReserva = (idReserva) => {
  window.location.href = `/editar_reserva/${idReserva}`
}

const deleteReserva = (idReserva) => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar la reserva?',
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
      fetch(`/cancelar_reserva/${idReserva}`, {
        method: 'POST',
      }).then((response) => {
        if (response.ok) {
          Swal.fire('¡Cancelada!', 'La reserva ha sido cancelada.', 'success').then(() => {
            window.location.reload()
          })
        } else {
          Swal.fire('Error', 'No se pudo cancelar la reserva.', 'error')
        }
      })
    }
  })
}

const verDetalles = (idReserva) => {
  window.location.href = `/receipt_reserva/${idReserva}`
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
      <div class="title">Mis Reservas</div>

      <div class="group-by-container">
        <form method="GET" action="/user_reservations">
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todas">Todas</option>
            <option value="reservados">Reservados</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </form>

        <button class="new-reserva-button" @click="goToNewReservation">
          Crear Nueva Reserva
        </button>
      </div>

      <div class="table-responsive">
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
            <tr v-for="reserva in reservasFiltradas" :key="reserva.id_reserva">
              <td>{{ reserva.id_reserva }}</td>
              <td>{{ reserva.fecha_hora }}</td>
              <td>{{ reserva.estado }}</td>
              <td>{{ reserva.monto_total }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="reserva.estado === 'Reservado'"
                    class="editReservaBtn"
                    @click="editReserva(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-edit"></i>
                  </button>

                  <button
                    v-if="reserva.estado === 'Reservado'"
                    class="deleteReservaBtn"
                    @click="deleteReserva(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                  <button
                    v-if="reserva.estado === 'Finalizado'"
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