<script setup>
import '@/assets/css/receipt.css'

const pedido = {
  usuario_rel: {
    nombre: '',
  },
  fecha_hora: '',
}

const productos = []

const totalPedido = ''

const printReceipt = () => {
  window.print()
}
</script>

<template>
  <div class="container">
    <div class="receipt-section">
      <h2>Recibo</h2>

      <div class="customer">
        <label for="customer">Cliente:</label>
        <p id="customer">{{ pedido.usuario_rel.nombre }}</p>
      </div>

      <div class="date">
        <label for="date">Fecha:</label>
        <p id="date">{{ pedido.fecha_hora }}</p>
      </div>

      <ul class="receipt-info">
        <li>
          <span><strong>Producto</strong></span>
          <span><strong>Cantidad</strong></span>
          <span><strong>Precio Unitario</strong></span>
          <span><strong>Precio Total</strong></span>
        </li>

        <li v-for="item in productos" :key="item.nombre">
          <span>{{ item.nombre }}</span>
          <span>{{ item.cantidad }}</span>
          <span>{{ item.precio_unitario }} Bs.</span>
          <span>{{ item.total }} Bs.</span>
        </li>
      </ul>

      <div class="total">
        <label for="total">Total:</label>
        <p id="total">{{ totalPedido }} Bs.</p>
      </div>

      <button class="print-btn" @click="printReceipt">Imprimir Recibo</button>
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