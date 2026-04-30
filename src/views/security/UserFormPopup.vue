<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  X,
  CheckCircle2,
  Sparkles,
  BadgeInfo,
} from 'lucide-vue-next'
import {
  requestEmailVerification,
} from '@/services/auth.service'
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  userData: {
    type: Object,
    default: () => null,
  },
  roles: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const currentStep = reactive({ value: 0 })

const userForm = reactive({
  id: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  correo: '',
  correo_contacto: '',
  codigo_verificacion: '',
  telefono: '',
  rol_id_rol: '',
  enviarCredenciales: true,
})

const verificationLoading = ref(false)
const verificationSent = ref(false)
const correoVerificado = ref(false)
const verificationMessage = ref('')
const verificationError = ref('')

const sanitize = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()

const buildPreviewEmail = () => {
  const name = sanitize(userForm.nombre).split(' ')[0]
  const firstSurname = sanitize(userForm.primer_apellido).split(' ')[0]
  const secondSurname = sanitize(userForm.segundo_apellido).split(' ')[0]

  if (!name || !firstSurname) return ''

let email = `${name[0]}${firstSurname}@monsterdojo.com`

if (secondSurname) {
  email = `${name[0]}${firstSurname}${secondSurname[0]}@monsterdojo.com`
}

  return email
}

const generatedEmailPreview = computed(() => buildPreviewEmail())

const resetForm = () => {
  userForm.id = ''
  userForm.nombre = ''
  userForm.primer_apellido = ''
  userForm.segundo_apellido = ''
  userForm.correo = ''
  userForm.correo_contacto = ''
  userForm.codigo_verificacion = ''
  userForm.telefono = ''
  userForm.rol_id_rol = ''
  userForm.enviarCredenciales = true

  verificationSent.value = false
  correoVerificado.value = false
  verificationMessage.value = ''
  verificationError.value = ''

  currentStep.value = 0
}

const applyUserData = () => {
  if (!props.userData) {
    resetForm()
    return
  }

  userForm.id = props.userData.id_usuario || ''
  userForm.nombre = props.userData.nombre || ''
  userForm.primer_apellido = props.userData.primer_apellido || ''
  userForm.segundo_apellido = props.userData.segundo_apellido || ''
  userForm.correo = props.userData.correo || ''
  userForm.correo = props.userData.correo || ''
  userForm.correo_contacto = props.userData.correo_contacto || ''
  userForm.codigo_verificacion = ''
  userForm.telefono = props.userData.telefono ?? ''
  userForm.password = ''
  userForm.rol_id_rol = props.userData.rol_id_rol || ''
  userForm.enviarCredenciales = true
  currentStep.value = 0

  correoVerificado.value = props.isEditing
  verificationSent.value = false
  verificationMessage.value = ''
  verificationError.value = ''
}

watch(
  () => props.show,
  (value) => {
    if (value) applyUserData()
  }
)

watch(
  () => props.userData,
  () => {
    if (props.show) applyUserData()
  },
  { deep: true }
)

watch(
  () => userForm.correo_contacto,
  () => {
    if (!props.isEditing) {
      userForm.codigo_verificacion = ''
      verificationSent.value = false
      correoVerificado.value = false
      verificationMessage.value = ''
      verificationError.value = ''
    }
  }
)
const selectedRoleName = computed(() => {
  const role = props.roles.find((r) => r.id_rol === userForm.rol_id_rol)
  return role?.nombre || 'Sin rol'
})

const effectiveEmail = computed(() => {
  return props.isEditing ? userForm.correo || generatedEmailPreview.value : generatedEmailPreview.value
})

const canGoNext = computed(() => {
if (currentStep.value === 0) {
  const basicDataOk =
    userForm.nombre.trim() !== '' &&
    userForm.primer_apellido.trim() !== '' &&
    String(userForm.telefono).trim() !== ''

  if (props.isEditing) return basicDataOk

  return (
    basicDataOk &&
    userForm.correo_contacto.trim() !== '' &&
    correoVerificado.value
  )
}

if (currentStep.value === 1) {
  return userForm.rol_id_rol.trim() !== ''
}

  return true
})

const nextStep = () => {
  if (!canGoNext.value) return
  if (currentStep.value < 2) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}
const getErrorMessage = (error, fallback) =>
  error?.normalizedMessage ||
  error?.response?.data?.error?.message ||
  error?.response?.data?.detail ||
  fallback

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sendVerificationCode = async () => {
  try {
    verificationError.value = ''
    verificationMessage.value = ''
userForm.codigo_verificacion = ''
correoVerificado.value = false
    const correo = userForm.correo_contacto.trim().toLowerCase()

    if (!emailRegex.test(correo)) {
      verificationError.value = 'Ingresa un correo real válido.'
      return
    }

    verificationLoading.value = true

    await requestEmailVerification({ correo })

    verificationSent.value = true
    correoVerificado.value = false
    verificationMessage.value = 'Código enviado al correo de contacto.'
  } catch (error) {
    verificationError.value = getErrorMessage(
      error,
      'No se pudo enviar el código de verificación.'
    )
  } finally {
    verificationLoading.value = false
  }
}

const confirmVerificationCode = () => {
  verificationError.value = ''
  verificationMessage.value = ''

  const codigo = userForm.codigo_verificacion.trim()

  if (!codigo) {
    verificationError.value = 'Ingresa el código de verificación.'
    return
  }

  if (!/^\d{6}$/.test(codigo)) {
    verificationError.value = 'El código debe tener 6 dígitos.'
    return
  }

  correoVerificado.value = true
  verificationMessage.value = 'Código ingresado. Se validará al crear el usuario.'
}
const closePopup = () => {
  resetForm()
  emit('close')
}

const saveUser = () => {
  emit('save', JSON.parse(JSON.stringify(userForm)))
}
</script>

<template>
  <div v-if="show" class="role-popup-overlay">
    <div
      v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 350 } }"
      class="role-popup role-popup-enhanced"
    >
      <div class="role-popup-header role-popup-header-enhanced">
        <div class="role-popup-title-wrap">
          <div class="role-popup-icon">
            <UserRound :size="24" />
          </div>
          <div>
            <h2>{{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
            <p>Completa los datos del usuario y asigna su rol.</p>
          </div>
        </div>

        <button v-wave class="close-btn" type="button" @click="closePopup">
          <X :size="18" />
        </button>
      </div>

      <div class="role-stepper role-stepper-enhanced">
        <div class="role-step" :class="{ active: currentStep.value === 0, done: currentStep.value > 0 }">
          <span>1</span>
          <p>Datos</p>
        </div>
        <div class="role-step-line" :class="{ active: currentStep.value > 0 }"></div>
        <div class="role-step" :class="{ active: currentStep.value === 1, done: currentStep.value > 1 }">
          <span>2</span>
          <p>Acceso</p>
        </div>
        <div class="role-step-line" :class="{ active: currentStep.value > 1 }"></div>
        <div class="role-step" :class="{ active: currentStep.value === 2 }">
          <span>3</span>
          <p>Resumen</p>
        </div>
      </div>

      <div class="role-popup-body">
        <div class="role-popup-main">
          <div v-show="currentStep.value === 0" class="role-step-panel">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="userForm.nombre" type="text" placeholder="Nombre" />
            </div>

            <div class="form-group">
              <label>Primer apellido</label>
              <input v-model="userForm.primer_apellido" type="text" placeholder="Primer apellido" />
            </div>

            <div class="form-group">
              <label>Segundo apellido</label>
              <input v-model="userForm.segundo_apellido" type="text" placeholder="Segundo apellido" />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="userForm.telefono" type="text" placeholder="70000000" />
            </div>
              <div class="form-group">
                <label>Correo real de contacto</label>
                <input
                  v-model="userForm.correo_contacto"
                  type="email"
                  :readonly="isEditing || correoVerificado"
                  placeholder="usuario@gmail.com / usuario@hotmail.com / usuario@ucb.edu.bo"
                />
                <small>
                  A este correo se enviará el código de verificación y las credenciales de acceso.
                </small>
              </div>

              <div v-if="!isEditing" class="form-group">
                <button
                  v-wave
                  type="button"
                  class="secondary-btn"
                  :disabled="verificationLoading || verificationSent || correoVerificado"
                  @click="sendVerificationCode"
                >
                  {{ verificationSent ? 'Código enviado' : 'Enviar código' }}
                </button>
              </div>

              <div v-if="!isEditing && verificationSent" class="form-group">
                <label>Código de verificación</label>
                <input
                  v-model="userForm.codigo_verificacion"
                  type="text"
                  maxlength="6"
                  placeholder="123456"
                  :readonly="correoVerificado"
                />

                <button
                  v-wave
                  type="button"
                  class="secondary-btn"
                  :disabled="verificationLoading || correoVerificado"
                  @click="confirmVerificationCode"
                >
                  Verificar correo
                </button>
              </div>

              <p v-if="verificationMessage" class="success-message">
                {{ verificationMessage }}
              </p>

              <p v-if="verificationError" class="error-message">
                {{ verificationError }}
              </p>

              <div class="form-group">
                <label>Correo de autenticación generado</label>
                <input :value="effectiveEmail" type="text" readonly />
                <small v-if="!isEditing">
                  Internamente se resolverá duplicados. El correo final se enviará al correo de contacto una vez se cree el usuario.
                </small>
              </div>
          </div>

          <div v-show="currentStep.value === 1" class="role-step-panel">
            <div class="form-group">
              <label>Rol</label>
              <select v-model="userForm.rol_id_rol">
                <option value="">Seleccione un rol</option>
                <option v-for="role in roles" :key="role.id_rol" :value="role.id_rol">
                  {{ role.nombre }} ({{ role.id_rol }})
                </option>
              </select>
            </div>



            <label class="checkbox-row">
              <input v-model="userForm.enviarCredenciales" type="checkbox" />
              <span>Enviar credenciales al correo</span>
            </label>
          </div>

          <div v-show="currentStep.value === 2" class="role-step-panel">
            <div class="summary-list">
              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <UserRound :size="18" />
                  <span>Nombre</span>
                </div>
                <strong>{{ userForm.nombre || '-' }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <BadgeInfo :size="18" />
                  <span>Apellidos</span>
                </div>
                <strong>{{ userForm.primer_apellido }} {{ userForm.segundo_apellido || '' }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <Mail :size="18" />
                  <span>Correo de contacto</span>
                </div>
                <strong>{{ userForm.correo_contacto || '-' }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <Mail :size="18" />
                  <span>Correo de acceso</span>
                </div>
                <strong>{{ effectiveEmail || '-' }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <Phone :size="18" />
                  <span>Teléfono</span>
                </div>
                <strong>{{ userForm.telefono || '-' }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <ShieldCheck :size="18" />
                  <span>Rol</span>
                </div>
                <strong>{{ selectedRoleName }}</strong>
              </div>

              <div class="summary-item enhanced-summary-item" v-if="!isEditing">
                <div class="summary-item-left">
                  <KeyRound :size="18" />
                  <span>Credenciales por correo</span>
                </div>
                <strong>{{ userForm.enviarCredenciales ? 'Sí' : 'No' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="role-popup-summary">
          <div class="role-preview-card role-preview-card-enhanced">
            <div class="preview-top">
              <div>
                <h3>{{ userForm.nombre || 'Nuevo usuario' }}</h3>
                <p><strong>Rol:</strong> {{ selectedRoleName }}</p>
              </div>
              <Sparkles :size="22" />
            </div>

            <div class="preview-metrics">
              <div class="preview-metric">
                <span>Modo</span>
                <strong>{{ isEditing ? 'Edición' : 'Registro' }}</strong>
              </div>
              <div class="preview-metric">
                <span>Correo</span>
                <strong>{{ effectiveEmail ? 'Generado' : 'Pendiente' }}</strong>
              </div>
            </div>
          </div>

          <div class="summary-chips">
            <span class="summary-chip">
              <CheckCircle2 :size="14" />
              {{ selectedRoleName }}
            </span>
            <span class="summary-chip">
              <CheckCircle2 :size="14" />
              {{ effectiveEmail || 'Correo pendiente' }}
            </span>
          </div>
        </div>
      </div>

      <div class="role-popup-actions">
        <button v-wave type="button" class="secondary-btn" @click="closePopup">Cancelar</button>
        <button v-if="currentStep.value > 0" v-wave type="button" class="secondary-btn" @click="prevStep">
          Anterior
        </button>
        <button
          v-if="currentStep.value < 2"
          v-wave
          type="button"
          class="primary-btn"
          :disabled="!canGoNext"
          @click="nextStep"
        >
          Siguiente
        </button>
        <button
          v-else
          v-wave
          type="button"
          class="primary-btn"
          @click="saveUser"
        >
          {{ isEditing ? 'Guardar cambios' : 'Registrar usuario' }}
        </button>
      </div>
    </div>
  </div>
</template>