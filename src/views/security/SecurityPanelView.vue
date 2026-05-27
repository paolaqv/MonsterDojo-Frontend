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
            Desde este panel puedes gestionar usuarios, roles, las políticas de contraseña del sistema y las herramientas de análisis de riesgo.
          </p>
        </div>
        
        <div class="dashboard-cards">
          <router-link
            v-if="hasPermission('ver_auditoria')"
            to="/auditoria"
            class="audit-button"
          >
            <span class="audit-icon">🛡</span>
            <div class="audit-text">
              <strong>Bitácora de Auditoría</strong>
              <small>Consultar eventos críticos y registros del sistema</small>
            </div>
            <span class="audit-arrow">→</span>
          </router-link>

          <router-link
              v-if="hasPermission('ver_auditoria')"
              to="/analisis-riesgos"
              class="audit-button risk-button"
            >
            <span class="audit-icon">📊</span>
            <div class="audit-text">
              <strong>Análisis de riesgo</strong>
              <small>Gestión de activos, riesgos y mitigaciones</small>
            </div>
            <span class="audit-arrow">→</span>
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/adminpanel.css'
import { usePermissions } from '@/composables/usePermissions'
const { hasPermission } = usePermissions()
import StaffNavbar from '@/components/navigation/StaffNavbar.vue'
import StaffOptionsPanel from '@/components/navigation/StaffOptionsPanel.vue'
</script>

<style scoped>
/* Contenedor en forma de cuadrícula/flex para ambos botones */
.dashboard-cards {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.audit-button {
  flex: 1;
  min-width: 320px;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 28px;
  background: linear-gradient(135deg, #192847, #243a66);
  color: white;
  text-decoration: none;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  transition: .25s ease;
}

/* Tono sutilmente diferente para diferenciar el botón de Riesgos */
.risk-button {
  background: linear-gradient(135deg, #1f3156, #2a437a);
}

.audit-button:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 14px 30px rgba(0,0,0,.24);
}

.audit-icon {
  font-size: 34px;
  flex-shrink: 0;
}

.audit-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
}

.audit-text strong {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.audit-text small {
  margin-top: 6px;
  font-size: 14px;
  opacity: .85;
}

.audit-arrow {
  font-size: 30px;
  font-weight: bold;
  opacity: .9;
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
  margin: 0 auto;
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

/* Responsividad para móviles: Pone un botón debajo del otro */
@media (max-width: 768px) {
  .dashboard-cards {
    flex-direction: column;
    align-items: center;
  }
  .audit-button {
    width: 100%;
  }
}
</style>