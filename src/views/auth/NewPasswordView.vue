<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { resetPassword } from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const errorPassword = ref('')
const errorConfirmPassword = ref('')
const generalError = ref('')
const successMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const validateForm = () => {
  let valid = true

  errorPassword.value = ''
  errorConfirmPassword.value = ''
  generalError.value = ''

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  if (!newPassword.value.match(passwordRegex)) {
    errorPassword.value =
      'La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un caracter especial.'
    valid = false
  }

  if (newPassword.value !== confirmPassword.value) {
    errorConfirmPassword.value = 'Las contraseñas no coinciden.'
    valid = false
  }

  return valid
}

const handleSaveChanges = async () => {
  if (!validateForm()) return

  const correo = sessionStorage.getItem('reset_correo') || ''
  const respuesta_seguridad = sessionStorage.getItem('reset_answer') || ''

  if (!correo || !respuesta_seguridad) {
    generalError.value = 'La sesión de recuperación expiró. Vuelve a iniciar el proceso.'
    return
  }

  try {
    generalError.value = ''
    successMessage.value = ''

    await resetPassword({
      correo,
      respuesta_seguridad,
      new_password: newPassword.value,
    })

    sessionStorage.removeItem('reset_correo')
    sessionStorage.removeItem('reset_answer')

    successMessage.value = 'Contraseña actualizada correctamente.'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    generalError.value =
      error?.response?.data?.detail || 'No se pudo actualizar la contraseña.'
  }
}
</script>

<template>
  <div>
    <nav class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <div class="nav-hamburger" @click="toggleMenu">
        <i class="fa fa-bars"></i>
      </div>

      <ul class="nav-items" :class="{ 'nav-items-active': menuOpen }">
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/login">Iniciar Sesion</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form
          id="change-password-form"
          @submit.prevent="handleSaveChanges"
        >
          <h3>Recuperar Contraseña</h3>

          <div class="input-container">
            <label for="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              name="new-password"
              required
            />
            <span id="error-password" class="error-message">{{ errorPassword }}</span>
          </div>

          <div class="input-container">
            <label for="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              name="confirm-password"
              required
            />
            <span id="error-confirm-password" class="error-message">
              {{ errorConfirmPassword }}
            </span>
          </div>

          <div v-if="generalError" class="error-message">
            {{ generalError }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="input-container">
            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.error-message {
  color: red;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
}

.success-message {
  color: green;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
  margin-top: 8px;
}
</style>