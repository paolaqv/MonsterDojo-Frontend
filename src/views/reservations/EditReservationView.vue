<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import '@/assets/css/form-reserva.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const formRef = ref(null)
const productosInput = ref('')
const juegoInput = ref('')

const reserva = ref({
  id_reserva: '',
  mesa: {
    id_mesa: '',
    capacidad: '',
    ubicacion: '',
  },
  productos_ids: [],
  productos: {},
  juego_id: null,
})

const productos = ref([])
const juegos = ref([])
const detalleReservas = ref([])
const registroJuego = ref(null)
const productosSeleccionados = ref([])

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const total = computed(() => {
  return productosSeleccionados.value
    .reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    .toFixed(2)
})

const addProducto = (id, nombre, precio, cantidad, esJuego = false) => {
  productosSeleccionados.value.push({
    id,
    nombre,
    precio: Number(precio),
    cantidad: Number(cantidad),
    esJuego,
  })
}

const removeProducto = (id, esJuego = false) => {
  productosSeleccionados.value = productosSeleccionados.value.filter(
    (item) => !(item.id === id && item.esJuego === esJuego)
  )

  if (esJuego) {
    const juego = juegos.value.find((item) => item.id_juego === id)
    if (juego) {
      juego.checked = false
    }
  } else {
    const producto = productos.value.find((item) => item.id_producto === id)
    if (producto) {
      producto.checked = false
    }
  }
}

const toggleProducto = (producto, event) => {
  const checked = event.target.checked
  const id = producto.id_producto
  const nombre = producto.nombre
  const precio = Number(producto.precio)
  const cantidad = Number(producto.cantidad || 1)

  if (checked) {
    const existe = productosSeleccionados.value.find(
      (item) => item.id === id && item.esJuego === false
    )
    if (!existe) {
      addProducto(id, nombre, precio, cantidad, false)
    }
  } else {
    productosSeleccionados.value = productosSeleccionados.value.filter(
      (item) => !(item.id === id && item.esJuego === false)
    )
  }
}

const updateCantidad = (producto) => {
  const id = producto.id_producto
  const cantidad = Number(producto.cantidad || 1)
  const productoSeleccionado = productosSeleccionados.value.find(
    (item) => item.id === id && item.esJuego === false
  )

  if (productoSeleccionado) {
    productoSeleccionado.cantidad = cantidad
  }
}

const selectJuego = (juego) => {
  juegos.value.forEach((item) => {
    item.checked = item.id_juego === juego.id_juego
  })

  productosSeleccionados.value = productosSeleccionados.value.filter(
    (item) => item.esJuego === false
  )

  addProducto(juego.id_juego, juego.nombre, Number(juego.precio_alquiler), 1, true)
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
      window.location.href = '/user_reservations'
    }
  })
}

const showSuccessMessage = (event) => {
  event.preventDefault()
  Swal.fire({
    title: '¡Éxito!',
    text: 'Cambios guardados exitosamente.',
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'swal2-confirm',
    },
  }).then(() => {
    formRef.value.submit()
  })
}

const submitForm = (event) => {
  const productosFormateados = []
  let juegoFormateado = ''

  productosSeleccionados.value.forEach((item) => {
    if (item.esJuego) {
      juegoFormateado = `${item.id}:1`
    } else {
      productosFormateados.push(`${item.id}:${item.cantidad}`)
    }
  })

  productosInput.value = productosFormateados.join(',')
  juegoInput.value = juegoFormateado
  showSuccessMessage(event)
}

onMounted(() => {
  productosSeleccionados.value = []

  detalleReservas.value.forEach((detalle) => {
    addProducto(
      detalle.producto_rel.id_producto,
      detalle.producto_rel.nombre,
      Number(detalle.precio),
      Number(detalle.cantidad),
      false
    )
  })

  if (registroJuego.value) {
    addProducto(
      registroJuego.value.juego_rel.id_juego,
      registroJuego.value.juego_rel.nombre,
      Number(registroJuego.value.precio),
      Number(registroJuego.value.cantidad),
      true
    )
  }
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
        <h2>Editar Reserva</h2>

        <form
          id="editarReservaForm"
          ref="formRef"
          method="POST"
          action="/actualizar_reserva"
          @submit="submitForm"
        >
          <input type="hidden" name="id_reserva" :value="reserva.id_reserva" />

          <div class="mesas-section">
            <h3>Mesa Seleccionada</h3>
            <p>
              Mesa {{ reserva.mesa.id_mesa }} - Capacidad: {{ reserva.mesa.capacidad }} -
              Ubicación: {{ reserva.mesa.ubicacion }}
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
                <tr
                  v-for="producto in productos"
                  :key="producto.id_producto"
                  :data-categoria="producto.categoria_producto_id_catProducto"
                >
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

          <div class="juegos-section">
            <h3>Selecciona un Juego</h3>
            <table id="juegos-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Seleccionar</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="juego in juegos"
                  :key="juego.id_juego"
                  :data-categoria="juego.categoria_juego_id_catJuego"
                >
                  <td>
                    <img
                      :src="juego.imagen"
                      :alt="`Imagen de ${juego.nombre}`"
                      width="50"
                    />
                  </td>
                  <td>
                    <input
                      v-model="juego.checked"
                      type="radio"
                      name="juego_radio"
                      class="juego-radio"
                      :data-id="juego.id_juego"
                      :data-precio="juego.precio_alquiler"
                      @change="selectJuego(juego)"
                    />
                  </td>
                  <td>{{ juego.nombre }}</td>
                  <td>{{ juego.precio_alquiler }}</td>
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
                <tr
                  v-for="item in productosSeleccionados"
                  :key="`${item.esJuego}-${item.id}`"
                  :data-id="item.id"
                  :data-nombre="item.nombre"
                  :data-precio="item.precio"
                  :data-cantidad="item.cantidad"
                  :data-total="(item.precio * item.cantidad).toFixed(2)"
                  :data-es-juego="item.esJuego ? 'true' : 'false'"
                >
                  <td>{{ item.nombre }}</td>
                  <td>{{ Number(item.precio).toFixed(2) }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>{{ (item.precio * item.cantidad).toFixed(2) }}</td>
                  <td>
                    <button
                      type="button"
                      class="eliminar-btn"
                      @click="removeProducto(item.id, item.esJuego)"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div>Total: $<span id="total">{{ total }}</span></div>
          </div>

          <input v-model="productosInput" type="hidden" name="productos" />
          <input v-model="juegoInput" type="hidden" name="juego" />
          <button type="submit" id="guardarCambiosBtn">Guardar Cambios</button>
          <button type="button" id="cancelarEdicionBtn" @click="confirmCancel">Cancelar</button>
        </form>
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

        th, td {
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

        select, input[type="number"], input[type="date"], input[type="time"] {
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

        .continuar-btn {
            background-color: #1c1c1c;
            color: #d48600;
            border: 1px solid #d48600;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
        }

        .continuar-btn:hover {
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
    </style>