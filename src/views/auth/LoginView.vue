<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
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

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogin = async () => {
  try {
    errorMessage.value = ''

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
      error?.normalizedMessage ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      'Correo electronico o contrasena incorrectos.'

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
            <input id="email" v-model.trim="correo" type="email" name="correo" maxlength="254" required />
          </div>

          <div class="input-container">
            <label for="password">Contraseña</label>
            <input id="password" v-model="password" type="password" name="password" maxlength="256" required />

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <span>
              ¿Olvidaste tu contraseña?
              <RouterLink to="/reset_password">Recupérala</RouterLink>
            </span>
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
  color: red;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
}
</style>
