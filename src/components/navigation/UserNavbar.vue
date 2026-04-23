<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import '@/assets/css/navbar.css'
import logo from '@/assets/images/logo.png'
import { usePermissions } from '@/composables/usePermissions'

const route = useRoute()
const { hasPermission } = usePermissions()

const menuOpen = ref(false)

const canViewFoodMenu = computed(() => hasPermission('ver_productos'))
const canViewGameMenu = computed(() => hasPermission('ver_juegos'))
const canCreateReservation = computed(() => hasPermission('crear_reservas'))
const canViewReservations = computed(() => hasPermission('ver_reservas_detalle'))
const canViewOrders = computed(() => hasPermission('ver_pedidos_detalle'))

const showReservations = computed(
  () => canCreateReservation.value || canViewReservations.value
)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)
</script>

<template>
  <div class="navbar">
    <div class="nav-logo">
      <img :src="logo" alt="Monster Dojo" />
    </div>

    <button class="menu-toggle" type="button" @click="toggleMenu">
      <span class="fas fa-bars"></span>
    </button>

    <div class="navbar-right" :class="{ active: menuOpen }">
      <RouterLink to="/inicio_usuario" @click="closeMenu">Home</RouterLink>

      <RouterLink
        v-if="canViewFoodMenu"
        to="/food-menu"
        @click="closeMenu"
      >
        Comida
      </RouterLink>

      <RouterLink
        v-if="canViewGameMenu"
        to="/game-menu"
        @click="closeMenu"
      >
        Juegos
      </RouterLink>

      <RouterLink
        v-if="showReservations"
        to="/user_reservation"
        @click="closeMenu"
      >
        Reservas
      </RouterLink>

      <RouterLink
        v-if="canViewOrders"
        to="/ver_pedidos"
        @click="closeMenu"
      >
        Pedidos
      </RouterLink>

      <RouterLink to="/perfil_user" @click="closeMenu">
        <i class="fas fa-user"></i>
      </RouterLink>
    </div>
  </div>
</template>