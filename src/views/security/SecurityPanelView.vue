<template>
  <div>

    <StaffNavbar
      homeRoute="/panel-seguridad"
      profileRoute="/perfil_admin"
    />

    <div class="security-page-shell">
      <StaffOptionsPanel profileRoute="/perfil_admin" />

      <div class="security-content-wrap">
        <div class="security-panel-card">
          <h2>Panel de seguridad</h2>
          <p>
            Desde este panel puedes gestionar usuarios, roles y las políticas de contraseña del sistema.
          </p>
        </div>
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

.security-page-shell {
  padding: 170px 24px 24px;
}

.security-content-wrap {
  width: 100%;
}

.security-panel-card {
  width: 100%;
  max-width: 1120px;
  background: #f4f4f4;
  border-radius: 22px;
  padding: 28px 32px;
}

.security-panel-card h2 {
  margin: 0 0 10px;
  color: #192847;
}
.options-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 0;
  margin-bottom: 26px;
}
</style>