 <script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)

const pedido = ref({
  id_pedido: '',
  fecha_hora: '',
  estado: '',
  usuario_rel: {
    nombre: '',
  },
  mesa_rel: {
    ubicacion: '',
  },
})

const productos = ref([])
const totalPedido = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const goToReceipt = () => {
  window.location.href = `/receipt_pedido/${pedido.value.id_pedido}`
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
      <div class="title">Detalles del Pedido</div>

      <div class="header-container">
        <div>
          <p><strong>Cliente:</strong> {{ pedido.usuario_rel.nombre }}</p>
          <p><strong>Mesa:</strong> {{ pedido.mesa_rel.ubicacion }}</p>
        </div>

        <div>
          <p><strong>Fecha y hora del pedido:</strong> {{ pedido.fecha_hora }}</p>
          <p><strong>Estado:</strong> {{ pedido.estado }}</p>
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
            <tr v-for="producto in productos" :key="producto.nombre">
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.precio_unitario }}</td>
              <td>{{ producto.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-summary">
        <p><strong>Total:</strong> {{ totalPedido }} Bs.</p>
      </div>

      <button
        v-if="pedido.estado === 'Finalizado'"
        class="recibo-btn"
        @click="goToReceipt"
      >
        Ver Recibo
      </button>
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