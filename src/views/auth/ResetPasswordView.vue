<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { getSecurityQuestion } from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const email = ref('')
const errorMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleResetPassword = async () => {
  try {
    errorMessage.value = ''

    const data = await getSecurityQuestion(email.value.trim())

    sessionStorage.setItem('reset_correo', data.correo)

    router.push('/verify_security_question')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo recuperar la pregunta de seguridad.'
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
        <h3>Recuperar Contraseña</h3>

        <form @submit.prevent="handleResetPassword">
          <p>Ingresa tu correo electrónico</p>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <input id="email" v-model="email" type="email" name="email" required />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="input-container">
            <button type="submit">Recuperar Contraseña</button>
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
  margin-top: 8px;
}
</style>