<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import '@/assets/css/userforms.css'
import '@/assets/css/perfil_usuario.css'
import logo from '@/assets/images/logo.png'
import { getCurrentUser } from '@/services/users.service'
const menuOpen = ref(false)
const generalError = ref('')
const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
const userRole = storedUser?.rol_id_rol || ''

const homeRoute = (() => {
  if (userRole === 'encargadoSeguridad') return '/panel-seguridad'
  if (userRole === 'mesero') return '/panel-mesero'
  return '/adminpanel'
})()


const form = ref({
  name: '',
  email: '',
  phone: '',
})


const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}



const goToResetPassword = () => {
  window.location.href = '/reset_password'
}

const goToAdminPanel = () => {
  window.location.href = homeRoute
}

onMounted(async () => {
  try {
    const user = await getCurrentUser()

    form.value.name = user?.nombre || ''
    form.value.email = user?.correo || ''
    form.value.phone = user?.telefono != null ? String(user.telefono) : ''
  } catch (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return
    }

    console.error('Error cargando perfil:', error)
  }
})

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
  <li><RouterLink :to="homeRoute">Inicio</RouterLink></li>
  <li><RouterLink to="/logout">Cerrar Sesión</RouterLink></li>
</ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form id="registration-form">
          <h3>Mi perfil</h3>

          <div class="profile-photo-container">
            <img :src="logo" alt="Foto de usuario" class="profile-photo" />
          </div>

          <div class="input-container">
            <label for="name">Nombre</label>
            <div class="input-with-icon">
<input id="name" v-model="form.name" type="text" name="name" readonly />              
            </div>
          </div>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <div class="input-with-icon">
<input id="email" v-model="form.email" type="text" name="email" readonly />
            </div>
          </div>

          <div class="input-container">
            <label for="phone">Teléfono</label>
            <div class="input-with-icon">
<input id="phone" v-model="form.phone" type="text" name="phone" readonly />             
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
                <i class="fas fa-lock"></i>
                <span>Restablecer Contraseña</span>
              </button>
            </div>
          </div>

<div class="button-container">
  <button type="button" class="btn" @click="goToAdminPanel">Volver</button>
</div>
        </form>
      </div>
    </div>
  </div>
</template>
    <style>
        .change-password-btn {
            width: 100%;
            max-width: 300px;
            padding: 10px 20px;
            background-color: #192847;
            color: #faf7e6;
            font-weight: bold;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            text-align: center; /* Asegura que el texto esté centrado */
        }

        .change-password-btn i {
            margin-right: 10px;
        }

        /* Ajustes adicionales para el texto del botón */
        .change-password-btn span {
            display: block; /* Asegura que el texto esté en bloque y no cause problemas de alineación */
        }
    </style>