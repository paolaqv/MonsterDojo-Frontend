<template>
  <div class="audit-panel">
    <header class="audit-header">
      <div>
        <h1>Bitacora de Auditoria</h1>
        <p>{{ criticalCount }} eventos criticos o altos detectados</p>
      </div>

      <button type="button" @click="cargarLogs">Actualizar</button>
    </header>

    <div class="filters">
      <input
        v-model.trim="busqueda"
        maxlength="100"
        placeholder="Buscar evento, modulo o descripcion"
        @keyup.enter="cargarLogs"
      />

      <select v-model="filtroSeveridad" @change="cargarLogs">
        <option value="">Todas</option>
        <option value="BAJA">BAJA</option>
        <option value="MEDIA">MEDIA</option>
        <option value="ALTA">ALTA</option>
        <option value="CRITICA">CRITICA</option>
      </select>

      <label class="critical-toggle">
        <input v-model="soloCriticos" type="checkbox" @change="cargarLogs" />
        Criticos
      </label>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Evento</th>
          <th>Modulo</th>
          <th>Severidad</th>
          <th>Estado</th>
          <th>Descripcion</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ formatDate(log.fecha) }}</td>
          <td>{{ log.evento }}</td>
          <td>{{ log.modulo }}</td>
          <td>
            <span :class="['severity', String(log.severidad || '').toLowerCase()]">
              {{ log.severidad || '-' }}
            </span>
          </td>
          <td>{{ log.estado || '-' }}</td>
          <td>{{ log.descripcion || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getAuditLogs } from '@/services/activityLogs.service'

const logs = ref([])
const busqueda = ref('')
const filtroSeveridad = ref('')
const soloCriticos = ref(false)
const errorMessage = ref('')

let debounceId = null

const cargarLogs = async () => {
  try {
    errorMessage.value = ''
    logs.value = await getAuditLogs({
      search: busqueda.value || undefined,
      severidad: soloCriticos.value ? undefined : filtroSeveridad.value || undefined,
      critical_only: soloCriticos.value || undefined,
      limit: 200,
    })
  } catch (error) {
    errorMessage.value = error.normalizedMessage || 'No se pudo cargar la bitacora.'
  }
}

const criticalCount = computed(
  () => logs.value.filter((log) => ['ALTA', 'CRITICA'].includes(log.severidad)).length
)

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

watch(busqueda, () => {
  window.clearTimeout(debounceId)
  debounceId = window.setTimeout(cargarLogs, 350)
})

onMounted(cargarLogs)
</script>

<style scoped>
.audit-panel {
  padding: 30px;
}

.audit-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.audit-header h1 {
  margin: 0;
}

.audit-header p {
  margin: 6px 0 0;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.filters input {
  min-width: 280px;
}

.critical-toggle {
  align-items: center;
  display: flex;
  gap: 8px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid #ccc;
  padding: 12px;
}

.severity {
  font-weight: 700;
}

.severity.alta,
.severity.critica {
  color: #b00020;
}

.error-message {
  color: #b00020;
}
</style>
