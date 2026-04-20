<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/form-reserva.css'
import logo from '@/assets/images/logo.png'
import { getActiveReservation } from '@/services/reservations.service'
import { getProducts } from '@/services/products.service'
import { createOrder } from '@/services/orders.service'

const router = useRouter()

const menuOpen = ref(false)
const loading = ref(false)
const errorMessage = ref('')
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

const normalizeImage = (imagen) => {
  if (!imagen) return ''

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:image')
  ) {
    return imagen
  }

  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
  const apiBase = base.replace('/api/v1', '')

  if (imagen.startsWith('/')) {
    return `${apiBase}${imagen}`
  }

  return `${apiBase}/${imagen}`
}

const total = computed(() => {
  return productosSeleccionados.value
    .reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    .toFixed(2)
})

const addProducto = (id, nombre, precio, cantidad) => {
  const existe = productosSeleccionados.value.find((item) => item.id === id)

  if (existe) {
    existe.cantidad = Number(cantidad)
    return
  }

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
      router.push({ name: 'inicio_usuario' })
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
    router.push('/ver_pedidos')
  })
}

const realizarPedido = async () => {
  if (!productosSeleccionados.value.length) {
    Swal.fire('Aviso', 'Debes seleccionar al menos un producto.', 'warning')
    return
  }

  try {
    const payload = productosSeleccionados.value.map((producto) => ({
      id_producto: producto.id,
      cantidad: producto.cantidad,
    }))

    await createOrder({
      productos: payload,
    })

    showSuccessMessage()
  } catch (error) {
    Swal.fire(
      'Error',
      error?.response?.data?.detail || 'No se pudo realizar el pedido.',
      'error'
    )
  }
}

onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const [reserva, productosResponse] = await Promise.all([
      getActiveReservation(),
      getProducts(),
    ])

    reservaActiva.value = reserva

    const productosArray = Array.isArray(productosResponse)
      ? productosResponse
      : (productosResponse?.items || productosResponse?.results || [])

    productos.value = productosArray.map((producto) => ({
      ...producto,
      checked: false,
      cantidad: 1,
      imagen: normalizeImage(producto.imagen),
    }))
  } catch (error) {
    if (error?.response?.status === 404) {
      router.push('/sin_reserva')
      return
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron cargar los datos del pedido.'
  } finally {
    loading.value = false
  }
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
      <div class="form-section">
        <h2>Agregar Pedido</h2>

        <div v-if="loading">Cargando datos...</div>
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <template v-else>
          <div class="mesas-section">
            <h3>Mesa Seleccionada</h3>
            <p>
              Mesa {{ reservaActiva.mesa?.id_mesa || reservaActiva.mesa_id_mesa }} -
              Capacidad: {{ reservaActiva.mesa?.capacidad || '-' }} -
              Ubicación: {{ reservaActiva.mesa?.ubicacion || '-' }}
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
                <tr v-if="productosSeleccionados.length === 0">
                  <td colspan="5">No hay productos seleccionados.</td>
                </tr>

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

            <div>Total: Bs <span id="total">{{ total }}</span></div>
          </div>

          <button type="button" id="realizarPedidoBtn" @click="realizarPedido">
            Realizar Pedido
          </button>

          <button type="button" id="cancelarPedidoBtn" @click="confirmCancel">
            Cancelar
          </button>
        </template>
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