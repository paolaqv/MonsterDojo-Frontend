<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import { changePasswordRequired } from '@/services/auth.service'
import { getPublicPasswordPolicy } from '@/services/passwordPolicy.service'

const router = useRouter()

const correo = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const policy = ref({
  longitud_minima: 8,
  requiere_mayusculas: true,
  requiere_minusculas: true,
  requiere_numeros: true,
  requiere_simbolos: true,
})

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
    const data = await getPublicPasswordPolicy()
    policy.value = data
  } catch {
    // fallback
  }
}

const handleSubmit = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!correo.value) {
      errorMessage.value = 'No se encontró el correo del usuario.'
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      errorMessage.value = 'Las contraseñas no coinciden.'
      return
    }

    loading.value = true

    await changePasswordRequired({
      correo: correo.value,
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })

    successMessage.value = 'Contraseña actualizada correctamente. Inicia sesión nuevamente.'

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setTimeout(() => {
      router.push('/login')
    }, 1200)
   } catch (error) {
    errorMessage.value =
      error?.normalizedMessage ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      'No se pudo actualizar la contraseña.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  correo.value = sessionStorage.getItem('password_change_correo') || ''
  await loadPolicy()

  if (!correo.value) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="container">
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <h3>Cambio obligatorio de contraseña</h3>

        <p>Debes actualizar tu contraseña para continuar usando el sistema.</p>

        <div class="input-container">
          <label>Contraseña actual</label>
          <input v-model="currentPassword" type="password" required />
        </div>

        <div class="input-container">
          <label>Nueva contraseña</label>
          <input v-model="newPassword" type="password" required />
        </div>

        <div class="input-container">
          <label>Confirmar nueva contraseña</label>
          <input v-model="confirmPassword" type="password" required />
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

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="input-container">
          <button type="submit" :disabled="loading">
            {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
          </button>
        </div>
      </form>
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
  font-size: 0.85em;
  margin: 10px 0;
}

.success-message {
  color: green;
  font-size: 0.85em;
  margin: 10px 0;
}
</style>