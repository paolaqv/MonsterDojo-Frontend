<!-- src/views/security/RiskDashboardView.vue -->
<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">

        <div v-if="cargando" class="loader-container">
          <div class="spinner"></div>
          <p>Cargando matriz de riesgos...</p>
        </div>

        <div class="dashboard-header">
          <h2>🔥 Matriz de Calor - Análisis de Riesgos</h2>
          <button v-wave class="secondary-btn" @click="goBack">← Volver a lista</button>
        </div>

        <!-- Matriz de Calor 5x5 -->
<div class="matrix-container">
  <h3>Matriz de Riesgo (Probabilidad 1-5 vs Impacto 1-5)</h3>
  <table class="heat-matrix">
    <thead>
      <tr>
        <th>P \ I</th>
        <th>Impacto 1</th>
        <th>Impacto 2</th>
        <th>Impacto 3</th>
        <th>Impacto 4</th>
        <th>Impacto 5</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in 5" :key="p">
        <th>Prob. {{ p }}</th>
        <td v-for="i in 5" :key="i"
            :class="getCellClassNum(p, i)"
            :title="`Probabilidad: ${p}, Impacto: ${i} → Nivel: ${getNivelFromValue(p * i)}`"
            @click="filterByCellNum(p, i)">
          <div class="cell-content">
            <span class="nivel">{{ getNivelFromValue(p * i) }}</span>
            <span class="count">{{ getCountNum(p, i) }}</span>
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
const cargando = ref(true)


//para la matriz5x5
const getNivelFromValue = (valor) => {
  if (valor >= 1 && valor <= 4) return 'Bajo'
  if (valor >= 5 && valor <= 9) return 'Moderado'
  if (valor >= 10 && valor <= 16) return 'Alto'
  if (valor >= 17 && valor <= 25) return 'Extremo'
  return ''
}

const getCellClassNum = (p, i) => {
  const valor = p * i
  const nivel = getNivelFromValue(valor).toLowerCase()
  return `cell cell-${nivel}`
}

const getCountNum = (p, i) => {
  return riesgos.value.filter(r => r.probabilidad === p && r.impacto === i).length
}

const filterByCellNum = (p, i) => {
  filtroProbabilidad.value = p.toString()
  filtroImpacto.value = i.toString()
  
  setTimeout(() => {
    const filteredList = document.querySelector('.filtered-list')
    if (filteredList) {
      filteredList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}
//5x5

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
  
  setTimeout(() => {
    const filteredList = document.querySelector('.filtered-list')
    if (filteredList) {
      filteredList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
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
  cargando.value = true
  try {
    const data = await getRiesgos()
    riesgos.value = data || []
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    cargando.value = false
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
  padding: 8px 6px;  
  width: 14%;        
  min-width: 70px;
  border-radius: 8px;
  transition: all 0.2s;
}

.heat-matrix th {
  background: #192847;
  color: white;
  font-weight: 600;
}

.cell {
  cursor: pointer;
  transition: all 0.25s ease;
}

.cell:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1;
  position: relative;
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 4px;  
}

.nivel {
  font-weight: bold;
  font-size: 12px;  
}

.count {
  font-size: 16px; 
  font-weight: bold;
}

.cell-bajo { background: linear-gradient(135deg, #28a745, #20c997); color: #155724; }
.cell-medio { background: linear-gradient(135deg, #ffc107, #fd7e14); color: #856404; }
.cell-alto { background: linear-gradient(135deg, #fd7e14, #dc3545); color: white; }
.cell-crítico { background: linear-gradient(135deg, #dc3545, #6f1d1d); color: white; }

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
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

/* Loader */
.loader-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
  margin-bottom: 30px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #192847;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-container p {
  color: #666;
  font-size: 14px;
}
</style>