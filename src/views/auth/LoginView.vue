<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { login } from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const correo = ref('')
const password = ref('')
const loginAttempts = ref(0)
const errorMessage = ref('')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    loginAttempts.value = 0

    const result = await login({
      correo: correo.value,
      password: password.value,
    })

    const role = result?.user?.rol_id_rol || result?.user?.rol || ''

    if (String(role).toLowerCase().includes('admin')) {
      router.push('/adminpanel')
      return
    }

    router.push('/inicio_usuario')
  } catch (error) {
    loginAttempts.value += 1
    errorMessage.value =
      error?.response?.data?.detail || 'Correo electrónico o contraseña incorrectos.'
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

            <div v-if="loginAttempts > 0" class="error-message">
              {{ errorMessage || 'Correo electrónico o contraseña incorrectos.' }}
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

          <div class="input-container">
            <!-- <a href="/login/google" class="google-btn">Iniciar sesión con Google</a> -->
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