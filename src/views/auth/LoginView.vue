<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { VueClientRecaptcha } from 'vue-client-recaptcha' 
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { login } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const correo = ref('')
const password = ref('')
const errorMessage = ref('')

// Lógica del Captcha local
const captchaInput = ref('') 
const captchaCode = ref('') 

const getCaptchaCode = (value) => {
  captchaCode.value = value 
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogin = async () => {
  try {
    errorMessage.value = ''

    // 1. Validar Captcha Localmente antes de llamar al servidor
    if (captchaInput.value !== captchaCode.value) {
      errorMessage.value = 'El código de seguridad es incorrecto.'
      return
    }

    const normalizedEmail = correo.value.trim().toLowerCase()

    const result = await login({
      correo: normalizedEmail,
      password: password.value,
    })

    authStore.setSession(result)
    authStore.startAutoRefresh()

    const role = result?.user?.rol_id_rol || result?.user?.rol || ''

    if (role === 'encargadoSeguridad') {
      router.push('/panel-seguridad')
      return
    }

    if (role === 'encargadoLocal') {
      router.push('/adminpanel')
      return
    }

    if (role === 'mesero') {
      router.push('/panel-mesero')
      return
    }

    router.push('/inicio_usuario')
  } catch (error) {
    const detail =
      error?.response?.data?.detail || 'Correo electrónico o contraseña incorrectos.'

    if (
      detail.includes('Debes cambiar tu contraseña') ||
      detail.includes('Tu contraseña ha expirado')
    ) {
      sessionStorage.setItem('password_change_correo', correo.value.trim().toLowerCase())
      router.push('/change-required-password')
      return
    }

    errorMessage.value = detail
  }
}
</script>

<template>
  <div class="login-page">
    <nav class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <div class="nav-hamburger" @click="toggleMenu">
        <i class="fa fa-bars"></i>
      </div>

      <ul class="nav-items" :class="{ 'nav-items-active': menuOpen }">
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/register">Registrarse</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form @submit.prevent="handleLogin">
          <h3>Iniciar Sesión</h3>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <input id="email" v-model="correo" type="email" name="correo" required />
          </div>

          <div class="input-container">
            <label for="password">Contraseña</label>
            <input id="password" v-model="password" type="password" name="password" required />

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <span>
              ¿Olvidaste tu contraseña?
              <RouterLink to="/reset_password">Recupérala</RouterLink>
            </span>
          </div>

          <div class="captcha-wrapper">
            <div class="captcha-box">
              <VueClientRecaptcha
                :value="captchaCode"
                @getCode="getCaptchaCode"
                custom-class="my-captcha"
              />
              <input 
                v-model="captchaInput" 
                type="text" 
                placeholder="Escribe el código de seguridad" 
                class="captcha-input-field"
                required 
              />
            </div>
          </div>

          <div class="input-container">
            <button type="submit">Iniciar Sesión</button>
            <span>
              ¿No tienes una cuenta?
              <RouterLink to="/register">Regístrate</RouterLink>
            </span>
          </div>

          <div class="input-container"></div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: #ff4d4d;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
  margin-bottom: 10px;
}

/* Centrado del Captcha */
.captcha-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
}

.captcha-box {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 320px;
}

.captcha-input-field {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: white;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
}

.captcha-input-field:focus {
  outline: none;
  border-color: #ffcc00; /* Color de énfasis de tu marca */
}

/* Forzar centrado del contenido interno del captcha */
:deep(.my-captcha) {
  display: flex !important;
  justify-content: center !important;
  width: 100%;
}
</style>