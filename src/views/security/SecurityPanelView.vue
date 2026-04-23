<template>
  <div>

    <StaffNavbar
      homeRoute="/panel-seguridad"
      profileRoute="/perfil_admin"
    />

    <div class="container">

      <StaffOptionsPanel
        profileRoute="/perfil_admin"
      />

      <!-- BOTON AUDITORIA -->
      <div class="audit-access">

        <router-link
          to="/security/auditoria"
          class="audit-button"
        >
          Ver Bitácora de Auditoría
        </router-link>

      </div>

    </div>

  </div>
</template>

<script setup>
import '@/assets/css/adminpanel.css'

import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
</script>

<style scoped>

.audit-access{
margin-top:30px;
display:flex;
justify-content:center;
}

.audit-button{

padding:14px 30px;

text-decoration:none;

border-radius:10px;

font-weight:bold;

transition:.3s;
}

.audit-button:hover{
transform:scale(1.03);
}

</style>