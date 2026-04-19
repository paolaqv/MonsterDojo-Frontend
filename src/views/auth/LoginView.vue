<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)
const email = ref('')
const password = ref('')
const loginAttempts = ref(0)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
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
        <form action="/login" method="POST">
          <h3>Iniciar Sesión</h3>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <input id="email" v-model="email" type="email" name="email" required />
          </div>

          <div class="input-container">
            <label for="password">Contraseña</label>
            <input id="password" v-model="password" type="password" name="password" required />

            <div v-if="loginAttempts > 0" class="error-message">
              Correo electrónico o contraseña incorrectos.
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
            <a href="/login/google" class="google-btn">Iniciar sesión con Google</a>
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