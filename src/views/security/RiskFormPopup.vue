<!-- src/views/security/RiskFormPopup.vue -->
<template>
  <div v-if="show" class="popup-overlay">
    <div class="popup-container">
      <div class="popup-header">
        <h3>{{ isEditing ? 'Editar Riesgo' : 'Nuevo Riesgo' }}</h3>
        <button class="close-btn" @click="closePopup">✕</button>
      </div>

      <div class="popup-body">
        <!-- Datos básicos -->
        <div class="form-section">
          <h4>Datos del Riesgo</h4>
          
          <div class="form-group">
            <label>Nombre del riesgo *</label>
            <input v-model="form.nombre" type="text" placeholder="Ej: Fuga de datos de clientes" />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="2" placeholder="Describe el riesgo..."></textarea>
          </div>

          <!-- 🆕 NUEVO: Activo de información -->
          <div class="form-group">
            <label>Activo de información</label>
            <input v-model="form.activo_informacion" type="text" placeholder="Ej: Base de datos de clientes, Servidor, Información financiera" />
          </div>

          <!-- 🆕 NUEVO: Amenaza / Vulnerabilidad -->
          <div class="form-group">
            <label>Amenaza / Vulnerabilidad</label>
            <textarea v-model="form.amenaza_vulnerabilidad" rows="2" placeholder="Ej: Ataque de hacking, Fallo humano, Desastre natural"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Probabilidad inherente</label>
              <select v-model="form.probabilidad_inherente">
                <option value="">Seleccionar</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div class="form-group">
              <label>Impacto inherente</label>
              <select v-model="form.impacto_inherente">
                <option value="">Seleccionar</option>
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nivel inherente</label>
              <input :value="nivelCalculado" type="text" disabled class="readonly-input" />
            </div>
          </div>
        </div>

        <!-- Controles existentes -->
        <div class="form-section">
          <h4>Controles existentes</h4>
          <div class="form-group">
            <textarea v-model="form.controles_existentes" rows="2" placeholder="¿Qué controles ya existen para mitigar este riesgo?"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Probabilidad residual</label>
              <select v-model="form.probabilidad_residual">
                <option value="">Seleccionar</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div class="form-group">
              <label>Impacto residual</label>
              <select v-model="form.impacto_residual">
                <option value="">Seleccionar</option>
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nivel residual</label>
              <input :value="nivelResidualCalculado" type="text" disabled class="readonly-input" />
            </div>
          </div>
        </div>

        <!-- Plan de mitigación -->
        <div class="form-section">
          <h4>Plan de mitigación</h4>
          <div class="form-group">
            <textarea v-model="form.plan_mitigacion" rows="2" placeholder="¿Qué acciones se tomarán para mitigar el riesgo?"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Responsable</label>
              <input v-model="form.responsable" type="text" placeholder="Nombre del responsable" />
            </div>
            <div class="form-group">
              <label>Fecha estimada</label>
              <input v-model="form.fecha_estimada" type="date" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.estado">
                <option value="Activo">Activo</option>
                <option value="Mitigado">Mitigado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button class="secondary-btn" @click="closePopup">Cancelar</button>
        <button class="primary-btn" @click="saveRisk" :disabled="!isValid">Guardar riesgo</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { createRiesgo, updateRiesgo } from '@/services/riskAnalysis.service'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  riskData: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'save'])

const nivelMap = {
  'Baja-Bajo': 'Bajo',
  'Baja-Medio': 'Bajo',
  'Baja-Alto': 'Medio',
  'Media-Bajo': 'Bajo',
  'Media-Medio': 'Medio',
  'Media-Alto': 'Alto',
  'Alta-Bajo': 'Medio',
  'Alta-Medio': 'Alto',
  'Alta-Alto': 'Crítico'
}

const calcularNivel = (prob, impacto) => {
  if (!prob || !impacto) return ''
  const key = `${prob}-${impacto}`
  return nivelMap[key] || 'Medio'
}

const form = reactive({
  id: null,
  nombre: '',
  descripcion: '',
  activo_informacion: '',           // 🆕 NUEVO
  amenaza_vulnerabilidad: '',       // 🆕 NUEVO
  probabilidad_inherente: '',
  impacto_inherente: '',
  controles_existentes: '',
  probabilidad_residual: '',
  impacto_residual: '',
  plan_mitigacion: '',
  responsable: '',
  fecha_estimada: '',
  estado: 'Activo'
})

const nivelCalculado = computed(() => 
  calcularNivel(form.probabilidad_inherente, form.impacto_inherente)
)

const nivelResidualCalculado = computed(() => 
  calcularNivel(form.probabilidad_residual, form.impacto_residual)
)

const isValid = computed(() => {
  return form.nombre.trim() !== '' &&
         form.probabilidad_inherente !== '' &&
         form.impacto_inherente !== ''
})

const resetForm = () => {
  form.id = null
  form.nombre = ''
  form.descripcion = ''
  form.activo_informacion = ''
  form.amenaza_vulnerabilidad = ''
  form.probabilidad_inherente = ''
  form.impacto_inherente = ''
  form.controles_existentes = ''
  form.probabilidad_residual = ''
  form.impacto_residual = ''
  form.plan_mitigacion = ''
  form.responsable = ''
  form.fecha_estimada = ''
  form.estado = 'Activo'
}

const loadRiskData = () => {
  if (props.riskData) {
    form.id = props.riskData.id
    form.nombre = props.riskData.nombre || ''
    form.descripcion = props.riskData.descripcion || ''
    form.activo_informacion = props.riskData.activo_informacion || ''
    form.amenaza_vulnerabilidad = props.riskData.amenaza_vulnerabilidad || ''
    form.probabilidad_inherente = props.riskData.probabilidad_inherente || ''
    form.impacto_inherente = props.riskData.impacto_inherente || ''
    form.controles_existentes = props.riskData.controles_existentes || ''
    form.probabilidad_residual = props.riskData.probabilidad_residual || ''
    form.impacto_residual = props.riskData.impacto_residual || ''
    form.plan_mitigacion = props.riskData.plan_mitigacion || ''
    form.responsable = props.riskData.responsable || ''
    form.fecha_estimada = props.riskData.fecha_estimada || ''
    form.estado = props.riskData.estado || 'Activo'
  } else {
    resetForm()
  }
}

watch(() => props.show, (value) => {
  if (value) loadRiskData()
})

const closePopup = () => {
  emit('close')
}

const saveRisk = async () => {
  if (!isValid.value) return

  const payload = {
    nombre: form.nombre,
    descripcion: form.descripcion,
    activo_informacion: form.activo_informacion,
    amenaza_vulnerabilidad: form.amenaza_vulnerabilidad,
    probabilidad_inherente: form.probabilidad_inherente,
    impacto_inherente: form.impacto_inherente,
    nivel_inherente: nivelCalculado.value,
    controles_existentes: form.controles_existentes,
    probabilidad_residual: form.probabilidad_residual || null,
    impacto_residual: form.impacto_residual || null,
    nivel_residual: nivelResidualCalculado.value || null,
    plan_mitigacion: form.plan_mitigacion,
    responsable: form.responsable,
    fecha_estimada: form.fecha_estimada || null,
    estado: form.estado
  }

  try {
    if (props.isEditing && form.id) {
      await updateRiesgo(form.id, payload)
      Swal.fire('Actualizado', 'Riesgo actualizado correctamente', 'success')
    } else {
      await createRiesgo(payload)
      Swal.fire('Creado', 'Riesgo creado correctamente', 'success')
    }
    emit('save')
    closePopup()
  } catch (error) {
    Swal.fire('Error', 'No se pudo guardar el riesgo', 'error')
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #192847;
  color: white;
  border-radius: 20px 20px 0 0;
}

.popup-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
}

.popup-body {
  padding: 24px;
}

.form-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h4 {
  color: #192847;
  margin-bottom: 16px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #192847;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.readonly-input {
  background: #f5f5f5;
  font-weight: 500;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
  border-radius: 0 0 20px 20px;
}

.primary-btn {
  background: #192847;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
}

.secondary-btn {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn:hover {
  background: #D48600;
}

.secondary-btn:hover {
  background: #ccc;
}
</style>