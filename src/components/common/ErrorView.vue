<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const status = computed(() => String(route.query.status || '500'))

const errorContent = computed(() => {
  switch (status.value) {
    case '401':
      return {
        title: 'Sesion expirada',
        message: 'Inicia sesion nuevamente para continuar.',
        action: '/login',
        actionText: 'Iniciar sesion',
      }
    case '403':
      return {
        title: 'Acceso denegado',
        message: 'Tu rol no tiene permisos para ver este recurso.',
        action: '/',
        actionText: 'Volver al inicio',
      }
    case '404':
      return {
        title: 'Recurso no encontrado',
        message: 'El recurso solicitado no existe o ya no esta disponible.',
        action: '/',
        actionText: 'Volver al inicio',
      }
    default:
      return {
        title: 'Error inesperado',
        message: 'No se pudo completar la operacion. Intenta nuevamente mas tarde.',
        action: '/',
        actionText: 'Volver al inicio',
      }
  }
})
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center text-danger">{{ errorContent.title }}</h1>
    <p class="text-center">{{ errorContent.message }}</p>
    <div class="text-center mt-4">
      <RouterLink :to="errorContent.action" class="btn btn-primary">
        {{ errorContent.actionText }}
      </RouterLink>
    </div>
  </div>
</template>
