<template>
<div class="audit-panel">

<h1>Bitácora de Auditoría</h1>

<div class="filters">

<input
 v-model="busqueda"
 placeholder="Buscar evento..."
/>

<select v-model="filtroSeveridad">
<option value="">Todas</option>
<option>MEDIA</option>
<option>ALTA</option>
<option>CRITICA</option>
</select>

</div>


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
v-for="log in logsFiltrados"
:key="log.id"
>

<td>{{ log.fecha }}</td>

<td>
{{ log.evento }}
</td>

<td>
{{ log.modulo }}
</td>

<td>
{{ log.severidad }}
</td>

<td>
{{ log.estado }}
</td>

<td>
{{ log.descripcion }}
</td>

</tr>

</tbody>

</table>

</div>
</template>


<script setup>
import {ref,onMounted,computed} from "vue"
import {getAuditLogs} from "@/services/activityLogs.service"

const logs=ref([])

const busqueda=ref("")
const filtroSeveridad=ref("")


const cargarLogs=async()=>{

 try{

   logs.value=
      await getAuditLogs()

 }

 catch(error){

   console.error(error)

 }

}


const logsFiltrados=computed(()=>{

 return logs.value.filter(log=>{

   const cumpleBusqueda=
      !busqueda.value ||
      log.evento
       ?.toLowerCase()
       .includes(
          busqueda.value.toLowerCase()
       )


   const cumpleSeveridad=
      !filtroSeveridad.value ||
      log.severidad===filtroSeveridad.value


   return (
      cumpleBusqueda &&
      cumpleSeveridad
   )

 })

})


onMounted(
   cargarLogs
)
</script>


<style scoped>
.audit-panel{
padding:30px;
}

table{
width:100%;
border-collapse:collapse;
}

th,td{
padding:12px;
border:1px solid #ccc;
}

.filters{
display:flex;
gap:20px;
margin-bottom:20px;
}
</style>