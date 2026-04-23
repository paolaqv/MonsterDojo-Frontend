<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

defineProps({
  profileRoute: {
    type: String,
    default: '/perfil_admin',
  },
})

const { hasPermission } = usePermissions()

const options = computed(() => {
  const items = []

  if (hasPermission('ver_usuarios')) {
    items.push({ key: 'usuarios', label: 'Usuarios', to: '/userspanel', icon: 'fa-solid fa-user' })
  }
  if (hasPermission('ver_juegos')) {
    items.push({ key: 'juegos', label: 'Juegos', to: '/game_panel', icon: 'fa-solid fa-dice' })
  }
  if (hasPermission('ver_productos')) {
    items.push({ key: 'productos', label: 'Productos', to: '/food_panel', icon: 'fa-solid fa-burger' })
  }
  if (hasPermission('ver_mesas')) {
    items.push({ key: 'mesas', label: 'Mesas', to: '/registro_mesa', icon: 'fa-solid fa-chair' })
  }
  if (hasPermission('ver_reservas_detalle')) {
    items.push({ key: 'reservas', label: 'Reservas', to: '/reservas_panel', icon: 'fa-solid fa-bookmark' })
  }
  if (hasPermission('ver_pedidos_detalle')) {
    items.push({ key: 'pedidos', label: 'Pedidos', to: '/pedidos_panel', icon: 'fa-solid fa-clipboard' })
  }

  return items
})
</script>

<template>
  <div class="options-panel">
    <div
      v-for="item in options"
      :key="item.key"
      class="option"
    >
      <RouterLink :to="item.to">
        <i :class="item.icon"></i>
      </RouterLink>
      <span>{{ item.label }}</span>
    </div>

    <div class="option">
      <RouterLink :to="profileRoute">
        <i class="fa-solid fa-user-gear"></i>
      </RouterLink>
      <span>Perfil</span>
    </div>

    <div class="option">
      <RouterLink to="/logout">
        <i class="fa-solid fa-sign-out"></i>
      </RouterLink>
      <span>Cerrar Sesión</span>
    </div>
  </div>
</template>