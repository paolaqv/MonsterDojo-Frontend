<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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

const captchaError = ref('')
const recaptchaToken = ref('')
const recaptchaWidgetId = ref(null)
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const removeExistingRecaptchaScript = () => {
  const existingScript = document.getElementById('google-recaptcha-script')
  if (existingScript) existingScript.remove()
}

const loadRecaptchaScript = () => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      resolve()
      return
    }

    window.onRecaptchaLoaded = () => {
      resolve()
    }

    removeExistingRecaptchaScript()

    const script = document.createElement('script')
    script.id = 'google-recaptcha-script'
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit'
    script.async = true
    script.defer = true
    script.onerror = () => {
      reject(new Error('No se pudo cargar el script de Google reCAPTCHA.'))
    }

    document.head.appendChild(script)
  })
}

const renderRecaptcha = async () => {
  try {
    captchaError.value = ''
    recaptchaToken.value = ''
    recaptchaWidgetId.value = null

    if (!recaptchaSiteKey) {
      captchaError.value = 'No se configuró VITE_RECAPTCHA_SITE_KEY.'
      return
    }

    await nextTick()
    await loadRecaptchaScript()

    const container = document.getElementById('recaptcha-container')

    if (!container) {
      captchaError.value = 'No se encontró el contenedor de reCAPTCHA.'
      return
    }

    if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
      captchaError.value = 'Google reCAPTCHA no está disponible.'
      return
    }

    container.innerHTML = ''

    recaptchaWidgetId.value = window.grecaptcha.render(container, {
      sitekey: recaptchaSiteKey,
      callback: (token) => {
        recaptchaToken.value = token
        captchaError.value = ''
      },
      'expired-callback': () => {
        recaptchaToken.value = ''
        captchaError.value = 'La verificación reCAPTCHA expiró. Vuelve a completarla.'
      },
      'error-callback': () => {
        recaptchaToken.value = ''
        captchaError.value = 'No se pudo completar la verificación reCAPTCHA.'
      },
    })
  } catch (error) {
    console.error('Error reCAPTCHA:', error)
    captchaError.value = 'No se pudo cargar reCAPTCHA. Revisa la clave, dominio o conexión.'
  }
}

const resetRecaptcha = async () => {
  recaptchaToken.value = ''

  if (window.grecaptcha && recaptchaWidgetId.value !== null) {
    window.grecaptcha.reset(recaptchaWidgetId.value)
    return
  }

  await renderRecaptcha()
}

onMounted(() => {
  renderRecaptcha()
})

onBeforeUnmount(() => {
  recaptchaToken.value = ''
  window.onRecaptchaLoaded = undefined
})

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    captchaError.value = ''

    if (!recaptchaToken.value) {
      captchaError.value = 'Debes completar la verificación reCAPTCHA.'
      return
    }

    const normalizedEmail = correo.value.trim().toLowerCase()
console.log('RECAPTCHA TOKEN =>', recaptchaToken.value)
    const result = await login({
      correo: normalizedEmail,
      password: password.value,
      recaptcha_token: recaptchaToken.value,
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
      'Correo electrónico o contraseña incorrectos.'

    if (
      detail.includes('Debes cambiar tu contraseña') ||
      detail.includes('Tu contraseña ha expirado')
    ) {
      sessionStorage.setItem('password_change_correo', correo.value.trim().toLowerCase())
      router.push('/change-required-password')
      return
    }

    errorMessage.value = detail
    await resetRecaptcha()
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
        <li>
          <RouterLink to="/">Inicio</RouterLink>
        </li>
        <li>
          <RouterLink to="/register">Registrarse</RouterLink>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form @submit.prevent="handleLogin">
          <h3>Iniciar Sesión</h3>

          <div class="input-container">
            <label for="email">Correo Electrónico</label>
            <input
              id="email"
              v-model.trim="correo"
              type="email"
              name="correo"
              maxlength="254"
              required
            />
          </div>

          <div class="input-container">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              maxlength="256"
              required
            />

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <span>
              ¿Olvidaste tu contraseña?
              <RouterLink to="/reset_password">Recupérala</RouterLink>
            </span>
          </div>

          <div class="input-container captcha-box">
            <label>Verificación reCAPTCHA</label>

            <div id="recaptcha-container"></div>

            <span v-if="captchaError" class="error-message">
              {{ captchaError }}
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

.captcha-box {
  margin-top: 14px;
}

.captcha-box label {
  display: block;
  margin-bottom: 8px;
}

#recaptcha-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
</style>