<template>
  <div class="audit-panel">

    <header class="audit-header">
      <div class="header-left">
        <span class="audit-label">SEGURIDAD</span>
        <h1 v-if="activeView === 'seguridad'">Bitácora de Auditoría</h1>
        <h1 v-else>Logs de Aplicación</h1>
      </div>

      <div class="header-right">
        <div class="metric-box">
          <strong>{{ currentLogs.length }}</strong>
          <span>Eventos</span>
        </div>

        <div v-if="activeView === 'seguridad'" class="metric-box critical">
          <strong>{{ criticalCount }}</strong>
          <span>Críticos</span>
        </div>

        <div v-else class="metric-box critical">
          <strong>{{ errorCount }}</strong>
          <span>Errores</span>
        </div>

        <button
          v-if="activeView === 'seguridad'"
          type="button"
          class="switch-view-btn header-switch"
          @click="abrirAplicacion"
        >
          Ver logs de aplicación
        </button>
        <button
          v-else
          type="button"
          class="switch-view-btn header-switch back"
          @click="volverSeguridad"
        >
          Volver a logs de seguridad
        </button>

        <button type="button" class="refresh-btn" @click="cargarVistaActual">
          Actualizar
        </button>
      </div>
    </header>

    <!-- ============== VISTA: LOGS DE SEGURIDAD / USUARIO ============== -->
    <template v-if="activeView === 'seguridad'">
      <section class="filters-card filters-card--security">
        <input
          v-model.trim="busqueda"
          maxlength="100"
          placeholder="Buscar evento o descripción"
          @keyup.enter="cargarLogs"
        />

        <input
          v-model.trim="filtroModulo"
          maxlength="100"
          placeholder="Módulo (auth, usuarios, roles...)"
        />

        <input
          v-model.trim="filtroEstado"
          maxlength="20"
          placeholder="Estado (OK, FALLIDO...)"
        />

        <select
          v-model="filtroSeveridad"
          :disabled="soloCriticos"
          @change="cargarLogs"
        >
          <option value="">Severidad: todas</option>
          <option value="BAJA">BAJA</option>
          <option value="MEDIA">MEDIA</option>
          <option value="ALTA">ALTA</option>
          <option value="CRITICA">CRITICA</option>
        </select>

        <div class="critical-filter">
          <span class="filter-caption">Solo críticos</span>
          <label class="switch">
            <input
              v-model="soloCriticos"
              type="checkbox"
              @change="cargarLogs"
            />
            <span class="slider"></span>
          </label>
        </div>
      </section>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <p>Cargando registros de auditoría...</p>
      </div>

      <div v-if="!loading" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Evento</th>
              <th>Módulo</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDate(log.fecha) }}</td>
              <td>{{ log.evento }}</td>
              <td>{{ log.modulo }}</td>
              <td>
                <span
                  :class="['severity', String(log.severidad || '').toLowerCase()]"
                >{{ log.severidad || '-' }}</span>
              </td>
              <td>{{ log.estado || '-' }}</td>
              <td>{{ log.descripcion || '-' }}</td>
            </tr>
            <tr v-if="!logs.length">
              <td colspan="6" class="empty-row">Sin registros para los filtros aplicados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ============== VISTA: LOGS DE APLICACION ============== -->
    <template v-else>
      <section class="filters-card filters-card--app">
        <input
          v-model.trim="busquedaApp"
          maxlength="100"
          placeholder="Buscar evento, entidad o descripción"
          @keyup.enter="cargarLogsAplicacion"
        />

        <input
          v-model.trim="filtroModuloApp"
          maxlength="100"
          placeholder="Módulo (uploads, pagos, sistema...)"
        />

        <input
          v-model.trim="filtroEstadoApp"
          maxlength="20"
          placeholder="Estado (OK, FAIL...)"
        />

        <select v-model="filtroSeveridadApp" @change="cargarLogsAplicacion">
          <option value="">Severidad: todas</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICA">CRITICA</option>
        </select>
      </section>

      <p v-if="errorMessageApp" class="error-message">{{ errorMessageApp }}</p>

      <div v-if="loadingApp" class="loading-box">
        <div class="spinner"></div>
        <p>Cargando logs de aplicación...</p>
      </div>

      <div v-if="!loadingApp" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Módulo</th>
              <th>Evento</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Entidad</th>
              <th>Descripción</th>
              <th>Recurso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logsApp" :key="log.id">
              <td>{{ formatDate(log.fecha) }}</td>
              <td>{{ log.modulo }}</td>
              <td>{{ log.evento }}</td>
              <td>
                <span
                  :class="['severity', appSeverityClass(log.severidad)]"
                >{{ log.severidad || '-' }}</span>
              </td>
              <td>{{ log.estado || '-' }}</td>
              <td>{{ log.usuario_id ?? '-' }}</td>
              <td>
                <template v-if="log.entidad_afectada">
                  {{ log.entidad_afectada }}{{ log.entidad_id ? ` #${log.entidad_id}` : '' }}
                </template>
                <template v-else>-</template>
              </td>
              <td>{{ log.descripcion || '-' }}</td>
              <td>
                <a
                  v-if="getImageUrl(log)"
                  :href="getImageUrl(log)"
                  target="_blank"
                  rel="noopener"
                >
                  <img
                    :src="getImageUrl(log)"
                    alt="recurso subido"
                    style="max-width:80px; max-height:60px; border-radius:6px; border:1px solid #cfd6e2;"
                  />
                </a>
                <span v-else>-</span>
              </td>
            </tr>
            <tr v-if="!logsApp.length">
              <td colspan="9" class="empty-row">Sin registros para los filtros aplicados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getAuditLogs } from '@/services/activityLogs.service'
import { getApplicationLogs } from '@/services/applicationLogs.service'

const activeView = ref('seguridad')

// ===== Seguridad =====
const logs = ref([])
const busqueda = ref('')
const filtroSeveridad = ref('')
const filtroModulo = ref('')
const filtroEstado = ref('')
const soloCriticos = ref(false)
const errorMessage = ref('')
const loading = ref(false)
let debounceId = null

const cargarLogs = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    logs.value = await getAuditLogs({
      search: busqueda.value || undefined,
      severidad: soloCriticos.value ? undefined : filtroSeveridad.value || undefined,
      modulo: filtroModulo.value || undefined,
      estado: filtroEstado.value || undefined,
      critical_only: soloCriticos.value || undefined,
      limit: 200,
    })
  } catch (error) {
    errorMessage.value = error.normalizedMessage || 'No se pudo cargar la bitácora.'
  } finally {
    loading.value = false
  }
}

const criticalCount = computed(() =>
  logs.value.filter((log) => ['ALTA', 'CRITICA'].includes(log.severidad)).length,
)

const scheduleSecurityReload = () => {
  clearTimeout(debounceId)
  debounceId = setTimeout(cargarLogs, 350)
}

watch(busqueda, scheduleSecurityReload)
watch(filtroModulo, scheduleSecurityReload)
watch(filtroEstado, scheduleSecurityReload)

// ===== Aplicacion =====
const logsApp = ref([])
const busquedaApp = ref('')
const filtroSeveridadApp = ref('')
const filtroModuloApp = ref('')
const filtroEstadoApp = ref('')
const errorMessageApp = ref('')
const loadingApp = ref(false)
let debounceAppId = null

const cargarLogsAplicacion = async () => {
  try {
    loadingApp.value = true
    errorMessageApp.value = ''
    logsApp.value = await getApplicationLogs({
      search: busquedaApp.value || undefined,
      severidad: filtroSeveridadApp.value || undefined,
      modulo: filtroModuloApp.value || undefined,
      estado: filtroEstadoApp.value || undefined,
      limit: 200,
    })
  } catch (error) {
    errorMessageApp.value =
      error.normalizedMessage || 'No se pudo cargar los logs de aplicación.'
  } finally {
    loadingApp.value = false
  }
}

const errorCount = computed(() =>
  logsApp.value.filter((log) => ['ERROR', 'CRITICA'].includes(log.severidad)).length,
)

const appSeverityClass = (sev) => {
  const s = String(sev || '').toLowerCase()
  if (s === 'error') return 'alta'
  if (s === 'critica') return 'critica'
  if (s === 'warn') return 'media'
  return 'baja'
}

// Reconstruye la URL publica de Supabase para eventos de subida de imagen.
// El backend guarda el path del objeto en entidad_id (ej. "productos/abc.png").
const SUPABASE_PUBLIC_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://olcwwkccufjmqaskumin.supabase.co'
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'Seguridad'

const getImageUrl = (log) => {
  if (!log || log.evento !== 'ARCHIVO_SUBIDO') return null
  const path = log.entidad_id
  if (!path) return null
  return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`
}

const scheduleAppReload = () => {
  clearTimeout(debounceAppId)
  debounceAppId = setTimeout(cargarLogsAplicacion, 350)
}

watch(busquedaApp, scheduleAppReload)
watch(filtroModuloApp, scheduleAppReload)
watch(filtroEstadoApp, scheduleAppReload)

// ===== Comun =====
const currentLogs = computed(() =>
  activeView.value === 'seguridad' ? logs.value : logsApp.value,
)

const cargarVistaActual = () => {
  if (activeView.value === 'seguridad') cargarLogs()
  else cargarLogsAplicacion()
}

const abrirAplicacion = async () => {
  activeView.value = 'aplicacion'
  await cargarLogsAplicacion()
}

const volverSeguridad = async () => {
  activeView.value = 'seguridad'
  await cargarLogs()
}

// Bolivia: UTC-4, sin horario de verano.
// El backend devuelve fechas con timezone (activity) o sin timezone (application).
// Si llega sin timezone, asumimos que es UTC (lo que guarda func.now() en Postgres por defecto).
const BOLIVIA_TZ = 'America/La_Paz'

const parseLogDate = (value) => {
  if (!value) return null
  let raw = String(value)
  // ISO sin info de zona: agregar 'Z' para que JS lo tome como UTC.
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw)
  if (!hasZone) raw = raw.replace(' ', 'T') + 'Z'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

const formatDate = (value) => {
  const d = parseLogDate(value)
  if (!d) return '-'
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: BOLIVIA_TZ,
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)
}

onMounted(cargarLogs)
</script>

<style scoped>

/* CONTENEDOR */

.audit-panel{
padding:20px;
max-width:1180px;
margin:auto;
}


/* HEADER */

.audit-header{

display:flex;
justify-content:space-between;
align-items:center;

gap:16px;

padding:14px 20px;

background:#192847;

border-radius:14px;

margin-bottom:18px;

color:white;

height:92px !important;
min-height:92px !important;
max-height:92px !important;

overflow:hidden;
}

.header-left h1{
margin:4px 0;
font-size:22px;
}

.audit-label{

display:inline-block;

padding:5px 10px;

border-radius:22px;

background:
rgba(255,255,255,.12);

font-size:10px;
font-weight:700;
}


/* METRICAS */

.header-right{
display:flex;
align-items:center;
gap:12px;
}

.metric-box{

padding:8px 12px;

min-width:78px;

border-radius:8px;

background:rgba(255,255,255,.12);

text-align:center;
}

.metric-box strong{
font-size:18px;
display:block;
}

.metric-box span{
font-size:10px;
text-transform:uppercase;
opacity:.8;
}

.metric-box.critical{
background:#c0392b;
}

.refresh-btn{
padding:8px 14px;
border:none;
border-radius:8px;
background:#3498db;
color:white;
cursor:pointer;
font-weight:600;
}

.refresh-btn:hover{
background:#2980b9;
}


/* FILTROS */

.filters-card{
display:grid;
gap:12px;
align-items:center;

background:white;
padding:14px;
border-radius:10px;
margin-bottom:16px;
box-shadow:0 1px 4px rgba(0,0,0,.06);
}

.filters-card--security{
grid-template-columns: 2fr 1.2fr 1fr 1.2fr auto;
}

.filters-card--app{
grid-template-columns: 2fr 1.4fr 1fr 1.2fr;
}

@media (max-width: 900px){
.filters-card--security,
.filters-card--app{
grid-template-columns: 1fr 1fr;
}
}

.filters-card input,
.filters-card select{
padding:9px 10px;
border:1px solid #cfd6e2;
border-radius:8px;
font-size:14px;
}

.filters-card select:disabled{
background:#eef1f6;
color:#888;
cursor:not-allowed;
}

.empty-row{
text-align:center !important;
color:#888;
padding:18px !important;
font-style:italic;
}

.critical-filter{
display:flex;
align-items:center;
justify-content:flex-end;
gap:10px;
font-size:13px;
}

.switch{
position:relative;
display:inline-block;
width:42px;
height:22px;
}
.switch input{display:none;}
.slider{
position:absolute;
inset:0;
background:#bbb;
border-radius:22px;
transition:.2s;
cursor:pointer;
}
.slider::before{
content:'';
position:absolute;
height:18px; width:18px;
left:2px; top:2px;
background:white;
border-radius:50%;
transition:.2s;
}
.switch input:checked + .slider{ background:#c0392b; }
.switch input:checked + .slider::before{ transform:translateX(20px); }


/* TABLA */

.table-wrap{
background:white;
border-radius:10px;
overflow:auto;
box-shadow:0 1px 4px rgba(0,0,0,.06);
}

table{
width:100%;
border-collapse:collapse;
}

th, td{
text-align:left;
padding:10px 12px;
border-bottom:1px solid #eef1f6;
font-size:13px;
color:#1f2937;
}

th{
background:#192847;
color:#ffffff;
font-weight:700;
text-transform:uppercase;
font-size:12px;
letter-spacing:0.4px;
}

.severity{
padding:3px 8px;
border-radius:10px;
font-weight:700;
font-size:11px;
display:inline-block;
}
.severity.baja{ background:#dff0d8; color:#3c763d; }
.severity.media{ background:#fcf8e3; color:#8a6d3b; }
.severity.alta{ background:#f2dede; color:#a94442; }
.severity.critica{ background:#a94442; color:white; }


/* LOADING */

.loading-box{
text-align:center;
padding:30px;
color:#666;
}

.spinner{
margin:0 auto 12px;
width:32px; height:32px;
border:3px solid #ccc;
border-top-color:#3498db;
border-radius:50%;
animation:spin 0.9s linear infinite;
}

@keyframes spin{
to{ transform:rotate(360deg); }
}

.error-message{
background:#f2dede;
color:#a94442;
padding:10px 14px;
border-radius:8px;
margin-bottom:14px;
}


/* SWITCH ENTRE VISTAS */

.switch-view-btn{
padding:10px 22px;
border:none;
border-radius:8px;
background:#192847;
color:white;
font-weight:700;
font-size:14px;
cursor:pointer;
}

.switch-view-btn:hover{
background:#0f1c36;
}

.switch-view-btn.back{
background:#7f8c8d;
}
.switch-view-btn.back:hover{
background:#636e6f;
}

.switch-view-btn.header-switch{
padding:8px 14px;
font-size:13px;
}
</style>
