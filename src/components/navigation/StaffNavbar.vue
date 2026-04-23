<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/images/logo.png'
import { usePermissions } from '@/composables/usePermissions'

defineProps({
  homeRoute: {
    type: String,
    default: '/inicio_usuario',
  },
  profileRoute: {
    type: String,
    default: '/perfil_admin',
  },
})

const menuOpen = ref(false)
const { hasPermission } = usePermissions()

const navItems = computed(() => {
  const items = []

  if (hasPermission('ver_usuarios')) {
    items.push({ key: 'usuarios', label: 'Usuarios', to: '/userspanel' })
  }
  if (hasPermission('ver_juegos')) {
    items.push({ key: 'juegos', label: 'Juegos', to: '/game_panel' })
  }
  if (hasPermission('ver_productos')) {
    items.push({ key: 'productos', label: 'Productos', to: '/food_panel' })
  }
  if (hasPermission('ver_mesas')) {
    items.push({ key: 'mesas', label: 'Mesas', to: '/registro_mesa' })
  }
  if (hasPermission('ver_reservas_detalle')) {
    items.push({ key: 'reservas', label: 'Reservas', to: '/reservas_panel' })
  }
  if (hasPermission('ver_pedidos_detalle')) {
    items.push({ key: 'pedidos', label: 'Pedidos', to: '/pedidos_panel' })
  }

  return items
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-logo">
      <img :src="logo" alt="Monster Dojo" />
    </div>

    <button class="menu-toggle" @click="toggleMenu">
      <span class="fas fa-bars"></span>
    </button>

    <ul class="nav-items" :class="{ 'nav-items-active': menuOpen }">
      <li><RouterLink :to="homeRoute">Inicio</RouterLink></li>

      <li v-for="item in navItems" :key="item.key">
        <RouterLink :to="item.to">{{ item.label }}</RouterLink>
      </li>

      <li>
        <RouterLink :to="profileRoute">
          <i class="fa-solid fa-user-gear"></i>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/logout">
          <i class="fa-solid fa-sign-out"></i>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>