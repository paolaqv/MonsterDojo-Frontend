<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/userforms.css'
import logo from '@/assets/images/logo.png'
import {
  register,
  requestEmailVerification,
} from '@/services/auth.service'

const router = useRouter()

const menuOpen = ref(false)
const registerError = ref('')
const registerMessage = ref('')
const verificationLoading = ref(false)
const verificationSent = ref(false)
const correoVerificado = ref(false)

const form = ref({
  correo: '',
  codigo_verificacion: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  telefono: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  correo: '',
  codigo_verificacion: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  telefono: '',
  password: '',
  confirmPassword: '',
})

const touched = ref({
  correo: false,
  codigo_verificacion: false,
  nombre: false,
  primer_apellido: false,
  segundo_apellido: false,
  telefono: false,
  password: false,
  confirmPassword: false,
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]+$/
const phoneRegex = /^\d{7,10}$/
const codeRegex = /^\d{6}$/

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const passwordChecks = computed(() => {
  const value = form.value.password || ''

  return {
    longitud: value.length >= 12,
    mayuscula: /[A-Z]/.test(value),
    minuscula: /[a-z]/.test(value),
    numero: /\d/.test(value),
    simbolo: /[^A-Za-z0-9]/.test(value),
    coincide:
      value.length > 0 &&
      form.value.confirmPassword.length > 0 &&
      value === form.value.confirmPassword,
  }
})

const passwordStrength = computed(() => {
  const value = form.value.password || ''

  if (!value) {
    return {
      score: 0,
      percentage: 0,
      label: '',
      className: '',
      message: '',
    }
  }

  const checks = [
    passwordChecks.value.longitud,
    passwordChecks.value.mayuscula,
    passwordChecks.value.minuscula,
    passwordChecks.value.numero,
    passwordChecks.value.simbolo,
  ]

  const score = checks.filter(Boolean).length
  const percentage = score * 20

  if (score <= 2) {
    return {
      score,
      percentage,
      label: 'Débil',
      className: 'weak',
      message: 'Agrega más elementos para mejorar la contraseña.',
    }
  }

  if (score <= 4) {
    return {
      score,
      percentage,
      label: 'Media',
      className: 'medium',
      message: 'Casi lista. Completa todos los requisitos.',
    }
  }

  return {
    score,
    percentage,
    label: 'Fuerte',
    className: 'strong',
    message: 'La contraseña cumple con la política requerida.',
  }
})

const validateCorreo = (showRequired = false) => {
  const correo = form.value.correo.trim().toLowerCase()

  if (!correo) {
    errors.value.correo = showRequired ? 'El correo es obligatorio.' : ''
    return !showRequired
  }

  if (correo.length > 254) {
    errors.value.correo = 'El correo no debe superar los 254 caracteres.'
    return false
  }

  if (!emailRegex.test(correo)) {
    errors.value.correo = 'Ingresa un correo válido.'
    return false
  }

  errors.value.correo = ''
  return true
}

const validateCodigo = (showRequired = false) => {
  const codigo = form.value.codigo_verificacion.trim()

  if (!codigo) {
    errors.value.codigo_verificacion = showRequired
      ? 'El código de verificación es obligatorio.'
      : ''
    return !showRequired
  }

  if (!codeRegex.test(codigo)) {
    errors.value.codigo_verificacion =
      'El código debe tener exactamente 6 dígitos.'
    return false
  }

  errors.value.codigo_verificacion = ''
  return true
}

const validateNombre = (showRequired = false) => {
  const nombre = form.value.nombre.trim()

  if (!nombre) {
    errors.value.nombre = showRequired ? 'El nombre es obligatorio.' : ''
    return !showRequired
  }

  if (nombre.length < 2 || nombre.length > 50) {
    errors.value.nombre = 'El nombre debe tener entre 2 y 50 caracteres.'
    return false
  }

  if (!nameRegex.test(nombre)) {
    errors.value.nombre = 'El nombre solo debe contener letras y espacios.'
    return false
  }

  errors.value.nombre = ''
  return true
}

const validatePrimerApellido = (showRequired = false) => {
  const apellido = form.value.primer_apellido.trim()

  if (!apellido) {
    errors.value.primer_apellido = showRequired
      ? 'El primer apellido es obligatorio.'
      : ''
    return !showRequired
  }

  if (apellido.length < 2 || apellido.length > 50) {
    errors.value.primer_apellido =
      'El primer apellido debe tener entre 2 y 50 caracteres.'
    return false
  }

  if (!nameRegex.test(apellido)) {
    errors.value.primer_apellido =
      'El primer apellido solo debe contener letras y espacios.'
    return false
  }

  errors.value.primer_apellido = ''
  return true
}

const validateSegundoApellido = () => {
  const apellido = form.value.segundo_apellido.trim()

  if (!apellido) {
    errors.value.segundo_apellido = ''
    return true
  }

  if (apellido.length > 50) {
    errors.value.segundo_apellido =
      'El segundo apellido no debe superar los 50 caracteres.'
    return false
  }

  if (!nameRegex.test(apellido)) {
    errors.value.segundo_apellido =
      'El segundo apellido solo debe contener letras y espacios.'
    return false
  }

  errors.value.segundo_apellido = ''
  return true
}

const validateTelefono = (showRequired = false) => {
  const telefono = String(form.value.telefono).trim()

  if (!telefono) {
    errors.value.telefono = showRequired ? 'El teléfono es obligatorio.' : ''
    return !showRequired
  }

  if (!phoneRegex.test(telefono)) {
    errors.value.telefono =
      'El teléfono debe tener entre 7 y 10 dígitos numéricos.'
    return false
  }

  errors.value.telefono = ''
  return true
}

const validatePassword = (showRequired = false) => {
  const password = form.value.password || ''

  if (!password) {
    errors.value.password = showRequired ? 'La contraseña es obligatoria.' : ''
    return !showRequired
  }

  if (password.length > 256) {
    errors.value.password =
      'La contraseña no debe superar los 256 caracteres.'
    return false
  }

  const validPassword =
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)

  if (!validPassword) {
    errors.value.password =
      'La contraseña aún no cumple con todos los requisitos.'
    return false
  }

  errors.value.password = ''
  return true
}

const validateConfirmPassword = (showRequired = false) => {
  const confirmation = form.value.confirmPassword || ''

  if (!confirmation) {
    errors.value.confirmPassword = showRequired
      ? 'Confirma la contraseña.'
      : ''
    return !showRequired
  }

  if (confirmation !== form.value.password) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden.'
    return false
  }

  errors.value.confirmPassword = ''
  return true
}

const validators = {
  correo: validateCorreo,
  codigo_verificacion: validateCodigo,
  nombre: validateNombre,
  primer_apellido: validatePrimerApellido,
  segundo_apellido: validateSegundoApellido,
  telefono: validateTelefono,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
}

const validateField = (field, showRequired = touched.value[field]) => {
  return validators[field](showRequired)
}

const markTouched = (field) => {
  touched.value[field] = true
  validateField(field, true)
}

watch(
  () => form.value.correo,
  (value) => {
    form.value.codigo_verificacion = ''
    verificationSent.value = false
    correoVerificado.value = false
    registerMessage.value = ''

    touched.value.codigo_verificacion = false
    errors.value.codigo_verificacion = ''

    if (value.trim() || touched.value.correo) {
      validateCorreo(touched.value.correo)
    } else {
      errors.value.correo = ''
    }
  }
)

watch(
  () => form.value.codigo_verificacion,
  (value) => {
    correoVerificado.value = false

    if (value.trim() || touched.value.codigo_verificacion) {
      validateCodigo(touched.value.codigo_verificacion)
    } else {
      errors.value.codigo_verificacion = ''
    }
  }
)

watch(
  () => form.value.nombre,
  (value) => {
    if (value.trim() || touched.value.nombre) {
      validateNombre(touched.value.nombre)
    } else {
      errors.value.nombre = ''
    }
  }
)

watch(
  () => form.value.primer_apellido,
  (value) => {
    if (value.trim() || touched.value.primer_apellido) {
      validatePrimerApellido(touched.value.primer_apellido)
    } else {
      errors.value.primer_apellido = ''
    }
  }
)

watch(
  () => form.value.segundo_apellido,
  () => {
    validateSegundoApellido()
  }
)

watch(
  () => form.value.telefono,
  (value) => {
    if (String(value).trim() || touched.value.telefono) {
      validateTelefono(touched.value.telefono)
    } else {
      errors.value.telefono = ''
    }
  }
)

watch(
  () => form.value.password,
  (value) => {
    if (value || touched.value.password) {
      validatePassword(touched.value.password)
    } else {
      errors.value.password = ''
    }

    if (form.value.confirmPassword || touched.value.confirmPassword) {
      validateConfirmPassword(touched.value.confirmPassword)
    }
  }
)

watch(
  () => form.value.confirmPassword,
  (value) => {
    if (value || touched.value.confirmPassword) {
      validateConfirmPassword(touched.value.confirmPassword)
    } else {
      errors.value.confirmPassword = ''
    }
  }
)

const validateForm = () => {
  registerError.value = ''
  registerMessage.value = ''

  Object.keys(touched.value).forEach((field) => {
    touched.value[field] = true
  })

  const validCorreo = validateCorreo(true)
  const validCodigo = validateCodigo(true)
  const validNombre = validateNombre(true)
  const validPrimerApellido = validatePrimerApellido(true)
  const validSegundoApellido = validateSegundoApellido()
  const validTelefono = validateTelefono(true)
  const validPassword = validatePassword(true)
  const validConfirmPassword = validateConfirmPassword(true)

  let valid =
    validCorreo &&
    validCodigo &&
    validNombre &&
    validPrimerApellido &&
    validSegundoApellido &&
    validTelefono &&
    validPassword &&
    validConfirmPassword

  if (!correoVerificado.value) {
    errors.value.codigo_verificacion =
      'Debes ingresar y verificar el código antes de registrarte.'
    valid = false
  }

  return valid
}

const getErrorMessage = (error, fallback) =>
  error?.normalizedMessage ||
  error?.response?.data?.error?.message ||
  error?.response?.data?.detail ||
  fallback

const sendVerificationCode = async () => {
  touched.value.correo = true

  if (!validateCorreo(true)) {
    return
  }

  try {
    registerError.value = ''
    registerMessage.value = ''
    verificationLoading.value = true

    const correo = form.value.correo.trim().toLowerCase()

    await requestEmailVerification({ correo })

    verificationSent.value = true
    correoVerificado.value = false
    registerMessage.value = 'Código enviado al correo ingresado.'
  } catch (error) {
    registerError.value = getErrorMessage(
      error,
      'No se pudo enviar el código de verificación.'
    )
  } finally {
    verificationLoading.value = false
  }
}

const verifyEmailCode = () => {
  registerError.value = ''
  registerMessage.value = ''
  touched.value.codigo_verificacion = true

  if (!validateCodigo(true)) {
    correoVerificado.value = false
    return
  }

  correoVerificado.value = true
  registerMessage.value =
    'Código ingresado. Se validará al registrar el usuario.'
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    registerError.value = ''

    await register({
      nombre: form.value.nombre.trim(),
      primer_apellido: form.value.primer_apellido.trim(),
      segundo_apellido: form.value.segundo_apellido.trim() || null,
      correo: form.value.correo.trim().toLowerCase(),
      codigo_verificacion: form.value.codigo_verificacion.trim(),
      telefono: Number(String(form.value.telefono).trim()),
      password: form.value.password,
      rol_id_rol: 'cliente',
    })

    router.push('/login')
  } catch (error) {
    registerError.value = getErrorMessage(
      error,
      'No se pudo registrar el usuario.'
    )
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
        <li><RouterLink to="/login">Iniciar Sesión</RouterLink></li>
      </ul>
    </nav>

    <div class="container">
      <div class="form-container">
        <form novalidate @submit.prevent="handleRegister">
          <h3>Crear una cuenta</h3>

          <div class="input-container">
            <label>Correo electrónico</label>
            <input
              v-model="form.correo"
              type="email"
              maxlength="254"
              required
              :readonly="correoVerificado"
              :class="{ 'field-invalid': errors.correo }"
              placeholder="usuario@gmail.com / usuario@hotmail.com / usuario@ucb.edu.bo"
              @blur="markTouched('correo')"
            />
            <small class="input-help">
              Puedes usar cualquier correo válido. Se enviará un código para
              verificarlo.
            </small>
            <span v-if="errors.correo" class="error-message">
              {{ errors.correo }}
            </span>
          </div>

          <div class="input-container">
            <button
              type="button"
              :disabled="verificationLoading || correoVerificado"
              @click="sendVerificationCode"
            >
              {{ verificationSent ? 'Reenviar código' : 'Enviar código' }}
            </button>
          </div>

          <div v-if="verificationSent" class="input-container">
            <label>Código de verificación</label>
            <input
              v-model="form.codigo_verificacion"
              type="text"
              inputmode="numeric"
              maxlength="6"
              pattern="[0-9]{6}"
              placeholder="123456"
              :readonly="correoVerificado"
              :class="{ 'field-invalid': errors.codigo_verificacion }"
              @blur="markTouched('codigo_verificacion')"
            />

            <button
              type="button"
              :disabled="verificationLoading || correoVerificado"
              @click="verifyEmailCode"
            >
              Verificar correo
            </button>

            <span v-if="errors.codigo_verificacion" class="error-message">
              {{ errors.codigo_verificacion }}
            </span>
          </div>

          <div v-if="registerMessage" class="success-message">
            {{ registerMessage }}
          </div>

          <div class="input-container">
            <label>Nombre</label>
            <input
              v-model="form.nombre"
              type="text"
              maxlength="50"
              autocomplete="given-name"
              required
              :class="{ 'field-invalid': errors.nombre }"
              @blur="markTouched('nombre')"
            />
            <span v-if="errors.nombre" class="error-message">
              {{ errors.nombre }}
            </span>
          </div>

          <div class="input-container">
            <label>Primer apellido</label>
            <input
              v-model="form.primer_apellido"
              type="text"
              maxlength="50"
              autocomplete="family-name"
              required
              :class="{ 'field-invalid': errors.primer_apellido }"
              @blur="markTouched('primer_apellido')"
            />
            <span v-if="errors.primer_apellido" class="error-message">
              {{ errors.primer_apellido }}
            </span>
          </div>

          <div class="input-container">
            <label>Segundo apellido</label>
            <input
              v-model="form.segundo_apellido"
              type="text"
              maxlength="50"
              autocomplete="additional-name"
              :class="{ 'field-invalid': errors.segundo_apellido }"
              @blur="markTouched('segundo_apellido')"
            />
            <span v-if="errors.segundo_apellido" class="error-message">
              {{ errors.segundo_apellido }}
            </span>
          </div>

          <div class="input-container">
            <label>Teléfono</label>
            <input
              v-model="form.telefono"
              type="text"
              inputmode="numeric"
              maxlength="10"
              minlength="7"
              pattern="[0-9]{7,10}"
              placeholder="70000000"
              required
              :class="{ 'field-invalid': errors.telefono }"
              @blur="markTouched('telefono')"
            />
            <span v-if="errors.telefono" class="error-message">
              {{ errors.telefono }}
            </span>
          </div>

          <div class="input-container">
            <label>Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              maxlength="256"
              required
              :class="{ 'field-invalid': errors.password }"
              @blur="markTouched('password')"
            />

            <div v-if="form.password" class="password-strength">
              <div class="strength-header">
                <span>Fortaleza de contraseña</span>
                <strong :class="passwordStrength.className">
                  {{ passwordStrength.label }}
                </strong>
              </div>

              <div class="strength-bar">
                <div
                  class="strength-progress"
                  :class="passwordStrength.className"
                  :style="{ width: `${passwordStrength.percentage}%` }"
                ></div>
              </div>

              <p class="strength-message" :class="passwordStrength.className">
                {{ passwordStrength.message }}
              </p>
            </div>

            <div class="password-checklist">
              <p :class="{ valid: passwordChecks.longitud }">
                <span class="check-icon">
                  {{ passwordChecks.longitud ? '✓' : '○' }}
                </span>
                Al menos 12 caracteres
              </p>

              <p :class="{ valid: passwordChecks.mayuscula }">
                <span class="check-icon">
                  {{ passwordChecks.mayuscula ? '✓' : '○' }}
                </span>
                Incluye una letra mayúscula
              </p>

              <p :class="{ valid: passwordChecks.minuscula }">
                <span class="check-icon">
                  {{ passwordChecks.minuscula ? '✓' : '○' }}
                </span>
                Incluye una letra minúscula
              </p>

              <p :class="{ valid: passwordChecks.numero }">
                <span class="check-icon">
                  {{ passwordChecks.numero ? '✓' : '○' }}
                </span>
                Incluye un número
              </p>

              <p :class="{ valid: passwordChecks.simbolo }">
                <span class="check-icon">
                  {{ passwordChecks.simbolo ? '✓' : '○' }}
                </span>
                Incluye un carácter especial
              </p>
            </div>

            <span v-if="errors.password" class="error-message">
              {{ errors.password }}
            </span>
          </div>

          <div class="input-container">
            <label>Confirmar contraseña</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              maxlength="256"
              required
              :class="{ 'field-invalid': errors.confirmPassword }"
              @blur="markTouched('confirmPassword')"
            />

            <span v-if="form.confirmPassword" class="password-match-message">
              <span v-if="passwordChecks.coincide" class="valid-message">
                Las contraseñas coinciden.
              </span>
              <span v-else class="error-message">
                Las contraseñas no coinciden.
              </span>
            </span>

            <span
              v-if="errors.confirmPassword && !form.confirmPassword"
              class="error-message"
            >
              {{ errors.confirmPassword }}
            </span>
          </div>

          <div v-if="registerError" class="error-message register-error">
            {{ registerError }}
          </div>

          <div class="input-container">
            <button type="submit">Registrarse</button>
            <span>
              ¿Ya tienes una cuenta?
              <RouterLink to="/login">Inicia sesión</RouterLink>
            </span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.error-message {
  display: block;
  margin-top: 6px;
  color: #dc2626;
  font-size: 0.8em;
  visibility: visible;
  height: auto;
}

.register-error {
  margin-bottom: 12px;
}

.input-help {
  display: block;
  margin-top: 6px;
  font-size: 0.8em;
  color: #6b7280;
}

.field-invalid {
  border: 1px solid #dc2626 !important;
  background-color: #fef2f2;
}

.field-invalid:focus {
  outline: none;
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
}

.success-message {
  margin-bottom: 12px;
  color: #1f7a38;
  font-size: 0.9em;
  font-weight: 600;
}

.password-checklist {
  margin-top: 10px;
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

.password-match-message {
  display: block;
  margin-top: 6px;
}

.valid-message {
  color: #1f7a38;
  font-size: 0.8em;
  font-weight: 600;
}
.password-strength {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #475569;
}

.strength-header strong {
  font-size: 13px;
  font-weight: 700;
}

.strength-bar {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.strength-progress {
  height: 100%;
  width: 0;
  border-radius: 999px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-progress.weak {
  background-color: #dc2626;
}

.strength-progress.medium {
  background-color: #f59e0b;
}

.strength-progress.strong {
  background-color: #16a34a;
}

.strength-header .weak,
.strength-message.weak {
  color: #dc2626;
}

.strength-header .medium,
.strength-message.medium {
  color: #b45309;
}

.strength-header .strong,
.strength-message.strong {
  color: #15803d;
}

.strength-message {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 500;
}

.password-checklist {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #f7fafc;
  border: 1px solid #dde7ed;
}

.password-checklist p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 7px 0;
  color: #7a8590;
  font-size: 14px;
  transition: color 0.2s ease;
}

.password-checklist p.valid {
  color: #1f7a38;
  font-weight: 600;
}

.check-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  font-size: 15px;
  font-weight: 700;
}
</style>