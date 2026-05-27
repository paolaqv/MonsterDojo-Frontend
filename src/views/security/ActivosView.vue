<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">
        <div class="risk-header">
          <div>
            <h2>🖥️ Inventario de Activos</h2>
            <p>Registro de infraestructura, sistemas y personal para análisis de riesgos</p>
          </div>
          <button v-wave class="primary-btn" @click="openCreateActivoPopup">
            <span class="btn-icon">+</span> Registrar Activo
          </button>
        </div>

        <div class="risk-table-container">
          <div class="table-toolbar">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o descripción..." />
            </div>
          </div>

          <table class="risk-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Activo</th>
                <th>Descripción</th>
                <th class="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activo in activosFiltrados" :key="activo.id_activo">
                <td class="center">#{{ activo.id_activo }}</td>
                <td><strong>{{ activo.nombre }}</strong></td>
                <td>{{ truncate(activo.descripcion, 60) }}</td>
                <td class="center">
                  <div class="action-buttons">
                    <button class="action-btn edit" @click="openEditActivoPopup(activo)" title="Editar">✏️</button>
                    <button class="action-btn delete" @click="confirmDeleteActivo(activo)" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="activosFiltrados.length === 0">
                <td colspan="4" class="empty-row"> <div class="empty-state">
                    <span class="empty-icon">📂</span>
                    <p>No hay activos registrados en el inventario</p>
                    <button class="primary-btn small" @click="openCreateActivoPopup">+ Registrar primer activo</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ActivoFormPopup
      :show="showActivoPopup"
      :activoData="selectedActivo"
      :isEditing="isEditingActivo"
      @close="closeActivoPopup"
      @save="loadActivos"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
import ActivoFormPopup from './ActivoFormPopup.vue'
import { getActivos, deleteActivo } from '@/services/activo.service'

import '@/assets/css/adminpanel.css'

const activos = ref([])
const searchQuery = ref('')
const showActivoPopup = ref(false)
const selectedActivo = ref(null)
const isEditingActivo = ref(false)

const loadActivos = async () => {
  try {
    const data = await getActivos()
    activos.value = data || []
  } catch (error) {
    console.error('Error cargando activos:', error)
  }
}

const activosFiltrados = computed(() => {
  if (!searchQuery.value) return activos.value
  const q = searchQuery.value.toLowerCase()
  return activos.value.filter(a => 
    a.nombre.toLowerCase().includes(q) || 
    (a.descripcion && a.descripcion.toLowerCase().includes(q))
  )
})

const truncate = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const openCreateActivoPopup = () => {
  selectedActivo.value = null
  isEditingActivo.value = false
  showActivoPopup.value = true
}

const openEditActivoPopup = (activo) => {
  selectedActivo.value = activo
  isEditingActivo.value = true
  showActivoPopup.value = true
}

const closeActivoPopup = () => {
  showActivoPopup.value = false
  selectedActivo.value = null
}

const confirmDeleteActivo = async (activo) => {
  const result = await Swal.fire({
    title: '¿Eliminar activo?',
    text: `¿Seguro que deseas eliminar "${activo.nombre}"? Esto podría fallar si tiene riesgos asociados.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await deleteActivo(activo.id_activo)
      Swal.fire('Eliminado', 'Activo eliminado correctamente', 'success')
      loadActivos()
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el activo. Verifica que no tenga riesgos asociados.', 'error')
    }
  }
}

onMounted(() => {
  loadActivos()
})
</script>

<style scoped>
.risk-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.risk-header h2 { color: #192847; margin: 0; font-size: 28px; }
.risk-header p { color: #666; margin: 6px 0 0; font-size: 14px; }
.primary-btn { background: linear-gradient(135deg, #192847, #1f3156); color: white; border: none; padding: 12px 24px; border-radius: 40px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
.btn-icon { font-size: 20px; font-weight: bold; }
.primary-btn:hover { background: linear-gradient(135deg, #D48600, #e6a300); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(212,134,0,0.3); }

.table-toolbar { display: flex; margin-bottom: 20px; padding: 0 8px; }
.search-box { display: flex; align-items: center; background: white; border: 1px solid #e0e0e0; border-radius: 40px; padding: 6px 16px; gap: 8px; width: 300px; }
.search-box input { border: none; padding: 8px 0; width: 100%; font-size: 14px; outline: none; }
.search-icon { font-size: 16px; color: #999; }

.risk-table-container { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 20px; }
.risk-table { width: 100%; border-collapse: collapse; }
.risk-table th, .risk-table td { padding: 16px 14px; border-bottom: 1px solid #efefef; text-align: left; }
.risk-table th { background: #f8f9fa; color: #192847; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
.center { text-align: center; }

.action-buttons { display: flex; gap: 6px; justify-content: center; }
.action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 8px; transition: all 0.2s; }
.action-btn.edit:hover { background: #e8edf5; }
.action-btn.delete:hover { background: #f8d7da; }

.empty-row { text-align: center; padding: 60px; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.empty-icon { font-size: 48px; opacity: 0.5; }
.primary-btn.small { padding: 8px 20px; font-size: 13px; }
</style>