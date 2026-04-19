<script setup>
import { RouterLink } from 'vue-router'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import '@/assets/css/food-panel.css'
import '@/assets/css/popup_panel.css'
import logo from '@/assets/images/logo.png'

const mesa = {
  ubicacion: '',
}

const pedido = {
  id_pedido: '',
  fecha_hora: '',
  estado: '',
}

const productos = []

const totalPedido = ''
</script>

<template>
  <div>
    <div class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <button class="menu-toggle">
        <span class="fas fa-bars"></span>
      </button>

      <div class="navbar-right">
        <RouterLink to="/inicio_usuario">Home</RouterLink>
        <RouterLink to="/food-menu">Menu</RouterLink>
        <RouterLink to="/game-menu">Productos</RouterLink>
        <RouterLink to="/user_reservations">Reservas</RouterLink>
        <RouterLink to="/ver_pedidos">Pedidos</RouterLink>
        <RouterLink to="/perfil_user"><i class="fas fa-user"></i></RouterLink>
      </div>
    </div>

    <div class="container">
      <div class="title">Detalles del Pedido</div>

      <div class="header-container">
        <div>
          <p><strong>Mesa:</strong> {{ mesa.ubicacion }}</p>
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
        @click="window.location.href = `/receipt_pedidoUser/${pedido.id_pedido}`"
      >
        Ver Recibo
      </button>
    </div>
  </div>
</template>
    <style>
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