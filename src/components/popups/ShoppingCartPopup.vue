<script setup>
import { ref } from 'vue'
import '@/assets/css/popup_carrito.css'
import food2 from '@/assets/images/food2.jpg'
import food3 from '@/assets/images/food3.jpg'

const visible = ref(true)

const closePopup = () => {
  visible.value = false
}
</script>

<template>
  <div v-if="visible" id="shoppingCartPopup" class="popup">
    <div class="popup-content">
      <span class="close-btn" @click="closePopup">&times;</span>
      <h2>Carrito de compras 🛒</h2>
      <a href="#" class="remove-all">Remover todo</a>

      <table class="cart-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Quitar</th>
            <th>Precio</th>
          </tr>
        </thead>

        <tbody>
          <tr class="cart-item">
            <td>
              <div class="item-details">
                <img :src="food3" alt="Pasta Fettucinne" class="item-image" />
                <div class="item-info">
                  <h3>Pasta Fettucinne</h3>
                  <p>Plato</p>
                  <span class="veg-icon"></span>
                </div>
              </div>
            </td>

            <td>
              <div class="item-quantity">
                <button class="quantity-btn">+</button>
                <span class="quantity">2</span>
                <button class="quantity-btn">-</button>
              </div>
            </td>

            <td>
              <a href="#" class="remove">Quitar</a>
            </td>

            <td>
              <p>15 Bs.</p>
            </td>
          </tr>

          <tr class="cart-item">
            <td>
              <div class="item-details">
                <img :src="food2" alt="Tiramisú" class="item-image" />
                <div class="item-info">
                  <h3>Tiramisú</h3>
                  <p>1 porción</p>
                  <span class="veg-icon"></span>
                </div>
              </div>
            </td>

            <td>
              <div class="item-quantity">
                <button class="quantity-btn">+</button>
                <span class="quantity">1</span>
                <button class="quantity-btn">-</button>
              </div>
            </td>

            <td>
              <a href="#" class="remove">Quitar</a>
            </td>

            <td>
              <p>30 Bs.</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="subtotal">
        <p>Sub-Total</p>
        <span class="items-count">2 Productos</span>
        <span class="total-price">45 Bs.</span>
      </div>

      <div class="button-container">
        <button class="checkout-btn">Pedir</button>
      </div>
    </div>
  </div>
</template>