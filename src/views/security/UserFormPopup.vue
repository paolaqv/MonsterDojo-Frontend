<script setup>
import { computed, reactive, watch } from 'vue'
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-vue-next'

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
  correo: '',
  telefono: '',
  password: '',
  pregunta_seguridad: 'temporal',
  respuesta_seguridad: 'temporal',
  rol_id_rol: '',
  enviarCredenciales: true,
})

const resetForm = () => {
  userForm.id = ''
  userForm.nombre = ''
  userForm.correo = ''
  userForm.telefono = ''
  userForm.password = ''
  userForm.pregunta_seguridad = 'temporal'
  userForm.respuesta_seguridad = 'temporal'
  userForm.rol_id_rol = ''
  userForm.enviarCredenciales = true
  currentStep.value = 0
}

const applyUserData = () => {
  if (!props.userData) {
    resetForm()
    return
  }

  userForm.id = props.userData.id_usuario || ''
  userForm.nombre = props.userData.nombre || ''
  userForm.correo = props.userData.correo || ''
  userForm.telefono = props.userData.telefono ?? ''
  userForm.password = ''
  userForm.pregunta_seguridad =
  userForm.pregunta_seguridad = 'temporal'
  userForm.respuesta_seguridad = 'temporal'
  userForm.rol_id_rol = props.userData.rol_id_rol || ''
  userForm.enviarCredenciales = true
  currentStep.value = 0
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

const selectedRoleName = computed(() => {
  const role = props.roles.find((r) => r.id_rol === userForm.rol_id_rol)
  return role?.nombre || 'Sin rol'
})

const canGoNext = computed(() => {
  if (currentStep.value === 0) {
    return (
      userForm.nombre.trim() !== '' &&
      userForm.correo.trim() !== '' &&
      String(userForm.telefono).trim() !== ''
    )
  }

  if (currentStep.value === 1) {
    if (props.isEditing) {
      return userForm.rol_id_rol.trim() !== ''
    }

    return (
      userForm.rol_id_rol.trim() !== '' &&
      userForm.password.trim() !== ''
    )
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
            <p>Completa datos, credenciales y rol del usuario.</p>
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
              <input v-model="userForm.nombre" type="text" placeholder="Nombre completo" />
            </div>

            <div class="form-group">
              <label>Correo</label>
              <input v-model="userForm.correo" type="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="userForm.telefono" type="text" placeholder="70000000" />
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

            <template v-if="!isEditing">
              <div class="form-group">
                <label>Contraseña temporal</label>
                <input v-model="userForm.password" type="text" placeholder="Contraseña inicial" />
              </div>
            </template>

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
                  <Mail :size="18" />
                  <span>Correo</span>
                </div>
                <strong>{{ userForm.correo || '-' }}</strong>
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
                <span>Envío correo</span>
                <strong>{{ userForm.enviarCredenciales ? 'Sí' : 'No' }}</strong>
              </div>
            </div>
          </div>

          <div class="summary-chips">
            <span class="summary-chip">
              <CheckCircle2 :size="14" />
              {{ userForm.correo || 'Correo pendiente' }}
            </span>
            <span class="summary-chip">
              <CheckCircle2 :size="14" />
              {{ selectedRoleName }}
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
