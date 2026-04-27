<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import { verifyRecoveryCode } from '@/services/auth.service'

const router = useRouter()

const correo = ref('')
const codigo = ref('')
const errorMessage = ref('')
const debugCode = ref('')

onMounted(() => {
  correo.value = sessionStorage.getItem('reset_correo') || ''
  debugCode.value = sessionStorage.getItem('reset_codigo_debug') || ''

  if (!correo.value) {
    router.push('/reset_password')
  }
})

const handleVerify = async () => {
  try {
    errorMessage.value = ''

    await verifyRecoveryCode({
      correo: correo.value,
      codigo: codigo.value.trim(),
    })

    sessionStorage.setItem('reset_codigo', codigo.value.trim())
    router.push('/new_password')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'El código de recuperación es inválido.'
  }
}
</script>

<template>
  <div class="center-wrapper">
    <div class="form-container">
      <form @submit.prevent="handleVerify">
        <h3>Verificar código</h3>

        <div class="input-container">
          <label for="codigo">Código temporal</label>
          <input id="codigo" v-model="codigo" type="text" maxlength="6" required />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="input-container">
          <button type="submit">Verificar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 8px;
}

.debug-box {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff7d6;
  border: 1pfx solid #f0d879;
  border-radius: 10px;
  font-size: 0.85em;
}
</style>