<template>
  <div v-if="show" class="popup-overlay" @click.self="closePopup">
    <div v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 300 } }"
      class="popup-container">
      
      <div class="popup-header">
        <div class="popup-header-left">
          <div class="popup-icon">🛡️</div>
          <div>
            <h3>{{ isEditing ? 'Editar Mitigación' : 'Nueva Mitigación' }}</h3>
            <p>Riesgo: {{ riesgoNombre || 'Seleccione un riesgo' }}</p>
          </div>
        </div>
        <button class="close-btn" @click="closePopup" title="Cerrar">✕</button>
      </div>

      <div class="popup-body">

        <div class="form-section">
          <h4>📝 Control Implementado</h4>

          <div class="form-group" :class="{ 'error': errors.control }">
            <label>
              Control / Mitigación *
              <span class="tooltip-icon" title="Describa la medida de control implementada">ⓘ</span>
            </label>
            <textarea 
              v-model="form.control_implementado" 
              @blur="validateControl"
              rows="3" 
              placeholder="Ej: Implementar autenticación de dos factores, Cifrado de datos sensibles..."
              :maxlength="300"
            ></textarea>
            <div class="char-counter">{{ form.control_implementado.length }}/300</div>
            <span class="error-message" v-if="errors.control">{{ errors.control }}</span>
          </div>

          <div class="form-row-3">
            
            <div class="form-group" :class="{ 'error': errors.tipo }">
              <label>
                Tipo de Control *
                <span class="tooltip-icon" title="P: Preventivo, D: Detectivo, C: Correctivo, Di: Disuasivo">ⓘ</span>
              </label>
              <div class="tipo-options">
                <label :class="{ active: form.tipo === 'P' }">
                  <input type="radio" v-model="form.tipo" value="P" @change="validateTipo" />
                  <span class="tipo-card">
                    <strong>P</strong>
                    <small>Preventivo</small>
                  </span>
                </label>
                <label :class="{ active: form.tipo === 'D' }">
                  <input type="radio" v-model="form.tipo" value="D" @change="validateTipo" />
                  <span class="tipo-card">
                    <strong>D</strong>
                    <small>Detectivo</small>
                  </span>
                </label>
                <label :class="{ active: form.tipo === 'C' }">
                  <input type="radio" v-model="form.tipo" value="C" @change="validateTipo" />
                  <span class="tipo-card">
                    <strong>C</strong>
                    <small>Correctivo</small>
                  </span>
                </label>
                <label :class="{ active: form.tipo === 'Di' }">
                  <input type="radio" v-model="form.tipo" value="Di" @change="validateTipo" />
                  <span class="tipo-card">
                    <strong>Di</strong>
                    <small>Disuasivo</small>
                  </span>
                </label>
              </div>
              <span class="error-message" v-if="errors.tipo">{{ errors.tipo }}</span>
            </div>

            <div class="form-group" :class="{ 'error': errors.nivel }">
              <label>
                Nivel (A, S, M) *
                <span class="tooltip-icon" title="A: Automático, S: Semiautomático, M: Manual">ⓘ</span>
              </label>
              <div class="nivel-options">
                <label :class="{ active: form.nivel === 'A' }">
                  <input type="radio" v-model="form.nivel" value="A" @change="validateNivel" />
                  <span class="nivel-card">
                    <strong>A</strong>
                    <small>Automático</small>
                  </span>
                </label>
                <label :class="{ active: form.nivel === 'S' }">
                  <input type="radio" v-model="form.nivel" value="S" @change="validateNivel" />
                  <span class="nivel-card">
                    <strong>S</strong>
                    <small>Semiauto</small>
                  </span>
                </label>
                <label :class="{ active: form.nivel === 'M' }">
                  <input type="radio" v-model="form.nivel" value="M" @change="validateNivel" />
                  <span class="nivel-card">
                    <strong>M</strong>
                    <small>Manual</small>
                  </span>
                </label>
              </div>
              <span class="error-message" v-if="errors.nivel">{{ errors.nivel }}</span>
            </div>

            <div class="form-group" :class="{ 'error': errors.frecuencia }">
              <label>
                Frecuencia
                <span class="tooltip-icon" title="D: Diario, S: Semanal, M: Mensual, A: Anual, PT: Por Transacción">ⓘ</span>
              </label>
              <select v-model="form.frecuencia" @blur="validateFrecuencia">
                <option value="">Seleccionar</option>
                <option value="D">Diario (D)</option>
                <option value="S">Semanal (S)</option>
                <option value="M">Mensual (M)</option>
                <option value="A">Anual (A)</option>
                <option value="PT">Por Transacción (PT)</option>
              </select>
              <span class="error-message" v-if="errors.frecuencia">{{ errors.frecuencia }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>📊 Evaluación del Riesgo Residual</h4>

          <div class="form-row-2">
            <div class="form-group" :class="{ 'error': errors.probabilidad_residual }">
              <label>Probabilidad Residual (1-5) *</label>
              <div class="scale-input">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  v-model="form.probabilidad_residual"
                  @input="validateProbabilidadResidual"
                />
                <div class="scale-labels">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
                <select v-model="form.probabilidad_residual" @blur="validateProbabilidadResidual">
                  <option value="">Seleccionar</option>
                  <option v-for="n in 5" :key="n" :value="n">
                    {{ n }} - {{ ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'][n-1] }}
                  </option>
                </select>
              </div>
              <span class="error-message" v-if="errors.probabilidad_residual">{{ errors.probabilidad_residual }}</span>
            </div>

            <div class="form-group" :class="{ 'error': errors.impacto_residual }">
              <label>Impacto Residual (1-5) *</label>
              <div class="scale-input">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  v-model="form.impacto_residual"
                  @input="validateImpactoResidual"
                />
                <div class="scale-labels">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
                <select v-model="form.impacto_residual" @blur="validateImpactoResidual">
                  <option value="">Seleccionar</option>
                  <option v-for="n in 5" :key="n" :value="n">
                    {{ n }} - {{ ['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'][n-1] }}
                  </option>
                </select>
              </div>
              <span class="error-message" v-if="errors.impacto_residual">{{ errors.impacto_residual }}</span>
            </div>
          </div>

          <div class="preview-card" v-if="form.probabilidad_residual && form.impacto_residual">
            <div class="preview-icon">📉</div>
            <div class="preview-content">
              <div class="preview-row">
                <span>Riesgo Residual (P × I):</span>
                <strong>{{ riesgoResidual }}</strong>
              </div>
              <div class="preview-row">
                <span>Nivel Residual:</span>
                <span :class="`badge nivel-${nivelResidual.toLowerCase()}`">{{ nivelResidual }}</span>
              </div>
            </div>
          </div>

          <div class="info-card" v-if="riesgoOriginal">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <strong>Riesgo original:</strong>
              <span>Probabilidad {{ riesgoOriginal.probabilidad }} × Impacto {{ riesgoOriginal.impacto }} = {{ riesgoOriginal.riesgo_inherente }} ({{ riesgoOriginal.nivel_inherente }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button class="secondary-btn" @click="closePopup">Cancelar</button>
        <button class="primary-btn" @click="saveMitigacion" :disabled="!isValid">
          {{ isEditing ? 'Guardar cambios' : 'Agregar mitigación' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { createMitigacion, updateMitigacion } from '@/services/mitigacion.service'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  mitigacionData: Object,
  riesgoId: Number,
  riesgoNombre: String,
  riesgoOriginal: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'save'])

const errors = reactive({
  control: '',
  tipo: '',
  nivel: '',
  frecuencia: '',
  probabilidad_residual: '',
  impacto_residual: ''
})

const validateControl = () => {
  if (!form.control_implementado.trim()) {
    errors.control = 'El control implementado es obligatorio'
    return false
  }
  if (form.control_implementado.length < 10) {
    errors.control = 'Describa el control con al menos 10 caracteres'
    return false
  }
  errors.control = ''
  return true
}

const validateTipo = () => {
  if (!form.tipo) {
    errors.tipo = 'Seleccione el tipo de control'
    return false
  }
  errors.tipo = ''
  return true
}

const validateNivel = () => {
  if (!form.nivel) {
    errors.nivel = 'Seleccione el nivel del control'
    return false
  }
  errors.nivel = ''
  return true
}

const validateFrecuencia = () => {
  errors.frecuencia = ''
  return true
}

const validateProbabilidadResidual = () => {
  if (!form.probabilidad_residual) {
    errors.probabilidad_residual = 'Seleccione la probabilidad'
    return false
  }
  errors.probabilidad_residual = ''
  return true
}

const validateImpactoResidual = () => {
  if (!form.impacto_residual) {
    errors.impacto_residual = 'Seleccione el impacto'
    return false
  }
  errors.impacto_residual = ''
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

const riesgoResidual = computed(() => {
  if (form.probabilidad_residual && form.impacto_residual) {
    return form.probabilidad_residual * form.impacto_residual
  }
  return ''
})

const nivelResidual = computed(() => {
  const valor = riesgoResidual.value
  if (valor) return calcularNivel(valor)
  return ''
})

const isValid = computed(() => {
  return validateControl() &&
         validateTipo() &&
         validateNivel() &&
         validateProbabilidadResidual() &&
         validateImpactoResidual()
})

const form = reactive({
  id_mitigacion: null,
  riesgo_id_riesgo: null,
  control_implementado: '',
  tipo: '',
  nivel: '',
  frecuencia: '',
  probabilidad_residual: '',
  impacto_residual: ''
})

const resetForm = () => {
  form.id_mitigacion = null
  form.riesgo_id_riesgo = props.riesgoId || null
  form.control_implementado = ''
  form.tipo = ''
  form.nivel = ''
  form.frecuencia = ''
  form.probabilidad_residual = ''
  form.impacto_residual = ''
  Object.keys(errors).forEach(key => errors[key] = '')
}

const loadMitigacionData = () => {
  if (props.mitigacionData) {
    form.id_mitigacion = props.mitigacionData.id_mitigacion
    form.riesgo_id_riesgo = props.mitigacionData.riesgo_id_riesgo
    form.control_implementado = props.mitigacionData.control_implementado || ''
    form.tipo = props.mitigacionData.tipo || ''
    form.nivel = props.mitigacionData.nivel || ''
    form.frecuencia = props.mitigacionData.frecuencia || ''
    form.probabilidad_residual = props.mitigacionData.probabilidad_residual || ''
    form.impacto_residual = props.mitigacionData.impacto_residual || ''
  } else {
    resetForm()
  }
}

// AQUÍ ESTÁ LA MAGIA QUE SOLUCIONA EL ERROR
watch(() => props.show, (value) => {
  if (value) {
    loadMitigacionData()
  }
}, { immediate: true }) // <-- Obliga al watch a ejecutarse apenas nazca el componente

const closePopup = () => {
  emit('close')
}

const saveMitigacion = async () => {
  if (!isValid.value) {
    Swal.fire('Error', 'Por favor complete todos los campos correctamente', 'warning')
    return
  }

  const payload = {
    riesgo_id_riesgo: form.riesgo_id_riesgo, // Ahora esto sí tendrá el ID correcto
    control_implementado: form.control_implementado.trim(),
    tipo: form.tipo,
    nivel: form.nivel,
    frecuencia: form.frecuencia || null,
    probabilidad_residual: parseInt(form.probabilidad_residual),
    impacto_residual: parseInt(form.impacto_residual),
    riesgo_residual: riesgoResidual.value,
    nivel_residual: nivelResidual.value
  }

  try {
    if (props.isEditing && form.id_mitigacion) {
      await updateMitigacion(form.id_mitigacion, payload)
      Swal.fire('Actualizado', 'Mitigación actualizada correctamente', 'success')
    } else {
      await createMitigacion(payload)
      Swal.fire('Creada', 'Mitigación agregada correctamente', 'success')
    }
    emit('save')
    closePopup()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.detail || 'No se pudo guardar la mitigación', 'error')
  }
}
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

.popup-header h3 { margin: 0; font-size: 22px; }
.popup-header p { margin: 6px 0 0; font-size: 13px; opacity: 0.8; }

.close-btn {
  background: none; border: none; font-size: 24px; cursor: pointer; color: white; width: 40px; height: 40px; border-radius: 20px; transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.2); }

.popup-body {
  padding: 32px;
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

.form-group {
  margin-bottom: 24px;
  width: 100%;
  /* Soluciona el error visual donde el texto de error salía en línea */
  display: block; 
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
  display: block; /* Asegura que el error baje a la siguiente línea */
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
  font-weight: 600;
}

.char-counter {
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

.tooltip-icon {
  display: inline-block; width: 18px; height: 18px; background: #e0e0e0; color: #666; border-radius: 50%; font-size: 11px; text-align: center; line-height: 18px; margin-left: 8px; cursor: help;
}

.form-row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 8px;
  width: 100%;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 8px;
  width: 100%;
}

/* Opciones distribuidas en Grid */
.tipo-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

.nivel-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.tipo-options label,
.nivel-options label {
  margin: 0;
  cursor: pointer;
}

.tipo-options input,
.nivel-options input {
  display: none;
}

.tipo-card,
.nivel-card {
  display: block;
  padding: 14px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  background: white;
}

.tipo-card strong,
.nivel-card strong {
  display: block;
  font-size: 18px;
  margin-bottom: 4px;
}

.tipo-card small,
.nivel-card small {
  display: block;
  font-size: 11px;
  color: #777;
}

.tipo-options input:checked + .tipo-card,
.nivel-options input:checked + .nivel-card {
  border-color: #192847;
  background: #e8edf5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

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

.info-card {
  background: #fff8e1;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #ffc107;
  width: 100%;
  box-sizing: border-box;
}

.info-icon {
  font-size: 24px;
}

.info-content {
  flex: 1;
}

.info-content strong {
  display: block; font-size: 12px; color: #856404; margin-bottom: 6px;
}

.info-content span {
  font-size: 13px; color: #333;
}

.badge {
  padding: 6px 16px; border-radius: 30px; font-size: 13px; font-weight: 600;
}

.nivel-bajo { background: #d4edda; color: #155724; }
.nivel-moderado { background: #fff3cd; color: #856404; }
.nivel-alto { background: #f8d7da; color: #721c24; }
.nivel-extremo { background: #721c24; color: white; }

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
  color: white; border: none; padding: 12px 32px; border-radius: 40px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;
}
.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #D48600, #e6a300); transform: translateY(-2px);
}
.primary-btn:disabled {
  opacity: 0.5; cursor: not-allowed;
}

.secondary-btn {
  background: #e0e0e0; color: #333; border: none; padding: 12px 32px; border-radius: 40px; cursor: pointer; font-weight: 600; font-size: 14px;
}
.secondary-btn:hover { background: #ccc; }

@media (max-width: 1100px) {
  .form-row-3 {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 900px) {
  .form-row-2 {
    grid-template-columns: 1fr;
    gap: 16px;
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