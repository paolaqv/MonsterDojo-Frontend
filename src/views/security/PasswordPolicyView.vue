<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
import { getPasswordPolicy, updatePasswordPolicy } from '@/services/passwordPolicy.service'
import {
  ShieldCheck,
  KeyRound,
  Clock3,
  RefreshCcw,
  LockKeyhole,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Hash,
  TimerReset,
} from 'lucide-vue-next'

const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const errorMessage = ref('')

const currentStep = reactive({ value: 0 })

const policy = reactive({
  longitud_minima: 8,
  dias_expiracion: 90,
  periodo_no_reutilizacion_meses: 6,
  requiere_mayusculas: true,
  requiere_minusculas: true,
  requiere_numeros: true,
  requiere_simbolos: true,
  max_intentos_login: 3,
})

const originalPolicy = ref(null)

const complexityOptions = computed(() => [
  {
    key: 'requiere_mayusculas',
    title: 'Mayúsculas',
    description: 'La contraseña debe incluir al menos una letra mayúscula.',
    icon: KeyRound,
  },
  {
    key: 'requiere_minusculas',
    title: 'Minúsculas',
    description: 'La contraseña debe incluir al menos una letra minúscula.',
    icon: LockKeyhole,
  },
  {
    key: 'requiere_numeros',
    title: 'Números',
    description: 'La contraseña debe contener al menos un número.',
    icon: Hash,
  },
  {
    key: 'requiere_simbolos',
    title: 'Símbolos especiales',
    description: 'La contraseña debe incluir símbolos especiales.',
    icon: ShieldAlert,
  },
])

const selectedComplexities = computed(() =>
  complexityOptions.value
    .filter((item) => policy[item.key])
    .map((item) => item.title)
)

const summaryCards = computed(() => [
  {
    title: 'Longitud mínima',
    value: `${policy.longitud_minima} caracteres`,
    icon: KeyRound,
  },
  {
    title: 'Expiración',
    value: `${policy.dias_expiracion} días`,
    icon: Clock3,
  },
  {
    title: 'No reutilización',
    value: `${policy.periodo_no_reutilizacion_meses} meses`,
    icon: RefreshCcw,
  },
  {
    title: 'Máx. intentos',
    value: `${policy.max_intentos_login}`,
    icon: AlertTriangle,
  },
])

const selectedRules = computed(() => {
  const rules = [
    `Longitud mínima: ${policy.longitud_minima}`,
    `Expiración: ${policy.dias_expiracion} días`,
    `No reutilización: ${policy.periodo_no_reutilizacion_meses} meses`,
    `Intentos máximos: ${policy.max_intentos_login}`,
  ]

  selectedComplexities.value.forEach((item) => {
    rules.push(`Complejidad: ${item}`)
  })

  return rules
})

const canGoNext = computed(() => {
  if (currentStep.value === 0) {
    return (
      Number(policy.longitud_minima) >= 8 &&
      Number(policy.dias_expiracion) >= 1 &&
      Number(policy.periodo_no_reutilizacion_meses) >= 1
    )
  }

  if (currentStep.value === 1) {
    return (
      policy.requiere_mayusculas ||
      policy.requiere_minusculas ||
      policy.requiere_numeros ||
      policy.requiere_simbolos
    )
  }

  if (currentStep.value === 2) {
    return Number(policy.max_intentos_login) >= 3
  }

  return true
})

const loadPolicy = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await getPasswordPolicy()

    policy.longitud_minima = data.longitud_minima
    policy.dias_expiracion = data.dias_expiracion
    policy.periodo_no_reutilizacion_meses = data.periodo_no_reutilizacion_meses
    policy.requiere_mayusculas = data.requiere_mayusculas
    policy.requiere_minusculas = data.requiere_minusculas
    policy.requiere_numeros = data.requiere_numeros
    policy.requiere_simbolos = data.requiere_simbolos
    policy.max_intentos_login = data.max_intentos_login

    originalPolicy.value = JSON.parse(JSON.stringify(policy))
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudo cargar la política de contraseñas.'
  } finally {
    loading.value = false
  }
}

const enableEditing = () => {
  editing.value = true
  currentStep.value = 0
}

const cancelEditing = () => {
  editing.value = false
  currentStep.value = 0
  errorMessage.value = ''

  if (originalPolicy.value) {
    Object.assign(policy, JSON.parse(JSON.stringify(originalPolicy.value)))
  }
}

const selectStep = (step) => {
  if (!editing.value) return
  currentStep.value = step
}

const nextStep = () => {
  if (!canGoNext.value) return
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const saveChanges = async () => {
  try {
    saving.value = true
    errorMessage.value = ''

    const payload = {
      longitud_minima: Number(policy.longitud_minima),
      dias_expiracion: Number(policy.dias_expiracion),
      periodo_no_reutilizacion_meses: Number(policy.periodo_no_reutilizacion_meses),
      requiere_mayusculas: !!policy.requiere_mayusculas,
      requiere_minusculas: !!policy.requiere_minusculas,
      requiere_numeros: !!policy.requiere_numeros,
      requiere_simbolos: !!policy.requiere_simbolos,
      max_intentos_login: Number(policy.max_intentos_login),
    }

    const data = await updatePasswordPolicy(payload)

    policy.longitud_minima = data.longitud_minima
    policy.dias_expiracion = data.dias_expiracion
    policy.periodo_no_reutilizacion_meses = data.periodo_no_reutilizacion_meses
    policy.requiere_mayusculas = data.requiere_mayusculas
    policy.requiere_minusculas = data.requiere_minusculas
    policy.requiere_numeros = data.requiere_numeros
    policy.requiere_simbolos = data.requiere_simbolos
    policy.max_intentos_login = data.max_intentos_login

    originalPolicy.value = JSON.parse(JSON.stringify(policy))
    editing.value = false
    currentStep.value = 0

    await Swal.fire({
      title: 'Política actualizada',
      text: 'Los cambios se guardaron correctamente. Los usuarios deberán actualizar su contraseña al volver a ingresar.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.detail || 'No se pudieron guardar los cambios.'
  } finally {
    saving.value = false
  }
}

onMounted(loadPolicy)
</script>

<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="password-policy-page">

      <div
        v-motion
        :initial="{ opacity: 0, y: 28, scale: 0.98 }"
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 350 } }"
        class="password-policy-shell"
      >
        <div class="password-policy-header">
          <div class="password-policy-title-wrap">
            <div class="password-policy-icon">
              <ShieldCheck :size="24" />
            </div>
            <div>
              <h2>Políticas de contraseña</h2>
              <p>Configura las reglas de autenticación del sistema mediante un flujo guiado y visual.</p>
            </div>
          </div>

          <div class="header-actions">
            <button
              v-if="!editing"
              v-wave
              class="primary-btn"
              type="button"
              @click="enableEditing"
            >
              Editar políticas
            </button>

            <button
              v-else
              v-wave
              class="secondary-btn"
              type="button"
              @click="cancelEditing"
            >
              Cancelar edición
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <Sparkles :size="18" />
          <span>Cargando política...</span>
        </div>

        <div v-else class="password-policy-body">
          <div class="password-policy-main">
<div class="policy-stepper">
  <div
    class="policy-step"
    :class="{ active: currentStep.value === 0, done: currentStep.value > 0 }"
    @click="selectStep(0)"
  >
    <span>1</span>
    <p>Vigencia</p>
  </div>

  <div class="policy-step-line" :class="{ active: currentStep.value > 0 }"></div>

  <div
    class="policy-step"
    :class="{ active: currentStep.value === 1, done: currentStep.value > 1 }"
    @click="selectStep(1)"
  >
    <span>2</span>
    <p>Complejidad</p>
  </div>

  <div class="policy-step-line" :class="{ active: currentStep.value > 1 }"></div>

  <div
    class="policy-step"
    :class="{ active: currentStep.value === 2 }"
    @click="selectStep(2)"
  >
    <span>3</span>
    <p>Acceso</p>
  </div>
</div>

            <div
              v-show="!editing || currentStep.value === 0"
              v-motion
              :initial="{ opacity: 0, x: -20 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 260 } }"
              class="policy-step-panel"
            >
              <h3 class="section-title">Longitud y vigencia</h3>

              <div class="policy-grid metrics-grid">
                <div v-wave class="metric-card">
                  <div class="metric-card-head">
                    <KeyRound :size="18" />
                    <h4>Longitud mínima</h4>
                  </div>
                  <p>Define el número mínimo de caracteres permitidos.</p>
                  <input v-model="policy.longitud_minima" type="number" min="8" :disabled="!editing" />
                </div>

                <div v-wave class="metric-card">
                  <div class="metric-card-head">
                    <Clock3 :size="18" />
                    <h4>Expiración</h4>
                  </div>
                  <p>Tiempo en días para solicitar el cambio de contraseña.</p>
                  <input v-model="policy.dias_expiracion" type="number" min="1" :disabled="!editing" />
                </div>

                <div v-wave class="metric-card">
                  <div class="metric-card-head">
                    <TimerReset :size="18" />
                    <h4>No reutilización</h4>
                  </div>
                  <p>Periodo en meses para impedir reutilización de contraseñas.</p>
                  <input
                    v-model="policy.periodo_no_reutilizacion_meses"
                    type="number"
                    min="1"
                    :disabled="!editing"
                  />
                </div>
              </div>
            </div>

            <div
              v-show="!editing || currentStep.value === 1"
              v-motion
              :initial="{ opacity: 0, x: 20 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 260 } }"
              class="policy-step-panel"
            >
              <h3 class="section-title">Complejidad de contraseña</h3>

              <div class="policy-grid complexity-grid">
                <div
                  v-for="item in complexityOptions"
                  :key="item.key"
                  v-wave
                  class="complexity-card"
                  :class="{ active: policy[item.key] }"
                >
                  <div class="complexity-card-head">
                    <component :is="item.icon" :size="18" />
                    <h4>{{ item.title }}</h4>
                  </div>

                  <p>{{ item.description }}</p>

                  <label class="checkbox-row">
                    <input v-model="policy[item.key]" type="checkbox" :disabled="!editing" />
                    <span>Activar regla</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              v-show="!editing || currentStep.value === 2"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 260 } }"
              class="policy-step-panel"
            >
              <h3 class="section-title">Control de acceso</h3>

              <div class="policy-grid access-grid">
                <div v-wave class="metric-card access-card active">
                  <div class="metric-card-head">
                    <AlertTriangle :size="18" />
                    <h4>Intentos máximos de login</h4>
                  </div>
                  <p>Controla cuántos intentos fallidos se permiten antes del bloqueo.</p>
                  <input v-model="policy.max_intentos_login" type="number" min="3" :disabled="!editing" />
                </div>

<div class="info-card">
  <div class="info-card-head">
    <ShieldAlert :size="18" />
    <h4>Comportamiento del sistema</h4>
  </div>

  <div class="info-list">
    <div class="info-list-item">
      <CheckCircle2 :size="16" />
      <span>Si queda un solo intento, se mostrará una advertencia.</span>
    </div>

    <div class="info-list-item">
      <CheckCircle2 :size="16" />
      <span>Si se excede el límite, la cuenta quedará bloqueada.</span>
    </div>

    <div class="info-list-item">
      <CheckCircle2 :size="16" />
      <span>Cuando la política cambie, se solicitará actualización de contraseña.</span>
    </div>
  </div>
</div>
              </div>
            </div>



            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div v-if="editing" class="policy-actions">
              <button
                v-if="currentStep.value > 0"
                v-wave
                type="button"
                class="secondary-btn"
                @click="prevStep"
              >
                Anterior
              </button>

              <button
                v-if="currentStep.value < 3"
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
                :disabled="saving"
                @click="saveChanges"
              >
                {{ saving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>

          <div class="password-policy-summary">
            <div class="preview-card">
              <div class="preview-top">
                <div>
                  <h3>Estado de política</h3>
                  <p><strong>Modo:</strong> {{ editing ? 'Edición' : 'Visualización' }}</p>
                </div>
                <Sparkles :size="22" />
              </div>

              <div class="preview-metrics">
                <div class="preview-metric">
                  <span>Reglas activas</span>
                  <strong>{{ selectedComplexities.length }}</strong>
                </div>
                <div class="preview-metric">
                  <span>Intentos máx.</span>
                  <strong>{{ policy.max_intentos_login }}</strong>
                </div>
              </div>
            </div>

            <div class="summary-chips">
              <span
                v-for="rule in selectedRules"
                :key="rule"
                class="summary-chip"
              >
                <CheckCircle2 :size="14" />
                {{ rule }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-policy-page {
  padding: 170px 24px 24px;
}

.password-policy-shell {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.password-policy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 24px;
}

.password-policy-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.password-policy-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #192847, #2d4a80);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(25, 40, 71, 0.2);
}

.password-policy-title-wrap h2 {
  margin: 0;
  color: #192847;
  font-size: 28px;
  font-weight: 800;
}

.password-policy-title-wrap p {
  margin: 6px 0 0;
  color: #556273;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #192847;
  font-weight: 700;
}

.password-policy-body {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr;
  gap: 24px;
}

.password-policy-main,
.password-policy-summary {
  min-width: 0;
}

.policy-stepper {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.policy-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 88px;
}

.policy-step span {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #d9e2ef;
  color: #192847;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.policy-step p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #5b6675;
}

.policy-step.active span,
.policy-step.done span {
  background: linear-gradient(135deg, #192847, #2d4a80);
  color: #fff;
}

.policy-step.active p,
.policy-step.done p {
  color: #192847;
}

.policy-step-line {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: #dfe6ee;
  margin: 0 8px;
}

.policy-step-line.active {
  background: linear-gradient(90deg, #192847, #2d4a80);
}

.policy-step-panel {
  margin-bottom: 22px;
}

.section-title {
  font-size: 20px;
  color: #192847;
  font-weight: 800;
  margin-bottom: 16px;
}

.policy-grid {
  display: grid;
  gap: 18px;
}

.metrics-grid {
  grid-template-columns: repeat(3, minmax(220px, 1fr));
}

.complexity-grid {
  grid-template-columns: repeat(2, minmax(250px, 1fr));
}

.access-grid {
  grid-template-columns: 1fr 1fr;
}

.metric-card,
.complexity-card,
.info-card {
  border-radius: 22px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #dbe4ee;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.metric-card.active,
.complexity-card.active,
.access-card.active {
  border-color: #284578;
  box-shadow: 0 12px 24px rgba(40, 69, 120, 0.12);
}

.metric-card-head,
.complexity-card-head,
.info-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #192847;
}

.metric-card-head h4,
.complexity-card-head h4,
.info-card-head h4 {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
}

.metric-card p,
.complexity-card p {
  margin: 0 0 14px;
  color: #5c6877;
  line-height: 1.45;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.info-list-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #5c6877;
  line-height: 1.45;
  word-break: break-word;
}

.info-list-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #192847;
}

.metric-card input {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: 1px solid #b9c7d3;
  padding: 0 16px;
  font-size: 16px;
  background: #ece8d8;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #192847;
}

.info-card ul {
  padding-left: 18px;
}

.summary-list {
  display: grid;
  gap: 14px;
}

.summary-item {
  background: #f8fafc;
  border: 1px solid #dbe4ee;
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.summary-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #192847;
  font-weight: 700;
}

.preview-card {
  background: linear-gradient(135deg, #192847, #2d4a80);
  color: #fff;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 18px 36px rgba(25, 40, 71, 0.22);
}

.preview-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.preview-top h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.preview-top p {
  margin: 6px 0 0;
  opacity: 0.92;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-metric {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px;
}

.preview-metric span {
  display: block;
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.preview-metric strong {
  font-size: 18px;
}

.summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: #eef4f9;
  color: #192847;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #d7e2ec;
}

.policy-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #192847, #2d4a80);
  color: #fff;
  box-shadow: 0 12px 24px rgba(25, 40, 71, 0.18);
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #e6edf4;
  color: #192847;
}

.error-message {
  color: #b3261e;
  font-weight: 700;
  margin-top: 8px;
}

@media (max-width: 1100px) {
  .password-policy-body {
    grid-template-columns: 1fr;
  }

  .metrics-grid,
  .complexity-grid,
  .access-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .password-policy-page {
    padding: 150px 16px 24px;
  }

  .password-policy-shell {
    padding: 18px;
  }

  .password-policy-header {
    flex-direction: column;
  }

  .policy-stepper {
    overflow-x: auto;
    padding-bottom: 8px;
  }
}
</style>