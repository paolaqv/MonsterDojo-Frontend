<!-- src/views/security/RiskAnalysisView.vue -->
<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">
        <div class="risk-header">
          <h2>📊 Análisis de Riesgos</h2>
          <button v-wave class="primary-btn" @click="openCreatePopup">
            + Nuevo Riesgo
          </button>
        </div>

        <!-- Tabla de riesgos -->
        <div class="risk-table-container">
          <table class="risk-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Activo</th>
                <th>Amenaza</th>
                <th>Prob.</th>
                <th>Impacto</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="riesgo in riesgos" :key="riesgo.id">
                <td>{{ truncate(riesgo.nombre, 25) }}</td>
                <td>{{ truncate(riesgo.activo_informacion, 20) || '-' }}</td>
                <td>{{ truncate(riesgo.amenaza_vulnerabilidad, 25) || '-' }}</td>
                <td>
                  <span :class="`badge prob-${riesgo.probabilidad_inherente?.toLowerCase()}`">
                    {{ riesgo.probabilidad_inherente }}
                  </span>
                </td>
                <td>
                  <span :class="`badge impact-${riesgo.impacto_inherente?.toLowerCase()}`">
                    {{ riesgo.impacto_inherente }}
                  </span>
                </td>
                <td>
                  <span :class="`badge nivel-${riesgo.nivel_inherente?.toLowerCase()}`">
                    {{ riesgo.nivel_inherente }}
                  </span>
                </td>
                <td>
                  <span :class="`badge estado-${riesgo.estado?.toLowerCase()}`">
                    {{ riesgo.estado }}
                  </span>
                </td>
                <td class="actions">
                  <button v-wave class="icon-btn" @click="openEditPopup(riesgo)" title="Editar">
                    ✏️
                  </button>
                  <button v-wave class="icon-btn" @click="confirmDelete(riesgo)" title="Eliminar">
                    🗑️
                  </button>
                  <button v-wave class="icon-btn" @click="viewDashboard" title="Ver dashboard">
                    📊
                  </button>
                </td>
               </tr>
              <tr v-if="riesgos.length === 0">
                <td colspan="8" class="empty-row">No hay riesgos registrados. Haz clic en "+ Nuevo Riesgo" para comenzar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Popup Formulario -->
    <RiskFormPopup
      :show="showFormPopup"
      :riskData="selectedRisk"
      :isEditing="isEditing"
      @close="closeFormPopup"
      @save="saveRisk"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
import RiskFormPopup from './RiskFormPopup.vue'
import { getRiesgos, deleteRiesgo } from '@/services/riskAnalysis.service'

const router = useRouter()
const riesgos = ref([])
const showFormPopup = ref(false)
const selectedRisk = ref(null)
const isEditing = ref(false)

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
    Swal.fire('Error', 'No se pudieron cargar los riesgos', 'error')
  }
}

const openCreatePopup = () => {
  selectedRisk.value = null
  isEditing.value = false
  showFormPopup.value = true
}

const openEditPopup = (riesgo) => {
  selectedRisk.value = riesgo
  isEditing.value = true
  showFormPopup.value = true
}

const closeFormPopup = () => {
  showFormPopup.value = false
  selectedRisk.value = null
  loadRiesgos()
}

const saveRisk = () => {
  closeFormPopup()
}

const confirmDelete = async (riesgo) => {
  const result = await Swal.fire({
    title: '¿Eliminar riesgo?',
    text: `¿Estás seguro de eliminar "${riesgo.nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await deleteRiesgo(riesgo.id)
      Swal.fire('Eliminado', 'Riesgo eliminado correctamente', 'success')
      loadRiesgos()
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el riesgo', 'error')
    }
  }
}

const viewDashboard = () => {
  router.push('/dashboard-riesgos')
}

onMounted(() => {
  loadRiesgos()
})
</script>

<style scoped>
.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.risk-header h2 {
  color: #192847;
  margin: 0;
}

.primary-btn {
  background: #192847;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.primary-btn:hover {
  background: #D48600;
  transform: translateY(-2px);
}

.risk-table-container {
  background: white;
  border-radius: 20px;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.risk-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.risk-table th,
.risk-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.risk-table th {
  background: #f4f4f4;
  color: #192847;
  font-weight: 600;
}

.risk-table tr:hover {
  background: #f9f9f9;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.prob-baja { background: #d4edda; color: #155724; }
.prob-media { background: #fff3cd; color: #856404; }
.prob-alta { background: #f8d7da; color: #721c24; }

.impact-bajo { background: #d4edda; color: #155724; }
.impact-medio { background: #fff3cd; color: #856404; }
.impact-alto { background: #f8d7da; color: #721c24; }

.nivel-bajo { background: #d4edda; color: #155724; }
.nivel-medio { background: #fff3cd; color: #856404; }
.nivel-alto { background: #f8d7da; color: #721c24; }
.nivel-crítico { background: #721c24; color: white; }

.estado-activo { background: #d4edda; color: #155724; }
.estado-mitigado { background: #cce5ff; color: #004085; }
.estado-cerrado { background: #e2e3e5; color: #383d41; }

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.empty-row {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>