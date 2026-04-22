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
        <li><RouterLink to="/adminpanel">Inicio</RouterLink></li>
<li v-if="showUsers"><RouterLink to="/userspanel">Usuarios</RouterLink></li>        
        <li><RouterLink to="/game_panel">Juegos</RouterLink></li>
        <li><RouterLink to="/food_panel">Comida</RouterLink></li>
        <li><RouterLink to="/registro_mesa">Mesas</RouterLink></li>
        <li><RouterLink to="/reservas_panel">Reservas</RouterLink></li>
        <li><RouterLink to="/pedidos_panel">Pedidos</RouterLink></li>
        <li>
          <RouterLink to="/perfil_admin">
            <i class="fa-solid fa-user-gear"></i>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="options-panel">
<div v-if="showUsers" class="option">
  <RouterLink to="/userspanel">
    <i class="fa-solid fa-user"></i>
  </RouterLink>
  <span>Usuarios</span>
</div>

        <div class="option">
          <RouterLink to="/game_panel">
            <i class="fa-solid fa-dice"></i>
          </RouterLink>
          <span>Juegos</span>
        </div>

        <div class="option">
          <RouterLink to="/food_panel">
            <i class="fa-solid fa-burger"></i>
          </RouterLink>
          <span>Comida</span>
        </div>

        <div class="option">
          <RouterLink to="/registro_mesa">
            <i class="fa-solid fa-utensils"></i>
          </RouterLink>
          <span>Mesas</span>
        </div>

        <div class="option">
          <RouterLink to="/reservas_panel">
            <i class="fa-solid fa-bookmark"></i>
          </RouterLink>
          <span>Reservas</span>
        </div>

        <div class="option">
          <RouterLink to="/pedidos_panel">
            <i class="fa-solid fa-clipboard"></i>
          </RouterLink>
          <span>Pedidos</span>
        </div>

        <div class="option">
          <RouterLink to="/perfil_admin">
            <i class="fa-solid fa-user-gear"></i>
          </RouterLink>
          <span>Perfil</span>
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

const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
const showUsers = storedUser?.rol_id_rol === 'encargadoSeguridad'

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>