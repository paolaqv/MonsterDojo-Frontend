<template>
  <div>
    <StaffNavbar homeRoute="/panel-seguridad" profileRoute="/perfil_admin" />

    <div class="container">
      <StaffOptionsPanel profileRoute="/perfil_admin" />
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/adminpanel.css'
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
</script>