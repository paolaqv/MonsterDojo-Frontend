<template>
  <div>
    <nav class="navbar">
      <div class="nav-logo">
        <img :src="logo" alt="Monster Dojo" />
      </div>

      <button class="menu-toggle" @click="toggleMenu">
        <span class="fas fa-bars"></span>
      </button>

      <ul class="nav-items" :class="{ 'nav-items-active': menuOpen }">
        <li><RouterLink to="/panel-seguridad">Inicio</RouterLink></li>
        <li><RouterLink to="/userspanel">Usuarios</RouterLink></li>
        <li>
          <RouterLink to="/logout">
            <i class="fa-solid fa-sign-out"></i>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="options-panel">
        <div class="option">
          <RouterLink to="/userspanel">
            <i class="fa-solid fa-user"></i>
          </RouterLink>
          <span>Usuarios</span>
        </div>

        <div class="option">
          <RouterLink to="/logout">
            <i class="fa-solid fa-sign-out"></i>
          </RouterLink>
          <span>Cerrar Sesión</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/adminpanel.css'
import logo from '@/assets/images/logo.png'

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>