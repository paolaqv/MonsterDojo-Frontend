<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { register } from '@/services/auth.service'

const router = useRouter()
const menuOpen = ref(false)
const registerError = ref('')

const form = ref({
  correo: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  telefono: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  correo: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  telefono: '',
  password: '',
  confirmPassword: '',
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const passwordChecks = computed(() => {
  const value = form.value.password || ''
  return {
    longitud: value.length >= 12,
    mayuscula: /[A-Z]/.test(value),
    minuscula: /[a-z]/.test(value),
    numero: /\d/.test(value),
    simbolo: /[^A-Za-z0-9]/.test(value),
    coincide: value.length > 0 && value === form.value.confirmPassword,
  }
})

const validateForm = () => {
  let valid = true

  registerError.value = ''

  errors.value = {
    correo: '',
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
  const phoneRegex = /^\d+$/
  const password = form.value.password || ''

  const hasMinLength = password.length >= 12
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

  if (!emailRegex.test(form.value.correo.trim())) {
    errors.value.correo = 'El correo debe ser una dirección válida con dominio @gmail.com.'
    valid = false
  }

  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es obligatorio.'
    valid = false
  }

  if (!form.value.primer_apellido.trim()) {
    errors.value.primer_apellido = 'El primer apellido es obligatorio.'
    valid = false
  }

  if (!phoneRegex.test(String(form.value.telefono).trim())) {
    errors.value.telefono = 'Ingresa un número de teléfono válido.'
    valid = false
  }

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    errors.value.password =
      'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
    valid = false
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden.'
    valid = false
  }

  return valid
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    registerError.value = ''

    await register({
      nombre: form.value.nombre.trim(),
      primer_apellido: form.value.primer_apellido.trim(),
      segundo_apellido: form.value.segundo_apellido.trim() || null,
      correo: form.value.correo.trim().toLowerCase(),
      telefono: form.value.telefono ? Number(String(form.value.telefono).trim()) : null,
      password: form.value.password,
      rol_id_rol: 'cliente',
    })

    router.push('/login')
  } catch (error) {
    registerError.value =
      error?.normalizedMessage ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      'No se pudo registrar el usuario.'
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
        <form @submit.prevent="handleRegister">
          <h3>Crear una cuenta</h3>

          <div class="input-container">
            <label>Correo electrónico</label>
            <input
              v-model="form.correo"
              type="email"
              required
              placeholder="usuario@gmail.com"
            />
            <small class="input-help">
              Ejemplo: usuario@gmail.com. Solo se permiten correos con dominio @gmail.com.
            </small>
            <span class="error-message">{{ errors.correo }}</span>
          </div>

          <div class="input-container">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" required />
            <span class="error-message">{{ errors.nombre }}</span>
          </div>

          <div class="input-container">
            <label>Primer apellido</label>
            <input v-model="form.primer_apellido" type="text" required />
            <span class="error-message">{{ errors.primer_apellido }}</span>
          </div>

          <div class="input-container">
            <label>Segundo apellido</label>
            <input v-model="form.segundo_apellido" type="text" />
            <span class="error-message">{{ errors.segundo_apellido }}</span>
          </div>

          <div class="input-container">
            <label>Teléfono</label>
            <input v-model="form.telefono" type="text" required />
            <span class="error-message">{{ errors.telefono }}</span>
          </div>

          <div class="input-container">
            <label>Contraseña</label>
            <input v-model="form.password" type="password" required />
            <div class="password-checklist">
              <p :class="{ valid: passwordChecks.longitud }">Al menos 12 caracteres</p>
              <p :class="{ valid: passwordChecks.mayuscula }">Incluye mayúscula</p>
              <p :class="{ valid: passwordChecks.minuscula }">Incluye minúscula</p>
              <p :class="{ valid: passwordChecks.numero }">Incluye número</p>
              <p :class="{ valid: passwordChecks.simbolo }">Incluye carácter especial</p>
            </div>
            <span class="error-message">{{ errors.password }}</span>
          </div>

          <div class="input-container">
            <label>Confirmar contraseña</label>
            <input v-model="form.confirmPassword" type="password" required />
            <span class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <div v-if="registerError" class="error-message">
            {{ registerError }}
          </div>

          <div class="input-container">
            <button type="submit">Registrarse</button>
            <span>
              ¿Ya tienes una cuenta?
              <RouterLink to="/login">Inicia sesión</RouterLink>
            </span>
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

.input-help {
  display: block;
  margin-top: 6px;
  font-size: 0.8em;
  color: #6b7280;
}

.password-checklist {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #f7fafc;
  border: 1px solid #dde7ed;
}

.password-checklist p {
  margin: 6px 0;
  color: #7a8590;
  font-size: 14px;
}

.password-checklist p.valid {
  color: #1f7a38;
  font-weight: 600;
}
</style>
