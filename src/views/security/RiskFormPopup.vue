<template>
  <div v-if="show" class="popup-overlay" @click.self="closePopup">
    <div v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 300 } }"
      class="popup-container">
      
      <div class="popup-header">
        <div class="popup-header-left">
          <div class="popup-icon">📊</div>
          <div>
            <h3>{{ isEditing ? 'Editar Riesgo' : 'Nuevo Riesgo' }}</h3>
            <p>Complete los datos del riesgo de seguridad</p>
          </div>
        </div>
        <button class="close-btn" @click="closePopup" title="Cerrar">✕</button>
      </div>

      <div class="popup-body">
        <div class="form-section">
          <h4>📋 Información del Riesgo</h4>

          <div class="form-group" :class="{ 'error': errors.activo }">
            <label>
              Activo de información *
              <span class="tooltip-icon" title="Seleccione el activo que está siendo evaluado">ⓘ</span>
            </label>
            <select v-model="form.activo_id_activo" @blur="validateActivo">
              <option value="">Seleccionar activo</option>
              <option v-for="activo in activos" :key="activo.id_activo" :value="activo.id_activo">
                {{ activo.nombre }}
              </option>
            </select>
            <span class="error-message" v-if="errors.activo">{{ errors.activo }}</span>
          </div>

          <div class="form-group" :class="{ 'error': errors.amenaza }">
            <label>
              Amenaza / Vulnerabilidad *
              <span class="tooltip-icon" title="Describa la amenaza o vulnerabilidad detectada">ⓘ</span>
            </label>
            <textarea 
              v-model="form.amenaza" 
              @blur="validateAmenaza"
              rows="3" 
              placeholder="Ej: Usurpación de identidad, Ataque de hacking..."
              :maxlength="200"
            ></textarea>
            <div class="char-counter">{{ form.amenaza.length }}/200</div>
            <span class="error-message" v-if="errors.amenaza">{{ errors.amenaza }}</span>
          </div>

          <div class="form-group" :class="{ 'error': errors.consecuencia }">
            <label>
              Consecuencia / Riesgo *
              <span class="tooltip-icon" title="Describa qué podría suceder si el riesgo se materializa">ⓘ</span>
            </label>
            <textarea 
              v-model="form.consecuencia" 
              @blur="validateConsecuencia"
              rows="3" 
              placeholder="Ej: Accesos no autorizados, Pérdida de datos..."
              :maxlength="300"
            ></textarea>
            <div class="char-counter">{{ form.consecuencia.length }}/300</div>
            <span class="error-message" v-if="errors.consecuencia">{{ errors.consecuencia }}</span>
          </div>

          <div class="form-row-2">
            <div class="form-group" :class="{ 'error': errors.probabilidad }">
              <label>Probabilidad (1-5) *</label>
              <div class="scale-input">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  v-model="form.probabilidad"
                  @input="validateProbabilidad"
                />
                <div class="scale-labels">
                  <span>1 - Muy Baja</span>
                  <span>2 - Baja</span>
                  <span>3 - Media</span>
                  <span>4 - Alta</span>
                  <span>5 - Muy Alta</span>
                </div>
                <select v-model="form.probabilidad" @blur="validateProbabilidad">
                  <option value="">Seleccionar</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <span class="error-message" v-if="errors.probabilidad">{{ errors.probabilidad }}</span>
            </div>

            <div class="form-group" :class="{ 'error': errors.impacto }">
              <label>Impacto (1-5) *</label>
              <div class="scale-input">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  v-model="form.impacto"
                  @input="validateImpacto"
                />
                <div class="scale-labels">
                  <span>1 - Muy Bajo</span>
                  <span>2 - Bajo</span>
                  <span>3 - Medio</span>
                  <span>4 - Alto</span>
                  <span>5 - Muy Alto</span>
                </div>
                <select v-model="form.impacto" @blur="validateImpacto">
                  <option value="">Seleccionar</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <span class="error-message" v-if="errors.impacto">{{ errors.impacto }}</span>
            </div>
          </div>

          <div class="preview-card" v-if="form.probabilidad && form.impacto">
            <div class="preview-icon">📈</div>
            <div class="preview-content">
              <div class="preview-row">
                <span>Riesgo Inherente (P × I):</span>
                <strong>{{ riesgoInherente }}</strong>
              </div>
              <div class="preview-row">
                <span>Nivel Inherente:</span>
                <span :class="`badge nivel-${nivelInherente.toLowerCase()}`">{{ nivelInherente }}</span>
              </div>
            </div>
          </div>

          <div class="form-group" :class="{ 'error': errors.tratamiento }">
            <label>
              Tratamiento del Riesgo *
              <span class="tooltip-icon" title="Seleccione cómo se tratará el riesgo">ⓘ</span>
            </label>
            <div class="treatment-options">
              <label v-for="t in tratamientos" :key="t.value" :class="{ active: form.tratamiento === t.value }">
                <input type="radio" v-model="form.tratamiento" :value="t.value" @change="validateTratamiento" />
                <div class="treatment-card">
                  <strong>{{ t.label }}</strong>
                  <small>{{ t.desc }}</small>
                </div>
              </label>
            </div>
            <span class="error-message" v-if="errors.tratamiento">{{ errors.tratamiento }}</span>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button class="secondary-btn" @click="closePopup">Cancelar</button>
        <button class="primary-btn" @click="saveRisk" :disabled="!isValid">
          {{ isEditing ? 'Guardar cambios' : 'Crear riesgo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref, onMounted } from 'vue'
import { createRiesgo, updateRiesgo } from '@/services/riesgo.service'
import { getActivos } from '@/services/activo.service'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  riskData: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'save'])

const activos = ref([])

const tratamientos = [
  { value: 'Evitar', label: 'Evitar', desc: 'Eliminar la actividad que genera el riesgo' },
  { value: 'Reducir', label: 'Reducir', desc: 'Disminuir probabilidad o impacto' },
  { value: 'Compartir', label: 'Compartir', desc: 'Transferir el riesgo a un tercero' },
  { value: 'Aceptar', label: 'Aceptar', desc: 'Asumir el riesgo conscientemente' }
]

const errors = reactive({
  activo: '',
  amenaza: '',
  consecuencia: '',
  probabilidad: '',
  impacto: '',
  tratamiento: ''
})

const validateActivo = () => {
  if (!form.activo_id_activo) {
    errors.activo = 'Debe seleccionar un activo'
    return false
  }
  errors.activo = ''
  return true
}

const validateAmenaza = () => {
  if (!form.amenaza.trim()) {
    errors.amenaza = 'La amenaza es obligatoria'
    return false
  }
  if (form.amenaza.length < 5) {
    errors.amenaza = 'La amenaza debe tener al menos 5 caracteres'
    return false
  }
  errors.amenaza = ''
  return true
}

const validateConsecuencia = () => {
  if (!form.consecuencia.trim()) {
    errors.consecuencia = 'La consecuencia es obligatoria'
    return false
  }
  if (form.consecuencia.length < 10) {
    errors.consecuencia = 'La consecuencia debe tener al menos 10 caracteres'
    return false
  }
  errors.consecuencia = ''
  return true
}

const validateProbabilidad = () => {
  if (!form.probabilidad) {
    errors.probabilidad = 'Seleccione una probabilidad'
    return false
  }
  errors.probabilidad = ''
  return true
}

const validateImpacto = () => {
  if (!form.impacto) {
    errors.impacto = 'Seleccione un impacto'
    return false
  }
  errors.impacto = ''
  return true
}

const validateTratamiento = () => {
  if (!form.tratamiento) {
    errors.tratamiento = 'Seleccione un tratamiento'
    return false
  }
  errors.tratamiento = ''
  return true
}

const calcularNivel = (valor) => {
  if (!valor) return ''
  if (valor >= 1 && valor <= 4) return 'Bajo'
  if (valor >= 5 && valor <= 9) return 'Moderado'
  if (valor >= 10 && valor <= 16) return 'Alto'
  if (valor >= 17 && valor <= 25) return 'Extremo'
  return ''
}

const riesgoInherente = computed(() => {
  if (form.probabilidad && form.impacto) {
    return form.probabilidad * form.impacto
  }
  return ''
})

const nivelInherente = computed(() => {
  const valor = riesgoInherente.value
  if (valor) return calcularNivel(valor)
  return ''
})

const isValid = computed(() => {
  return validateActivo() &&
         validateAmenaza() &&
         validateConsecuencia() &&
         validateProbabilidad() &&
         validateImpacto() &&
         validateTratamiento()
})

const form = reactive({
  id_riesgo: null,
  activo_id_activo: '',
  amenaza: '',
  consecuencia: '',
  probabilidad: '',
  impacto: '',
  tratamiento: ''
})

const resetForm = () => {
  form.id_riesgo = null
  form.activo_id_activo = ''
  form.amenaza = ''
  form.consecuencia = ''
  form.probabilidad = ''
  form.impacto = ''
  form.tratamiento = ''
  Object.keys(errors).forEach(key => errors[key] = '')
}

const loadRiskData = () => {
  if (props.riskData) {
    form.id_riesgo = props.riskData.id_riesgo
    form.activo_id_activo = props.riskData.activo_id_activo || ''
    form.amenaza = props.riskData.amenaza || ''
    form.consecuencia = props.riskData.consecuencia || ''
    form.probabilidad = props.riskData.probabilidad || ''
    form.impacto = props.riskData.impacto || ''
    form.tratamiento = props.riskData.tratamiento || ''
  } else {
    resetForm()
  }
}

const loadActivos = async () => {
  try {
    const data = await getActivos()
    activos.value = data || []
  } catch (error) {
    console.error('Error cargando activos:', error)
  }
}

watch(() => props.show, (value) => {
  if (value) {
    loadRiskData()
    loadActivos()
  }
})

const closePopup = () => {
  emit('close')
}

const saveRisk = async () => {
  if (!isValid.value) {
    Swal.fire('Error', 'Por favor complete todos los campos correctamente', 'warning')
    return
  }

  const payload = {
    activo_id_activo: form.activo_id_activo,
    amenaza: form.amenaza.trim(),
    consecuencia: form.consecuencia.trim(),
    probabilidad: parseInt(form.probabilidad),
    impacto: parseInt(form.impacto),
    riesgo_inherente: riesgoInherente.value,
    nivel_inherente: nivelInherente.value,
    tratamiento: form.tratamiento
  }

  try {
    if (props.isEditing && form.id_riesgo) {
      await updateRiesgo(form.id_riesgo, payload)
      Swal.fire('Actualizado', 'Riesgo actualizado correctamente', 'success')
    } else {
      await createRiesgo(payload)
      Swal.fire('Creado', 'Riesgo creado correctamente', 'success')
    }
    emit('save')
    closePopup()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.detail || 'No se pudo guardar el riesgo', 'error')
  }
}

onMounted(() => {
  loadActivos()
})
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-container {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

/* Cabecera - ocupa todo el ancho */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #192847, #1f3156);
  color: white;
  border-radius: 28px 28px 0 0;
  width: 100%;
  box-sizing: border-box;
}

.popup-header-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.popup-icon {
  background: rgba(255,255,255,0.2);
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.popup-header h3 {
  margin: 0;
  font-size: 22px;
}

.popup-header p {
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.8;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

/* Cuerpo - ocupa todo el ancho SIN MÁRGENES LATERALES GRANDES */
.popup-body {
  padding: 32px 32px;
  width: 100%;
  box-sizing: border-box;
}

.form-section {
  margin-bottom: 32px;
  width: 100%;
}

.form-section h4 {
  color: #192847;
  margin-bottom: 24px;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

/* Cada campo ocupa el 100% del ancho disponible */
.form-group {
  margin-bottom: 24px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #192847;
  box-shadow: 0 0 0 3px rgba(25,40,71,0.1);
}

.form-group.error input,
.form-group.error select,
.form-group.error textarea {
  border-color: #dc3545;
  background: #fff5f5;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
}

.char-counter {
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

.tooltip-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: #e0e0e0;
  color: #666;
  border-radius: 50%;
  font-size: 11px;
  text-align: center;
  line-height: 18px;
  margin-left: 8px;
  cursor: help;
}

/* Fila de 2 columnas - ocupan el ancho completo con gap proporcionado */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 8px;
  width: 100%;
}

/* Escala deslizante */
.scale-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scale-input input[type="range"] {
  width: 100%;
  padding: 0;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  font-size: 11px;
  color: #666;
}

.scale-labels span {
  flex: 1;
  text-align: center;
}

/* Opciones de tratamiento - 2 columnas ocupan todo el ancho */
.treatment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 8px;
  width: 100%;
}

.treatment-options label {
  margin: 0;
  cursor: pointer;
  width: 100%;
}

.treatment-options input {
  display: none;
}

.treatment-card {
  display: block;
  padding: 18px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.treatment-card strong {
  display: block;
  font-size: 16px;
  margin-bottom: 8px;
}

.treatment-card small {
  display: block;
  font-size: 11px;
  color: #999;
}

.treatment-options input:checked + .treatment-card,
.treatment-options label.active .treatment-card {
  border-color: #192847;
  background: #e8edf5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Preview card - ocupa todo el ancho */
.preview-card {
  background: linear-gradient(135deg, #e8edf5, #dce3ed);
  border-radius: 20px;
  padding: 24px 32px;
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

.preview-icon {
  font-size: 40px;
}

.preview-content {
  flex: 1;
  display: flex;
  justify-content: space-around;
  gap: 40px;
}

.preview-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-row span {
  font-size: 12px;
  color: #666;
}

.preview-row strong {
  font-size: 28px;
  font-weight: bold;
  color: #192847;
}

/* Badges */
.badge {
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
}

.nivel-bajo { background: #d4edda; color: #155724; }
.nivel-moderado { background: #fff3cd; color: #856404; }
.nivel-alto { background: #f8d7da; color: #721c24; }
.nivel-extremo { background: #721c24; color: white; }

/* Footer */
.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  border-radius: 0 0 28px 28px;
  width: 100%;
  box-sizing: border-box;
}

.primary-btn {
  background: linear-gradient(135deg, #192847, #1f3156);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #D48600, #e6a300);
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-btn {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 12px 32px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.secondary-btn:hover {
  background: #ccc;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .treatment-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .preview-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .popup-container {
    max-width: 95%;
    width: 95%;
  }
  
  .popup-body {
    padding: 24px 20px;
  }
}
</style>