<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import { getSecurityQuestion, verifySecurityAnswer } from '@/services/auth.service'

const router = useRouter()

const pregunta = ref('')
const respuesta = ref('')
const errorMessage = ref('')
const correo = ref('')

onMounted(async () => {
  correo.value = sessionStorage.getItem('reset_correo') || ''

  if (!correo.value) {
    router.push('/reset_password')
    return
  }

  try {
    const data = await getSecurityQuestion(correo.value)
    pregunta.value = data.pregunta_seguridad
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo cargar la pregunta de seguridad.'
  }
})

const handleVerify = async () => {
  try {
    errorMessage.value = ''

    await verifySecurityAnswer({
      correo: correo.value,
      respuesta_seguridad: respuesta.value,
    })

    sessionStorage.setItem('reset_answer', respuesta.value)
    router.push('/new_password')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'La respuesta de seguridad es incorrecta.'
  }
}
</script>

<template>
  <div class="center-wrapper">
    <div class="form-container">
      <form @submit.prevent="handleVerify">
        <h3>Verificar Pregunta de Seguridad</h3>

        <div class="input-container">
          <label for="respuesta">{{ pregunta }}</label>
          <input
            type="text"
            id="respuesta"
            v-model="respuesta"
            name="respuesta"
            required
          >
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

<style>
.error-message {
  color: red;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
  margin-top: 8px;
}
</style>