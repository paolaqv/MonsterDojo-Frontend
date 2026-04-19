<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)

const form = ref({
  email: '',
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
  pregunta: '',
  respuesta: '',
})

const errors = ref({
  email: '',
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const validateForm = (event) => {
  let valid = true

  errors.value.email = ''
  errors.value.name = ''
  errors.value.phone = ''
  errors.value.password = ''
  errors.value.confirmPassword = ''

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  const phoneRegex = /^\d+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

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

  if (!passwordRegex.test(form.value.password)) {
    errors.value.password =
      'La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un caracter especial.'
    valid = false
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden.'
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
        <form id="registration-form" action="/register" method="POST" @submit="validateForm">
          <h3>Crear una cuenta</h3>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <input id="email" v-model="form.email" type="text" name="email" required />
            <span id="error-email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="input-container">
            <label for="name">Nombre</label>
            <input id="name" v-model="form.name" type="text" name="name" required />
            <span id="error-name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="input-container">
            <label for="phone">Teléfono</label>
            <input id="phone" v-model="form.phone" type="phone" name="phone" required />
            <span id="error-phone" class="error-message">{{ errors.phone }}</span>
          </div>

          <div class="input-container">
            <label for="password">Contraseña</label>
            <input id="password" v-model="form.password" type="password" name="password" required />
            <span id="error-password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="input-container">
            <label for="confirm-password">Verificar Contraseña</label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              name="confirm-password"
              required
            />
            <span id="error-confirm-password" class="error-message">
              {{ errors.confirmPassword }}
            </span>
          </div>

          <div class="input-container">
            <label for="pregunta">Pregunta de Seguridad</label>
            <input
              id="pregunta"
              v-model="form.pregunta"
              type="text"
              name="pregunta"
              required
              placeholder="Ejemplo: ¿Cuál es el nombre de tu mascota?"
            />
          </div>

          <div class="input-container">
            <label for="respuesta">Respuesta de Seguridad</label>
            <input
              id="respuesta"
              v-model="form.respuesta"
              type="text"
              name="respuesta"
              required
            />
          </div>

          <div class="input-container">
            <button type="submit">Registrarse</button>
            <span>
              ¿Ya tienes una cuenta?
              <RouterLink to="/login">Inicia sesión</RouterLink>
            </span>
          </div>

          <div>
            <a href="/register/google" class="google-btn">Registrarse con Google</a>
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

.google-btn {
  display: inline-block;
  background-color: #db4437;
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
  margin-top: 10px;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
}

.google-btn:hover {
  background-color: #c23321;
}
</style>