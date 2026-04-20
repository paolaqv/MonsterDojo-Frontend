<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import '@/assets/css/receipt.css'
import { getOrderById, getOrderDetails } from '@/services/orders.service'

const route = useRoute()

const loading = ref(false)
const errorMessage = ref('')

const pedido = ref({
  usuario_rel: {
    nombre: '',
  },
  fecha_hora: '',
})

const productos = ref([])

const formatDateTime = (value) => {
  if (!value) return '-'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (value) => {
  const amount = Number(value || 0)
  return amount.toFixed(2)
}

const normalizedProductos = computed(() => {
  return productos.value.map((item, index) => {
    const nombre =
      item.producto_rel?.nombre ||
      item.producto?.nombre ||
      item.nombre ||
      `Producto ${index + 1}`

    const cantidad = Number(item.cantidad || 0)
    const precioUnitario = Number(
      item.precio_unitario ?? item.precio ?? item.producto_rel?.precio ?? 0
    )
    const total = cantidad * precioUnitario

    return {
      key: item.id_detallePedido || `${nombre}-${index}`,
      nombre,
      cantidad,
      precio_unitario: precioUnitario,
      total,
    }
  })
})

const totalPedido = computed(() => {
  return normalizedProductos.value
    .reduce((acc, item) => acc + Number(item.total || 0), 0)
    .toFixed(2)
})

const loadReceipt = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const orderId = route.params.id

    const [orderData, detailsData] = await Promise.all([
      getOrderById(orderId),
      getOrderDetails(orderId),
    ])

    pedido.value = orderData
    productos.value = Array.isArray(detailsData) ? detailsData : detailsData?.items || []
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo cargar el recibo.'
  } finally {
    loading.value = false
  }
}

const printReceipt = () => {
  window.print()
}

onMounted(async () => {
  await loadReceipt()
})
</script>

<template>
  <div class="container">
    <div class="receipt-section">
      <h2>Recibo</h2>

      <div v-if="loading">Cargando recibo...</div>
      <div v-else-if="errorMessage">{{ errorMessage }}</div>

      <template v-else>
        <div class="customer">
          <label for="customer">Cliente:</label>
          <p id="customer">{{ pedido.usuario_rel?.nombre || '-' }}</p>
        </div>

        <div class="date">
          <label for="date">Fecha:</label>
          <p id="date">{{ formatDateTime(pedido.fecha_hora) }}</p>
        </div>

        <ul class="receipt-info">
          <li>
            <span><strong>Producto</strong></span>
            <span><strong>Cantidad</strong></span>
            <span><strong>Precio Unitario</strong></span>
            <span><strong>Precio Total</strong></span>
          </li>

          <li v-if="normalizedProductos.length === 0">
            <span>No hay productos registrados.</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
          </li>

          <li v-for="item in normalizedProductos" :key="item.key">
            <span>{{ item.nombre }}</span>
            <span>{{ item.cantidad }}</span>
            <span>{{ formatMoney(item.precio_unitario) }} Bs.</span>
            <span>{{ formatMoney(item.total) }} Bs.</span>
          </li>
        </ul>

        <div class="total">
          <label for="total">Total:</label>
          <p id="total">{{ totalPedido }} Bs.</p>
        </div>

        <button class="print-btn" @click="printReceipt">Imprimir Recibo</button>
      </template>
    </div>
  </div>
</template>

<style>
.container {
  padding: 20px;
}

.receipt-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 600px;
  margin: 20px auto;
}

.receipt-section h2 {
  text-align: center;
  margin-bottom: 20px;
}

.receipt-info {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.receipt-info li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.receipt-info li span {
  width: 25%;
  text-align: right;
}

.total {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
}

.print-btn {
  display: block;
  margin: 20px auto;
  background-color: #d48600;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>