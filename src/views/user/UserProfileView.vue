<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/userforms.css'
import '@/assets/css/perfil_usuario.css'
import logo from '@/assets/images/logo.png'
import userPhoto from '@/assets/images/user_photo.png'

const menuOpen = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
})

const errors = ref({
  name: '',
  email: '',
  phone: '',
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const validateForm = (event) => {
  let valid = true

  errors.value.name = ''
  errors.value.email = ''
  errors.value.phone = ''

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  const phoneRegex = /^\d+$/

  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Por favor ingresa un correo electrónico válido.'
    valid = false
  }

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre no puede estar vacío.'
    valid = false
  }

  if (!phoneRegex.test(form.value.phone)) {
    errors.value.phone =
      'Por favor ingresa un número de teléfono válido. Solo se permiten números.'
    valid = false
  }

  if (!valid) {
    event.preventDefault()
  }
}

const goToResetPassword = () => {
  window.location.href = '/reset_password'
}

const goToUserHome = () => {
  window.location.href = '/inicio_usuario'
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
        <li><RouterLink to="/inicio_usuario">Inicio</RouterLink></li>
        <li><RouterLink to="/logout">Cerrar Sesión</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form
          id="registration-form"
          action="/update_profileUser"
          method="POST"
          @submit="validateForm"
        >
          <h3>Perfil de usuario</h3>

          <div class="profile-photo-container">
            <img :src="userPhoto" alt="Foto de usuario" class="profile-photo" />
            <button type="button" class="btn edit-photo-btn">Editar</button>
          </div>

          <div class="input-container">
            <label for="name">Nombre</label>
            <div class="input-with-icon">
              <input id="name" v-model="form.name" type="text" name="name" required />
              <i class="fas fa-edit"></i>
              <span id="error-name" class="error-message">{{ errors.name }}</span>
            </div>
          </div>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <div class="input-with-icon">
              <input id="email" v-model="form.email" type="text" name="email" required />
              <span id="error-email" class="error-message">{{ errors.email }}</span>
              <i class="fas fa-edit"></i>
            </div>
          </div>

          <div class="input-container">
            <label for="phone">Teléfono</label>
            <div class="input-with-icon">
              <input id="phone" v-model="form.phone" type="phone" name="phone" required />
              <span id="error-phone" class="error-message">{{ errors.phone }}</span>
              <i class="fas fa-edit"></i>
            </div>
          </div>

          <div class="input-container">
            <label for="password">Restablecer Contraseña</label>
            <div class="input-with-icon change-password-container">
              <button
                type="button"
                class="btn change-password-btn"
                @click="goToResetPassword"
              >
                <i class="fas fa-lock"></i> <span>Restablecer Contraseña</span>
              </button>
            </div>
          </div>

          <div class="button-container">
            <button type="submit" class="btn">Guardar cambios</button>
            <button type="button" class="btn" @click="goToUserHome">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>