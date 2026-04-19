<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const errorPassword = ref('')
const errorConfirmPassword = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const validateForm = (event) => {
  let valid = true

  errorPassword.value = ''
  errorConfirmPassword.value = ''

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

  if (!valid) {
    event.preventDefault()
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
          action="/new_password"
          method="POST"
          @submit="validateForm"
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

          <div class="input-container">
            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>