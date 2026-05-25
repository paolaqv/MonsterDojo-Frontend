<!-- src/views/security/RiskDashboardView.vue -->
<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">
        <div class="dashboard-header">
          <h2>🔥 Matriz de Calor - Análisis de Riesgos</h2>
          <button v-wave class="secondary-btn" @click="goBack">← Volver a lista</button>
        </div>

        <!-- Matriz de Calor 3x3 -->
        <div class="matrix-container">
          <h3>Matriz de Riesgo Inherente</h3>
          <table class="heat-matrix">
            <thead>
              <tr>
                <th></th>
                <th>Bajo</th>
                <th>Medio</th>
                <th>Alto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prob in ['Baja', 'Media', 'Alta']" :key="prob">
                <th>{{ prob }}</th>
                <td v-for="imp in ['Bajo', 'Medio', 'Alto']" :key="imp"
                    :class="getCellClass(prob, imp)"
                    @click="filterByCell(prob, imp)">
                  <div class="cell-content">
                    <span class="nivel">{{ getNivel(prob, imp) }}</span>
                    <span class="count">{{ getCount(prob, imp) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resumen de riesgos -->
        <div class="summary-cards">
          <div class="card">
            <div class="card-icon">📊</div>
            <div class="card-info">
              <h4>Total Riesgos</h4>
              <p>{{ riesgos.length }}</p>
            </div>
          </div>
          <div class="card critico">
            <div class="card-icon">⚠️</div>
            <div class="card-info">
              <h4>Críticos</h4>
              <p>{{ contarPorNivel('Crítico') }}</p>
            </div>
          </div>
          <div class="card alto">
            <div class="card-icon">🔴</div>
            <div class="card-info">
              <h4>Altos</h4>
              <p>{{ contarPorNivel('Alto') }}</p>
            </div>
          </div>
          <div class="card medio">
            <div class="card-icon">🟡</div>
            <div class="card-info">
              <h4>Medios</h4>
              <p>{{ contarPorNivel('Medio') }}</p>
            </div>
          </div>
          <div class="card bajo">
            <div class="card-icon">🟢</div>
            <div class="card-info">
              <h4>Bajos</h4>
              <p>{{ contarPorNivel('Bajo') }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de riesgos filtrada -->
        <div v-if="filteredRiesgos.length > 0" class="filtered-list">
          <h3>Riesgos en {{ filtroProbabilidad }} / {{ filtroImpacto }}</h3>
          <table class="risk-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="riesgo in filteredRiesgos" :key="riesgo.id">
                <td>{{ truncate(riesgo.nombre, 30) }}</td>
                <td>{{ truncate(riesgo.descripcion, 40) }}</td>
                <td>{{ riesgo.estado }}</td>
              </tr>
            </tbody>
          </table>
          <button class="clear-filter" @click="clearFilter">Limpiar filtro</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
import { getRiesgos } from '@/services/riskAnalysis.service'

const router = useRouter()
const riesgos = ref([])
const filtroProbabilidad = ref('')
const filtroImpacto = ref('')

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

const getNivel = (prob, impact) => {
  const key = `${prob}-${impact}`
  return nivelMap[key] || 'Medio'
}

const getCellClass = (prob, impact) => {
  const nivel = getNivel(prob, impact)
  return `cell cell-${nivel.toLowerCase()}`
}

const getCount = (prob, impact) => {
  return riesgos.value.filter(r => 
    r.probabilidad_inherente === prob && 
    r.impacto_inherente === impact
  ).length
}

const contarPorNivel = (nivel) => {
  return riesgos.value.filter(r => r.nivel_inherente === nivel).length
}

const filteredRiesgos = computed(() => {
  if (!filtroProbabilidad.value || !filtroImpacto.value) return []
  return riesgos.value.filter(r => 
    r.probabilidad_inherente === filtroProbabilidad.value && 
    r.impacto_inherente === filtroImpacto.value
  )
})

const filterByCell = (prob, impact) => {
  filtroProbabilidad.value = prob
  filtroImpacto.value = impact
}

const clearFilter = () => {
  filtroProbabilidad.value = ''
  filtroImpacto.value = ''
}

const truncate = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const goBack = () => {
  router.push('/analisis-riesgos')
}

onMounted(async () => {
  try {
    const data = await getRiesgos()
    riesgos.value = data || []
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-header h2 {
  color: #192847;
  margin: 0;
}

.matrix-container {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.matrix-container h3 {
  margin-bottom: 20px;
  color: #192847;
}

.heat-matrix {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.heat-matrix th,
.heat-matrix td {
  border: 1px solid #ddd;
  padding: 16px;
  width: 25%;
}

.heat-matrix th {
  background: #192847;
  color: white;
  font-weight: 600;
}

.cell {
  cursor: pointer;
  transition: transform 0.2s;
}

.cell:hover {
  transform: scale(1.02);
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nivel {
  font-weight: bold;
  font-size: 14px;
}

.count {
  font-size: 20px;
  font-weight: bold;
}

.cell-bajo { background: #d4edda; }
.cell-medio { background: #fff3cd; }
.cell-alto { background: #f8d7da; }
.cell-crítico { background: #721c24; color: white; }

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-icon {
  font-size: 32px;
}

.card-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.card-info p {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #192847;
}

.card.critico .card-info p { color: #721c24; }
.card.alto .card-info p { color: #dc3545; }
.card.medio .card-info p { color: #ffc107; }
.card.bajo .card-info p { color: #28a745; }

.filtered-list {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-top: 20px;
}

.filtered-list h3 {
  margin-bottom: 16px;
  color: #192847;
}

.risk-table {
  width: 100%;
  border-collapse: collapse;
}

.risk-table th,
.risk-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.risk-table th {
  background: #f5f5f5;
}

.clear-filter {
  margin-top: 16px;
  background: #e0e0e0;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
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
</style>