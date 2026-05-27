<template>
  <div v-if="show" class="popup-overlay" @click.self="closePopup">
    <div v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 300 } }"
      class="popup-container">
      
      <div class="popup-header">
        <div class="popup-header-left">
          <div class="popup-icon">🖥️</div>
          <div>
            <h3>{{ isEditing ? 'Editar Activo' : 'Nuevo Activo' }}</h3>
            <p>Registro en inventario para análisis de riesgo</p>
          </div>
        </div>
        <button class="close-btn" @click="closePopup" title="Cerrar">✕</button>
      </div>

      <div class="popup-body">
        <div class="form-section">
          <h4>Datos del Activo</h4>

          <div class="form-group" :class="{ 'error': errors.nombre }">
            <label>Nombre del Activo *</label>
            <input 
              v-model="form.nombre" 
              type="text" 
              @blur="validateNombre"
              placeholder="Ej: Servidor de Base de Datos, Router Principal..."
              maxlength="100"
            />
            <span class="error-message" v-if="errors.nombre">{{ errors.nombre }}</span>
          </div>

          <div class="form-group">
            <label>Descripción / Detalles</label>
            <textarea 
              v-model="form.descripcion" 
              rows="3" 
              placeholder="Marca, versión, ubicación física, criticidad para el negocio..."
              maxlength="300"
            ></textarea>
            <div class="char-counter">{{ form.descripcion.length }}/300</div>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button class="secondary-btn" @click="closePopup">Cancelar</button>
        <button class="primary-btn" @click="saveActivo" :disabled="!isValid">
          {{ isEditing ? 'Guardar cambios' : 'Registrar Activo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { createActivo, updateActivo } from '@/services/activo.service'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  activoData: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'save'])

const errors = reactive({
  nombre: ''
})

const form = reactive({
  id_activo: null,
  nombre: '',
  descripcion: ''
})

const validateNombre = () => {
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre del activo es obligatorio'
    return false
  }
  if (form.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres'
    return false
  }
  errors.nombre = ''
  return true
}

const isValid = computed(() => {
  return validateNombre()
})

const resetForm = () => {
  form.id_activo = null
  form.nombre = ''
  form.descripcion = ''
  errors.nombre = ''
}

const loadData = () => {
  if (props.activoData && props.isEditing) {
    form.id_activo = props.activoData.id_activo
    form.nombre = props.activoData.nombre || ''
    form.descripcion = props.activoData.descripcion || ''
  } else {
    resetForm()
  }
}

watch(() => props.show, (value) => {
  if (value) loadData()
})

const closePopup = () => {
  emit('close')
}

const saveActivo = async () => {
  if (!isValid.value) {
    Swal.fire('Error', 'Complete los campos obligatorios', 'warning')
    return
  }

  // AQUÍ ESTÁ LA MAGIA: Enviamos el nombre y descripción del usuario, 
  // pero forzamos la categoría a "General" para que la BD no falle.
  const payload = {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    categoria: "General" 
  }

  try {
    if (props.isEditing && form.id_activo) {
      await updateActivo(form.id_activo, payload)
      Swal.fire('Actualizado', 'Activo actualizado correctamente', 'success')
    } else {
      await createActivo(payload)
      Swal.fire('Registrado', 'Activo guardado correctamente', 'success')
    }
    emit('save')
    closePopup()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.detail || 'No se pudo guardar el activo', 'error')
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
  max-width: 600px;
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

.popup-body { padding: 32px; }
.form-section h4 { color: #192847; margin-bottom: 24px; font-size: 18px; padding-bottom: 10px; border-bottom: 2px solid #eee; }

.form-group { margin-bottom: 24px; width: 100%; }
.form-group label { display: block; margin-bottom: 10px; font-weight: 600; font-size: 14px; color: #333; }

.form-group input, .form-group textarea {
  width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 14px; font-family: inherit; font-size: 14px; transition: all 0.2s; box-sizing: border-box;
}

.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #192847; box-shadow: 0 0 0 3px rgba(25,40,71,0.1); }
.form-group.error input { border-color: #dc3545; background: #fff5f5; }
.error-message { display: block; color: #dc3545; font-size: 12px; margin-top: 8px; }
.char-counter { text-align: right; font-size: 11px; color: #999; margin-top: 6px; }

.popup-footer {
  display: flex; justify-content: flex-end; gap: 16px; padding: 24px 32px; border-top: 1px solid #e0e0e0; background: #fafafa; border-radius: 0 0 28px 28px;
}

.primary-btn { background: linear-gradient(135deg, #192847, #1f3156); color: white; border: none; padding: 12px 32px; border-radius: 40px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
.primary-btn:hover:not(:disabled) { background: linear-gradient(135deg, #D48600, #e6a300); transform: translateY(-2px); }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.secondary-btn { background: #e0e0e0; color: #333; border: none; padding: 12px 32px; border-radius: 40px; cursor: pointer; font-weight: 600; font-size: 14px; }
.secondary-btn:hover { background: #ccc; }
</style>