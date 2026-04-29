<template>
<div class="audit-panel">

<header class="audit-header">

<div class="header-left">
<span class="audit-label">SEGURIDAD</span>

<h1>Bitácora de Auditoría</h1>
</div>


<div class="header-right">

<div class="metric-box">
<strong>{{ logs.length }}</strong>
<span>Eventos</span>
</div>

<div class="metric-box critical">
<strong>{{ criticalCount }}</strong>
<span>Críticos</span>
</div>

<button
type="button"
class="refresh-btn"
@click="cargarLogs"
>
Actualizar
</button>

</div>

</header>



<section class="filters-card">

<input
v-model.trim="busqueda"
maxlength="100"
placeholder="Buscar evento, módulo o descripción"
@keyup.enter="cargarLogs"
/>


<select
v-model="filtroSeveridad"
@change="cargarLogs"
>
<option value="">Todas</option>
<option value="BAJA">BAJA</option>
<option value="MEDIA">MEDIA</option>
<option value="ALTA">ALTA</option>
<option value="CRITICA">CRITICA</option>
</select>


<div class="critical-filter">

<span class="filter-caption">
Mostrar solo eventos críticos
</span>

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



<p
v-if="errorMessage"
class="error-message"
>
{{ errorMessage }}
</p>



<!-- LOADING -->
<div
v-if="loading"
class="loading-box"
>

<div class="spinner"></div>

<p>
Cargando registros de auditoría...
</p>

</div>



<!-- TABLA -->
<div
v-if="!loading"
class="table-wrap"
>

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

<tr
v-for="log in logs"
:key="log.id"
>

<td>{{ formatDate(log.fecha) }}</td>

<td>{{ log.evento }}</td>

<td>{{ log.modulo }}</td>

<td>
<span
:class="[
'severity',
String(log.severidad || '').toLowerCase()
]"
>
{{ log.severidad || '-' }}
</span>
</td>

<td>{{ log.estado || '-' }}</td>

<td>{{ log.descripcion || '-' }}</td>

</tr>

</tbody>

</table>

</div>

</div>
</template>



<script setup>
import { computed,onMounted,ref,watch } from 'vue'
import { getAuditLogs } from '@/services/activityLogs.service'

const logs=ref([])
const busqueda=ref('')
const filtroSeveridad=ref('')
const soloCriticos=ref(false)

const errorMessage=ref('')

const loading=ref(false)

let debounceId=null


const cargarLogs=async()=>{

try{

loading.value=true

errorMessage.value=''

logs.value=await getAuditLogs({

search:
busqueda.value || undefined,

severidad:
soloCriticos.value
? undefined
: filtroSeveridad.value || undefined,

critical_only:
soloCriticos.value || undefined,

limit:200

})

}catch(error){

errorMessage.value=
error.normalizedMessage
|| 'No se pudo cargar la bitácora.'

}
finally{

loading.value=false

}

}



const criticalCount=computed(
()=>logs.value.filter(
log=>
['ALTA','CRITICA']
.includes(log.severidad)
).length
)



const formatDate=(value)=>{

if(!value) return '-'

return new Intl.DateTimeFormat(
'es-BO',
{
dateStyle:'short',
timeStyle:'short'
}
).format(new Date(value))

}



watch(
busqueda,
()=>{

clearTimeout(debounceId)

debounceId=setTimeout(
cargarLogs,
350
)

}
)

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

background:
rgba(255,255,255,.10);
}

.metric-box strong{
display:block;
font-size:16px;
}

.metric-box span{
font-size:10px;
}

.metric-box.critical{
border:
1px solid rgba(255,120,120,.4);
}



/* BOTON */

.refresh-btn{

border:none;

background:white;

padding:8px 14px;

height:36px;

border-radius:8px;

font-size:13px;

font-weight:700;

cursor:pointer;
}



/* FILTROS */

.filters-card{

display:flex;
gap:16px;
align-items:center;

background:#f4f4f4;

padding:14px 18px;

border-radius:14px;

margin-bottom:20px;
}

.filters-card input,
.filters-card select{

padding:10px 12px;

border-radius:8px;

border:1px solid #ccc;
}

.filters-card input{
min-width:260px;
}



/* SWITCH */

.critical-filter{

display:flex;
align-items:center;
gap:14px;

padding-left:14px;

border-left:1px solid #ddd;
}

.filter-caption{
font-size:14px;
font-weight:600;
white-space:nowrap;
}


.switch{
position:relative;
display:inline-block;

width:52px;
height:28px;
}

.switch input{
opacity:0;
width:0;
height:0;
}

.slider{

position:absolute;

top:0;
left:0;
right:0;
bottom:0;

cursor:pointer;

background:#ccc;

border-radius:30px;

transition:.3s;
}

.slider:before{

content:"";

position:absolute;

height:20px;
width:20px;

left:4px;
top:4px;

background:white;

border-radius:50%;

transition:.3s;
}

.switch input:checked + .slider{
background:#192847;
}

.switch input:checked + .slider:before{
transform:translateX(24px);
}



/* LOADING */

.loading-box{

margin-top:30px;

padding:45px;

display:flex;
flex-direction:column;
align-items:center;
gap:18px;

background:white;

border-radius:16px;

box-shadow:
0 6px 18px rgba(0,0,0,.08);
}

.spinner{

width:42px;
height:42px;

border:4px solid #ddd;

border-top:4px solid #192847;

border-radius:50%;

animation:girar 1s linear infinite;
}

@keyframes girar{

from{
transform:rotate(0deg);
}

to{
transform:rotate(360deg);
}

}



/* TABLA */

.table-wrap{
overflow:auto;
}

table{

width:100%;

border-collapse:collapse;

background:white;

border-radius:14px;

overflow:hidden;

box-shadow:
0 6px 18px rgba(0,0,0,.08);
}

th{
background:#192847;
color:white;
}

th,td{
padding:14px;
border:1px solid #ddd;
}

.severity{
font-weight:700;
}

.severity.alta,
.severity.critica{
color:#b00020;
}

.error-message{
margin-bottom:14px;
color:#b00020;
}



/* RESPONSIVE */

@media(max-width:900px){

.audit-header{
flex-direction:column;
align-items:flex-start;
}

.header-right{
flex-wrap:wrap;
}

.filters-card{
flex-direction:column;
align-items:stretch;
}

.filters-card input{
min-width:auto;
}

.critical-filter{
border-left:none;
padding-left:0;
}

}

</style>