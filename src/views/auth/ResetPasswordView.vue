<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { requestPasswordRecovery } from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleResetPassword = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    const data = await requestPasswordRecovery({
      correo: email.value.trim().toLowerCase(),
    })

    sessionStorage.setItem('reset_correo', email.value.trim().toLowerCase())

    if (data?.debug_code) {
      sessionStorage.setItem('reset_codigo_debug', data.debug_code)
    } else {
      sessionStorage.removeItem('reset_codigo_debug')
    }

    successMessage.value = data?.message || 'Se envió un código al correo registrado.'

    setTimeout(() => {
      router.push('/verify_security_question')
    }, 900)
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo iniciar la recuperación.'
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
        <li><RouterLink to="/login">Iniciar Sesión</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <h3>Recuperar contraseña</h3>

        <form @submit.prevent="handleResetPassword">
          <p>Ingresa el correo con el que te registraste en el sistema.</p>

          <div class="input-container">
            <label for="email">Correo de contacto registrado</label>
            <input id="email" v-model="email" type="email" required />
          </div>
          <small class="input-help">
          Ingresa el correo de contacto asociado a tu cuenta.
</small>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="input-container">
            <button type="submit">Enviar código</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 8px;
}

.success-message {
  color: green;
  font-size: 0.8em;
  margin-top: 8px;
}
</style>