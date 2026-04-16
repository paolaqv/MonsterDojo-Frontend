<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/food-menu.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const categorias = ref([])
const productosPorCategoria = ref({})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const categoriasConProductos = computed(() => {
  return categorias.value.filter(
    (categoria) => productosPorCategoria.value[categoria.id_catProducto]?.length
  )
})

onMounted(() => {})
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
      <div class="menu-section">
        <div
          v-for="categoria in categoriasConProductos"
          :key="categoria.id_catProducto"
          class="menu-section"
        >
          <div class="menu-category">
            <h2>{{ categoria.nombre }}</h2>

            <div class="menu-items">
              <div
                v-for="producto in productosPorCategoria[categoria.id_catProducto]"
                :key="producto.id_producto"
                class="menu-item"
              >
                <img
                  :src="producto.imagen"
                  :alt="`Imagen de ${producto.nombre}`"
                  width="100"
                />

                <div class="item-info">
                  <h3>{{ producto.nombre }}</h3>
                  <p>{{ producto.descripcion }}</p>
                  <p>Precio: ${{ producto.precio }}</p>
                  <p>Máximo de personas: {{ producto.max_personas }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>