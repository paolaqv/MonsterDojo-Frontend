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

const { hasPermission, hasRole } = usePermissions()

const options = computed(() => {
  const items = []

  if (hasPermission('ver_usuarios')) {
    items.push({ key: 'usuarios', label: 'Gestion de usuarios y roles', to: '/userspanel', icon: 'fa-solid fa-user' })
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

  if (hasRole('encargadoSeguridad')) {
    items.push({
      key: 'politicas-password',
      label: 'Gestion deContraseñas',
      to: '/politicas-contrasena',
      icon: 'fa-solid fa-key',
    })
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
      <RouterLink :to="item.to" class="option-link">
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>

    <div class="option">
      <RouterLink :to="profileRoute" class="option-link">
        <i class="fa-solid fa-user-gear"></i>
        <span>Perfil</span>
      </RouterLink>
    </div>

    <div class="option">
      <RouterLink to="/logout" class="option-link">
        <i class="fa-solid fa-sign-out"></i>
        <span>Cerrar Sesión</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.options-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-top: 42px;
  margin-bottom: 26px;
}

.option {
  display: flex;
}

.option-link {
  min-width: 150px;
  min-height: 72px;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(25, 40, 71, 0.92);
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
  transition: transform 0.2s ease, background 0.2s ease;
}

.option-link:hover {
  transform: translateY(-2px);
  background: #223661;
}

.option-link i {
  font-size: 22px;
  flex-shrink: 0;
}

.option-link span {
  font-size: 18px;
  line-height: 1.1;
}

@media (max-width: 768px) {
  .options-panel {
    margin-top: 28px;
    gap: 14px;
  }

  .option-link {
    min-width: 130px;
    min-height: 64px;
    padding: 12px 14px;
  }

  .option-link span {
    font-size: 16px;
  }
}
</style>