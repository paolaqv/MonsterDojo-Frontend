<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">

        <div class="risk-header">
          <div>
            <h2>📊 Análisis de Riesgos</h2>
            <p>Gestión completa de riesgos de seguridad, controles y mitigaciones</p>
          </div>
          <button v-wave class="primary-btn" @click="openCreateRiskPopup">
            <span class="btn-icon">+</span>
            Nuevo Riesgo
          </button>
        </div>

        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <span class="stat-value">{{ riesgos.length }}</span>
              <span class="stat-label">Total Riesgos</span>
            </div>
          </div>
          <div class="stat-card extremo">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <span class="stat-value">{{ contarPorNivel('Extremo') }}</span>
              <span class="stat-label">Extremos</span>
            </div>
          </div>
          <div class="stat-card alto">
            <div class="stat-icon">🔴</div>
            <div class="stat-info">
              <span class="stat-value">{{ contarPorNivel('Alto') }}</span>
              <span class="stat-label">Altos</span>
            </div>
          </div>
          <div class="stat-card moderado">
            <div class="stat-icon">🟡</div>
            <div class="stat-info">
              <span class="stat-value">{{ contarPorNivel('Moderado') }}</span>
              <span class="stat-label">Moderados</span>
            </div>
          </div>
        </div>

        <div class="risk-table-container">
          <div class="table-toolbar">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" v-model="searchQuery" placeholder="Buscar por amenaza o activo..." />
            </div>
            <div class="filter-buttons">
              <button v-for="nivel in ['Todos', 'Extremo', 'Alto', 'Moderado', 'Bajo']" 
                      :key="nivel"
                      :class="['filter-chip', { active: filterNivel === nivel }]"
                      @click="filterNivel = nivel">
                {{ nivel }}
              </button>
            </div>
          </div>

          <table class="risk-table">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Amenaza</th>
                <th>Consecuencia</th>
                <th class="center">P</th>
                <th class="center">I</th>
                <th class="center">P×I</th>
                <th>Nivel</th>
                <th>Tratamiento</th>
                <th class="center">Mitig.</th>
                <th class="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="riesgo in riesgosFiltrados" :key="riesgo.id_riesgo">
                <tr :class="{ 'risk-expanded': expandedRows[riesgo.id_riesgo] }">
                  <td class="activo-cell">
                    <div class="activo-badge">{{ truncate(riesgo.activo_nombre, 20) || '-' }}</div>
                  </td>
                  <td class="amenaza-cell">{{ truncate(riesgo.amenaza, 40) }}</td>
                  <td class="consecuencia-cell">{{ truncate(riesgo.consecuencia, 45) }}</td>
                  <td class="center">{{ riesgo.probabilidad }}</td>
                  <td class="center">{{ riesgo.impacto }}</td>
                  <td class="center"><strong>{{ riesgo.riesgo_inherente }}</strong></td>
                  <td>
                    <span :class="`badge nivel-${riesgo.nivel_inherente?.toLowerCase()}`">
                      {{ riesgo.nivel_inherente }}
                    </span>
                  </td>
                  <td>
                    <span :class="`badge tratamiento-${riesgo.tratamiento?.toLowerCase()}`">
                      {{ riesgo.tratamiento }}
                    </span>
                  </td>
                  <td class="center">
                    <div class="mitig-buttons">
                      <button class="mitig-count" @click="toggleMitigaciones(riesgo.id_riesgo)">
                        {{ mitigacionesCount[riesgo.id_riesgo] || 0 }}
                        <span>mitigaciones</span>
                      </button>
                      <button class="add-mitig" @click="openCreateMitigacionPopup(riesgo)" title="Agregar mitigación">+</button>
                    </div>
                  </td>
                  <td class="center">
                    <div class="action-buttons">
                      <button class="action-btn edit" @click="openEditRiskPopup(riesgo)" title="Editar">✏️</button>
                      <button class="action-btn delete" @click="confirmDeleteRisk(riesgo)" title="Eliminar">🗑️</button>
                      <button class="action-btn dashboard" @click="viewDashboard" title="Dashboard">📊</button>
                    </div>
                  </td>
                </tr>

                <tr v-if="expandedRows[riesgo.id_riesgo]" class="mitigaciones-expand">
                  <td colspan="10" class="mitigaciones-cell">
                    <div class="mitigaciones-wrapper">
                      <div class="mitigaciones-title">
                        <span>📋 Mitigaciones para: {{ truncate(riesgo.amenaza, 50) }}</span>
                        <button class="close-mitig" @click="toggleMitigaciones(riesgo.id_riesgo)">✕</button>
                      </div>
                      <table class="mitigaciones-table">
                        <thead>
                          <tr>
                            <th>Control Implementado</th>
                            <th>Tipo</th>
                            <th>Nivel</th>
                            <th>Frec.</th>
                            <th>P res</th>
                            <th>I res</th>
                            <th>P×I res</th>
                            <th>Nivel res</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="mit in mitigaciones[riesgo.id_riesgo]" :key="mit.id_mitigacion">
                            <td>{{ truncate(mit.control_implementado, 50) }}</td>
                            <td class="center"><span class="tipo-badge">{{ mit.tipo || '-' }}</span></td>
                            <td class="center"><span class="nivel-badge">{{ mit.nivel || '-' }}</span></td>
                            <td class="center">{{ mit.frecuencia || '-' }}</td>
                            <td class="center">{{ mit.probabilidad_residual }}</td>
                            <td class="center">{{ mit.impacto_residual }}</td>
                            <td class="center"><strong>{{ mit.riesgo_residual }}</strong></td>
                            <td class="center">
                              <span :class="`badge nivel-${mit.nivel_residual?.toLowerCase()}`">
                                {{ mit.nivel_residual }}
                              </span>
                            </td>
                            <td class="center">
                              <button class="action-icon edit" @click="openEditMitigacionPopup(mit, riesgo)" title="Editar">✏️</button>
                              <button class="action-icon delete" @click="confirmDeleteMitigacion(mit)" title="Eliminar">🗑️</button>
                            </td>
                          </tr>
                          <tr v-if="!mitigaciones[riesgo.id_riesgo]?.length">
                            <td colspan="9" class="empty-mitigacion">
                              No hay mitigaciones registradas. Haz clic en "+" para agregar.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="riesgosFiltrados.length === 0">
                <td colspan="10" class="empty-row">
                  <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>No hay riesgos registrados</p>
                    <button class="primary-btn small" @click="openCreateRiskPopup">+ Crear primer riesgo</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Popups (modales más grandes) -->
    <RiskFormPopup
      :show="showRiskPopup"
      :riskData="selectedRisk"
      :isEditing="isEditingRisk"
      @close="closeRiskPopup"
      @save="loadData"
    />

    <MitigacionFormPopup
      :show="showMitigacionPopup"
      :mitigacionData="selectedMitigacion"
      :riesgoId="selectedRiesgoId"
      :riesgoNombre="selectedRiesgoNombre"
      :riesgoOriginal="riesgoOriginalData"
      :isEditing="isEditingMitigacion"
      @close="closeMitigacionPopup"
      @save="loadData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
import RiskFormPopup from './RiskFormPopup.vue'
import MitigacionFormPopup from './MitigacionFormPopup.vue'
import { getRiesgos, deleteRiesgo } from '@/services/riesgo.service'
import { getMitigaciones, deleteMitigacion } from '@/services/mitigacion.service'

const router = useRouter()
const riesgos = ref([])
const mitigaciones = ref({})
const expandedRows = ref({})
const mitigacionesCount = ref({})
const searchQuery = ref('')
const filterNivel = ref('Todos')

const showRiskPopup = ref(false)
const selectedRisk = ref(null)
const isEditingRisk = ref(false)

const showMitigacionPopup = ref(false)
const selectedMitigacion = ref(null)
const selectedRiesgoId = ref(null)
const selectedRiesgoNombre = ref('')
const riesgoOriginalData = ref(null)
const isEditingMitigacion = ref(false)

const contarPorNivel = (nivel) => {
  return riesgos.value.filter(r => r.nivel_inherente === nivel).length
}

const riesgosFiltrados = computed(() => {
  let filtered = riesgos.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      (r.amenaza && r.amenaza.toLowerCase().includes(q)) ||
      (r.activo_nombre && r.activo_nombre.toLowerCase().includes(q))
    )
  }
  
  if (filterNivel.value !== 'Todos') {
    filtered = filtered.filter(r => r.nivel_inherente === filterNivel.value)
  }
  
  return filtered
})

const truncate = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const loadRiesgos = async () => {
  try {
    const data = await getRiesgos()
    riesgos.value = data || []
  } catch (error) {
    console.error('Error cargando riesgos:', error)
  }
}

const loadMitigacionesForRiesgo = async (riesgoId) => {
  try {
    const data = await getMitigaciones(riesgoId)
    mitigaciones.value[riesgoId] = data || []
    mitigacionesCount.value[riesgoId] = data?.length || 0
  } catch (error) {
    mitigaciones.value[riesgoId] = []
    mitigacionesCount.value[riesgoId] = 0
  }
}

const loadAllMitigaciones = async () => {
  for (const riesgo of riesgos.value) {
    await loadMitigacionesForRiesgo(riesgo.id_riesgo)
  }
}

const loadData = async () => {
  await loadRiesgos()
  await loadAllMitigaciones()
}

const toggleMitigaciones = async (riesgoId) => {
  if (!expandedRows.value[riesgoId] && !mitigaciones.value[riesgoId]) {
    await loadMitigacionesForRiesgo(riesgoId)
  }
  expandedRows.value[riesgoId] = !expandedRows.value[riesgoId]
}

const openCreateRiskPopup = () => {
  selectedRisk.value = null
  isEditingRisk.value = false
  showRiskPopup.value = true
}

const openEditRiskPopup = (riesgo) => {
  selectedRisk.value = riesgo
  isEditingRisk.value = true
  showRiskPopup.value = true
}

const closeRiskPopup = () => {
  showRiskPopup.value = false
  selectedRisk.value = null
  loadData()
}

const confirmDeleteRisk = async (riesgo) => {
  const result = await Swal.fire({
    title: '¿Eliminar riesgo?',
    text: `¿Estás seguro de eliminar "${riesgo.amenaza}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await deleteRiesgo(riesgo.id_riesgo)
      Swal.fire('Eliminado', 'Riesgo eliminado correctamente', 'success')
      loadData()
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el riesgo', 'error')
    }
  }
}

const openCreateMitigacionPopup = (riesgo) => {
  selectedMitigacion.value = null
  selectedRiesgoId.value = riesgo.id_riesgo
  selectedRiesgoNombre.value = riesgo.amenaza
  riesgoOriginalData.value = riesgo
  isEditingMitigacion.value = false
  showMitigacionPopup.value = true
}

const openEditMitigacionPopup = (mitigacion, riesgo) => {
  selectedMitigacion.value = mitigacion
  selectedRiesgoId.value = riesgo.id_riesgo
  selectedRiesgoNombre.value = riesgo.amenaza
  riesgoOriginalData.value = riesgo
  isEditingMitigacion.value = true
  showMitigacionPopup.value = true
}

const closeMitigacionPopup = () => {
  showMitigacionPopup.value = false
  selectedMitigacion.value = null
  selectedRiesgoId.value = null
  selectedRiesgoNombre.value = ''
  riesgoOriginalData.value = null
  loadData()
}

const confirmDeleteMitigacion = async (mitigacion) => {
  const result = await Swal.fire({
    title: '¿Eliminar mitigación?',
    text: `¿Estás seguro de eliminar esta mitigación?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await deleteMitigacion(mitigacion.id_mitigacion)
      Swal.fire('Eliminada', 'Mitigación eliminada correctamente', 'success')
      loadData()
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la mitigación', 'error')
    }
  }
}

const viewDashboard = () => {
  router.push('/dashboard-riesgos')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.risk-header h2 {
  color: #192847;
  margin: 0;
  font-size: 28px;
}

.risk-header p {
  color: #666;
  margin: 6px 0 0;
  font-size: 14px;
}

.primary-btn {
  background: linear-gradient(135deg, #192847, #1f3156);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-icon {
  font-size: 20px;
  font-weight: bold;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #D48600, #e6a300);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212,134,0,0.3);
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #192847;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-card.extremo .stat-value { color: #721c24; }
.stat-card.alto .stat-value { color: #dc3545; }
.stat-card.moderado .stat-value { color: #ffc107; }

/* Table Toolbar */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 0 8px;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 40px;
  padding: 6px 16px;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
  color: #999;
}

.search-box input {
  border: none;
  padding: 8px 0;
  width: 240px;
  font-size: 14px;
  outline: none;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-chip {
  background: #f0f0f0;
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip.active {
  background: #192847;
  color: white;
}

/* Tabla */
.risk-table-container {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.risk-table {
  width: 100%;
  border-collapse: collapse;
}

.risk-table th,
.risk-table td {
  padding: 16px 14px;
  border-bottom: 1px solid #efefef;
}

.risk-table th {
  background: #f8f9fa;
  color: #192847;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.center {
  text-align: center;
}

.activo-badge {
  background: #e8edf5;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.nivel-bajo { background: #d4edda; color: #155724; }
.nivel-moderado { background: #fff3cd; color: #856404; }
.nivel-alto { background: #f8d7da; color: #721c24; }
.nivel-extremo { background: #721c24; color: white; }

.tratamiento-evitar { background: #dc3545; color: white; }
.tratamiento-reducir { background: #ffc107; color: #333; }
.tratamiento-compartir { background: #17a2b8; color: white; }
.tratamiento-aceptar { background: #28a745; color: white; }

/* Botones de acción */
.mitig-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mitig-count {
  background: #e8edf5;
  border: none;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 4px;
}

.mitig-count span {
  font-weight: normal;
  color: #666;
}

.add-mitig {
  background: #d4edda;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #155724;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.action-btn.edit:hover { background: #e8edf5; }
.action-btn.delete:hover { background: #f8d7da; }
.action-btn.dashboard:hover { background: #fff3cd; }

/* Mitigaciones expandibles */
.mitigaciones-expand {
  background: #f9fafb;
}

.mitigaciones-cell {
  padding: 0 !important;
}

.mitigaciones-wrapper {
  padding: 20px 24px;
  background: #f8f9fa;
}

.mitigaciones-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: #192847;
}

.close-mitig {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.mitigaciones-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.mitigaciones-table th,
.mitigaciones-table td {
  padding: 12px 10px;
  font-size: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.mitigaciones-table th {
  background: #eef2f7;
  font-weight: 600;
}

.empty-mitigacion {
  text-align: center;
  padding: 30px;
  color: #999;
}

.empty-row {
  text-align: center;
  padding: 60px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.primary-btn.small {
  padding: 8px 20px;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .risk-table {
    min-width: 1000px;
  }
}
</style>