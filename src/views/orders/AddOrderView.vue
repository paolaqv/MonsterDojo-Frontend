<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/form-reserva.css'
import logo from '@/assets/images/logo.png'
import { getActiveReservation } from '@/services/reservations.service'
import { getProducts } from '@/services/products.service'
import { createOrder } from '@/services/orders.service'

const menuOpen = ref(false)
const productosSeleccionados = ref([])
const reservaActiva = ref({
  mesa: {
    id_mesa: '',
    capacidad: '',
    ubicacion: '',
  },
})
const productos = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const total = computed(() => {
  return productosSeleccionados.value
    .reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    .toFixed(2)
})

const addProducto = (id, nombre, precio, cantidad) => {
  productosSeleccionados.value.push({
    id,
    nombre,
    precio: Number(precio),
    cantidad: Number(cantidad),
  })
}

const toggleProducto = (producto, event) => {
  const checked = event.target.checked
  const id = producto.id_producto
  const nombre = producto.nombre
  const precio = Number(producto.precio)
  const cantidad = Number(producto.cantidad || 1)

  if (checked) {
    addProducto(id, nombre, precio, cantidad)
  } else {
    productosSeleccionados.value = productosSeleccionados.value.filter((item) => item.id !== id)
  }
}

const updateCantidad = (producto) => {
  const id = producto.id_producto
  const cantidad = Number(producto.cantidad || 1)
  const productoSeleccionado = productosSeleccionados.value.find((item) => item.id === id)

  if (productoSeleccionado) {
    productoSeleccionado.cantidad = cantidad
  }
}

const removeProducto = (id) => {
  productosSeleccionados.value = productosSeleccionados.value.filter((item) => item.id !== id)
  const productoOriginal = productos.value.find((producto) => producto.id_producto === id)
  if (productoOriginal) {
    productoOriginal.checked = false
  }
}

const confirmCancel = () => {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Está seguro de cancelar? Se perderán los datos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, mantener',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/inicio_usuario'
    }
  })
}

const showSuccessMessage = () => {
  Swal.fire({
    title: '¡Éxito!',
    text: 'Pedido realizado exitosamente.',
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  }).then(() => {
    window.location.href = '/ver_pedidos'
  })
}

const realizarPedido = async () => {
  const payload = productosSeleccionados.value.map((producto) => ({
    id_producto: producto.id,
    cantidad: producto.cantidad,
  }))

  await createOrder({
    productos: payload,
  })

  showSuccessMessage()
}

onMounted(async () => {
  const reserva = await getActiveReservation()
  const productosResponse = await getProducts()

  reservaActiva.value = reserva

  productos.value = (Array.isArray(productosResponse) ? productosResponse : []).map((producto) => ({
    ...producto,
    checked: false,
    cantidad: 1,
  }))
})
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
      <div class="form-section">
        <h2>Agregar Pedido</h2>

        <div class="mesas-section">
          <h3>Mesa Seleccionada</h3>
          <p>
            Mesa {{ reservaActiva.mesa.id_mesa }} -
            Capacidad: {{ reservaActiva.mesa.capacidad }} -
            Ubicación: {{ reservaActiva.mesa.ubicacion }}
          </p>
        </div>

        <div class="productos-section">
          <h3>Selecciona Productos</h3>

          <table id="productos-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Seleccionar</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="producto in productos" :key="producto.id_producto">
                <td>
                  <img
                    :src="producto.imagen"
                    :alt="`Imagen de ${producto.nombre}`"
                    width="50"
                  />
                </td>

                <td>
                  <input
                    v-model="producto.checked"
                    type="checkbox"
                    class="producto-checkbox"
                    :data-id="producto.id_producto"
                    :data-precio="producto.precio"
                    @change="toggleProducto(producto, $event)"
                  />
                </td>

                <td>{{ producto.nombre }}</td>
                <td>{{ producto.precio }}</td>

                <td>
                  <input
                    v-model="producto.cantidad"
                    type="number"
                    class="cantidad-producto"
                    min="1"
                    @change="updateCantidad(producto)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="productos-seleccionados-section">
          <h3>Productos Seleccionados</h3>

          <table id="productos-seleccionados-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="producto in productosSeleccionados" :key="producto.id">
                <td>{{ producto.nombre }}</td>
                <td>{{ Number(producto.precio).toFixed(2) }}</td>
                <td>{{ producto.cantidad }}</td>
                <td>{{ (producto.precio * producto.cantidad).toFixed(2) }}</td>
                <td>
                  <button
                    type="button"
                    class="eliminar-btn"
                    @click="removeProducto(producto.id)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div>Total: $<span id="total">{{ total }}</span></div>
        </div>

        <button type="button" id="realizarPedidoBtn" @click="realizarPedido">
          Realizar Pedido
        </button>

        <button type="button" id="cancelarPedidoBtn" @click="confirmCancel">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.hidden {
  display: none;
}

.custom-checkbox {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #1c1c1c;
  border: 2px solid #d48600;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.custom-checkbox input {
  display: none;
}

.custom-checkbox input:checked + .checkmark::after {
  content: '✔';
  color: #d48600;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
}

.checkmark {
  display: block;
  width: 100%;
  height: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th,
td {
  border: 1px solid #d48600;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #1c1c1c;
  color: #d48600;
}

td img {
  width: 50px;
  height: auto;
}

select,
input[type='number'],
input[type='date'],
input[type='time'] {
  padding: 10px;
  border: 1px solid #d48600;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f0f0f0;
}

.eliminar-btn {
  background: none;
  border: none;
  color: #d48600;
  cursor: pointer;
  font-size: 18px;
}

.eliminar-btn i {
  font-size: 18px;
}

.continuar-btn,
#realizarPedidoBtn,
#cancelarPedidoBtn {
  background-color: #1c1c1c;
  color: #d48600;
  border: 1px solid #d48600;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin-right: 10px;
}

.continuar-btn:hover,
#realizarPedidoBtn:hover,
#cancelarPedidoBtn:hover {
  background-color: #d48600;
  color: #1c1c1c;
}

.swal2-cancel {
  background-color: #192847 !important;
  color: #fff !important;
}

.swal2-confirm {
  background-color: #d48600 !important;
  color: #fff !important;
  width: 120px !important;
}

.error-message {
  color: #b00020;
  margin-bottom: 16px;
  font-weight: bold;
}
</style>