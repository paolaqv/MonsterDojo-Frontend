<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const selectedGroup = ref('todas')
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')
const reservas = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const filteredReservas = computed(() => {
  let data = [...reservas.value]

  if (selectedGroup.value !== 'todas') {
    data = data.filter(
      (reserva) => String(reserva.estado).toLowerCase() === selectedGroup.value.toLowerCase()
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter((reserva) => {
      return (
        String(reserva.id_reserva).toLowerCase().includes(query) ||
        String(reserva.usuario?.nombre || '').toLowerCase().includes(query) ||
        String(reserva.fecha_hora).toLowerCase().includes(query) ||
        String(reserva.estado).toLowerCase().includes(query) ||
        String(reserva.monto_total).toLowerCase().includes(query)
      )
    })
  }

  if (sortBy.value) {
    data.sort((a, b) => {
      let valueA = ''
      let valueB = ''

      if (sortBy.value === 'id_reserva') {
        valueA = a.id_reserva
        valueB = b.id_reserva
      } else if (sortBy.value === 'nombre') {
        valueA = a.usuario?.nombre || ''
        valueB = b.usuario?.nombre || ''
      } else if (sortBy.value === 'fecha_hora') {
        valueA = a.fecha_hora
        valueB = b.fecha_hora
      } else if (sortBy.value === 'estado') {
        valueA = a.estado
        valueB = b.estado
      } else if (sortBy.value === 'monto_total') {
        valueA = a.monto_total
        valueB = b.monto_total
      }

      if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return data
})

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
      fetch(`/cancel_reserva/${idReserva}`, {
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
  window.location.href = `/verDetalle-reserva/${idReserva}`
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
      <div class="title">Panel de Reservas</div>

      <div class="group-by-container">
        <form method="GET" action="/reservas_panel">
          <label for="group_by">Agrupar por:</label>
          <select id="group_by" v-model="selectedGroup" name="group_by">
            <option value="todas">Todas</option>
            <option value="reservados">Reservados</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input type="hidden" name="search" :value="searchQuery" />
          <input type="hidden" name="sort_by" :value="sortBy" />
          <input type="hidden" name="sort_order" :value="sortOrder" />
        </form>
      </div>

      <div class="actions-container">
        <form method="GET" action="/reservas_panel">
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              name="search"
              placeholder="Buscar reserva"
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
                <button class="filter-btn" @click="sortTable('id_reserva')">
                  <i class="fa-solid fa-sort"></i>
                </button>
              </th>
              <th>
                Cliente
                <button class="filter-btn" @click="sortTable('nombre')">
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
                Estado Reserva
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
            <tr v-for="reserva in filteredReservas" :key="reserva.id_reserva">
              <td>{{ reserva.id_reserva }}</td>
              <td>{{ reserva.usuario?.nombre }}</td>
              <td>{{ reserva.fecha_hora }}</td>
              <td>{{ reserva.estado }}</td>
              <td>{{ reserva.monto_total }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="reserva.estado === 'Reservado'"
                    class="verDetallesBtn"
                    @click="verDetalles(reserva.id_reserva)"
                  >
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
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

        .search-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 10px;
            gap: 20px; 
        }

        .search-container button,
        .add-buttons button {
            margin-left: 10px;
            margin-right: 10px;
        }

        .add-buttons {
            display: flex;
            gap: 20px; /* Espacio entre los botones de agregar producto y categoría */
        }

        .add-product button,
        .add-category button {
            width: auto;
            background-color: var(--alt-primary-color);
            color: var(--light-color);
            font-size: 15px;
            border: none;
            padding: 10px;
            border-radius: 20px;
            cursor: pointer;
            margin-left: 10px;
            margin-right: 10px;
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
            width: 150px; /* Ajustar el tamaño del select */
        }
    </style>