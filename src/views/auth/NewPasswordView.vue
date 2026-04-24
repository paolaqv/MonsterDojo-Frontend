<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import { getPasswordPolicy } from '@/services/passwordPolicy.service'
import { resetPasswordWithCode } from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const generalError = ref('')
const successMessage = ref('')

const policy = ref({
  longitud_minima: 8,
  requiere_mayusculas: true,
  requiere_minusculas: true,
  requiere_numeros: true,
  requiere_simbolos: true,
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const checks = computed(() => {
  const value = newPassword.value || ''
  return {
    longitud: value.length >= Number(policy.value.longitud_minima || 8),
    mayuscula: !policy.value.requiere_mayusculas || /[A-Z]/.test(value),
    minuscula: !policy.value.requiere_minusculas || /[a-z]/.test(value),
    numero: !policy.value.requiere_numeros || /\d/.test(value),
    simbolo: !policy.value.requiere_simbolos || /[^A-Za-z0-9]/.test(value),
    coincide: value.length > 0 && value === confirmPassword.value,
  }
})

const loadPolicy = async () => {
  try {
    const data = await getPasswordPolicy()
    policy.value = data
  } catch {
    // dejamos valores por defecto
  }
}

const handleSaveChanges = async () => {
  const correo = sessionStorage.getItem('reset_correo') || ''
  const codigo = sessionStorage.getItem('reset_codigo') || ''

  if (!correo || !codigo) {
    generalError.value = 'La sesión de recuperación expiró. Vuelve a iniciar el proceso.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    generalError.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    generalError.value = ''
    successMessage.value = ''

    await resetPasswordWithCode({
      correo,
      codigo,
      new_password: newPassword.value,
    })

    sessionStorage.removeItem('reset_correo')
    sessionStorage.removeItem('reset_codigo')
    sessionStorage.removeItem('reset_codigo_debug')

    successMessage.value = 'Contraseña actualizada correctamente.'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    generalError.value =
      error?.response?.data?.detail || 'No se pudo actualizar la contraseña.'
  }
}

onMounted(loadPolicy)
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
        <form id="change-password-form" @submit.prevent="handleSaveChanges">
          <h3>Nueva contraseña</h3>

          <div class="input-container">
            <label for="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              name="new-password"
              required
            />
          </div>

          <div class="input-container">
            <label for="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              name="confirm-password"
              required
            />
          </div>

          <div class="password-checklist">
            <p :class="{ valid: checks.longitud }">
              Al menos {{ policy.longitud_minima }} caracteres
            </p>
            <p :class="{ valid: checks.mayuscula }">Incluye mayúscula</p>
            <p :class="{ valid: checks.minuscula }">Incluye minúscula</p>
            <p :class="{ valid: checks.numero }">Incluye número</p>
            <p :class="{ valid: checks.simbolo }">Incluye símbolo especial</p>
            <p :class="{ valid: checks.coincide }">Las contraseñas coinciden</p>
          </div>

          <div v-if="generalError" class="error-message">
            {{ generalError }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="input-container">
            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-checklist {
  margin: 14px 0;
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

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 8px;
}

.success-message {
  color: green;
  font-size: 0.8em;
  margin-top: 8px;
}
</style>