<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

onMounted(() => {
  Swal.fire({
    title: 'No tienes una reserva activa',
    text: 'No tienes una reserva activa en este momento. No puedes realizar pedidos.',
    icon: 'warning',
    confirmButtonText: 'Aceptar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
  }).then(() => {
    router.push({ name: 'inicio_usuario' })
  })
})
</script>

<template>
  <div></div>
</template>

<style>
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