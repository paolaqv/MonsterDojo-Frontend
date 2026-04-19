<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import '@/assets/css/perfil_usuario.css'
import logo from '@/assets/images/logo.png'
import userPhoto from '@/assets/images/user_photo.png'
import { getCurrentUser, updateCurrentUser } from '@/services/users.service'

const router = useRouter()
const menuOpen = ref(false)
const generalError = ref('')
const successMessage = ref('')

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

const validateForm = () => {
  let valid = true

  errors.value.name = ''
  errors.value.email = ''
  errors.value.phone = ''
  generalError.value = ''
  successMessage.value = ''

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

  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    generalError.value = ''
    successMessage.value = ''

    const updatedUser = await updateCurrentUser({
      nombre: form.value.name.trim(),
      correo: form.value.email.trim(),
      telefono: form.value.phone ? Number(form.value.phone) : null,
    })

    localStorage.setItem('user', JSON.stringify(updatedUser))
    successMessage.value = 'Perfil actualizado correctamente.'
  } catch (error) {
    generalError.value =
      error?.response?.data?.detail || 'No se pudieron guardar los cambios.'
  }
}

const goToResetPassword = () => {
  router.push('/reset_password')
}

const goToUserHome = () => {
  router.push('/inicio_usuario')
}

onMounted(async () => {
  try {
    const user = await getCurrentUser()

    form.value.name = user?.nombre || ''
    form.value.email = user?.correo || ''
    form.value.phone = user?.telefono != null ? String(user.telefono) : ''
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
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
        <li><RouterLink to="/inicio_usuario">Inicio</RouterLink></li>
        <li><RouterLink to="/logout">Cerrar Sesión</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form
          id="registration-form"
          @submit.prevent="handleSubmit"
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

          <div v-if="generalError" class="error-message">
            {{ generalError }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
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

<style>
.error-message {
  color: red;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
}

.success-message {
  color: green;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
  margin-top: 8px;
}
</style>