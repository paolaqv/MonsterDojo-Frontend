<script setup>
import { computed, reactive, watch } from 'vue'
import {
  ShieldCheck,
  X,
  Users,
  ClipboardList,
  Package,
  Gamepad2,
  Armchair,
  CalendarCheck2,
  Sparkles,
  CheckCircle2,
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  roleData: {
    type: Object,
    default: () => null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const currentStep = reactive({ value: 0 })

const roleForm = reactive({
  id_rol: '',
  nombre: '',
  activo: true,
  accesos: {
    verUsuarios: false,
    gestionarUsuariosRoles: false,

    verPedidos: false,
    gestionarPedidos: false,

    verProductos: false,
    gestionarProductos: false,

    verJuegos: false,
    gestionarJuegos: false,

    verMesas: false,
    gestionarMesas: false,

    verReservas: false,
    crearReservas: false,
    gestionarReservas: false,
  },
})

const resetForm = () => {
  roleForm.id_rol = ''
  roleForm.nombre = ''
  roleForm.activo = true

  Object.keys(roleForm.accesos).forEach((key) => {
    roleForm.accesos[key] = false
  })

  currentStep.value = 0
}

const applyRoleData = () => {
  if (!props.roleData) {
    resetForm()
    return
  }

  roleForm.id_rol = props.roleData.id_rol || ''
  roleForm.nombre = props.roleData.nombre || ''
  roleForm.activo = props.roleData.activo ?? true

Object.keys(roleForm.accesos).forEach((key) => {
  roleForm.accesos[key] = false
})

const permissionMap = {
  ver_usuarios: 'verUsuarios',
  gestionar_usuarios_roles: 'gestionarUsuariosRoles',
  ver_pedidos_detalle: 'verPedidos',
  gestionar_pedidos: 'gestionarPedidos',
  ver_productos: 'verProductos',
  gestionar_productos: 'gestionarProductos',
  ver_juegos: 'verJuegos',
  gestionar_juegos: 'gestionarJuegos',
  ver_mesas: 'verMesas',
  gestionar_mesas: 'gestionarMesas',
  ver_reservas_detalle: 'verReservas',
  crear_reservas: 'crearReservas',
  gestionar_reservas: 'gestionarReservas',
}

;(props.roleData.permisos || []).forEach((permiso) => {
  const localKey = permissionMap[permiso]
  if (localKey) {
    roleForm.accesos[localKey] = true
  }
})

  currentStep.value = 0
}

watch(
  () => props.show,
  (value) => {
    if (value) applyRoleData()
  }
)

watch(() => roleForm.accesos.gestionarUsuariosRoles, (value) => {
  if (value) roleForm.accesos.verUsuarios = true
})
watch(() => roleForm.accesos.gestionarPedidos, (value) => {
  if (value) roleForm.accesos.verPedidos = true
})
watch(() => roleForm.accesos.gestionarProductos, (value) => {
  if (value) roleForm.accesos.verProductos = true
})
watch(() => roleForm.accesos.gestionarJuegos, (value) => {
  if (value) roleForm.accesos.verJuegos = true
})
watch(() => roleForm.accesos.gestionarMesas, (value) => {
  if (value) roleForm.accesos.verMesas = true
})
watch(() => roleForm.accesos.gestionarReservas, (value) => {
  if (value) roleForm.accesos.verReservas = true
             roleForm.accesos.crearReservas = true

})

const selectedAccesses = computed(() => {
  const labels = []

  if (roleForm.accesos.verUsuarios) labels.push('Ver usuarios')
  if (roleForm.accesos.gestionarUsuariosRoles) labels.push('Gestión de usuarios y roles')

  if (roleForm.accesos.verPedidos) labels.push('Ver pedidos y detalles')
  if (roleForm.accesos.gestionarPedidos) labels.push('Gestión de pedidos')

  if (roleForm.accesos.verProductos) labels.push('Ver productos')
  if (roleForm.accesos.gestionarProductos) labels.push('Gestión de productos')

  if (roleForm.accesos.verJuegos) labels.push('Ver juegos')
  if (roleForm.accesos.gestionarJuegos) labels.push('Gestión de juegos')

  if (roleForm.accesos.verMesas) labels.push('Ver mesas')
  if (roleForm.accesos.gestionarMesas) labels.push('Gestión de mesas')

  if (roleForm.accesos.verReservas) labels.push('Ver reservas y detalles')
  if (roleForm.accesos.crearReservas) labels.push('Crear reservas')
  if (roleForm.accesos.gestionarReservas) labels.push('Gestión de reservas')

  return labels
})

const summaryByModule = computed(() => {
  const a = roleForm.accesos

  return [
    {
      title: 'Usuarios y roles',
      icon: Users,
      value: a.gestionarUsuariosRoles ? 'Gestión' : a.verUsuarios ? 'Ver' : 'Sin acceso',
    },
    {
      title: 'Pedidos',
      icon: ClipboardList,
      value: a.gestionarPedidos ? 'Gestión' : a.verPedidos ? 'Ver' : 'Sin acceso',
    },
    {
      title: 'Productos',
      icon: Package,
      value: a.gestionarProductos ? 'Gestión' : a.verProductos ? 'Ver' : 'Sin acceso',
    },
    {
      title: 'Juegos',
      icon: Gamepad2,
      value: a.gestionarJuegos ? 'Gestión' : a.verJuegos ? 'Ver' : 'Sin acceso',
    },
    {
      title: 'Mesas',
      icon: Armchair,
      value: a.gestionarMesas ? 'Gestión' : a.verMesas ? 'Ver' : 'Sin acceso',
    },
    {
      title: 'Reservas',
      icon: CalendarCheck2,
      value: a.gestionarReservas ? 'Gestión'  : a.crearReservas
          ? 'Crear' : a.verReservas ? 'Ver' : 'Sin acceso',
    },
  ]
})

const canGoNext = computed(() => {
  if (currentStep.value === 0) {
    return roleForm.id_rol.trim() !== '' && roleForm.nombre.trim() !== ''
  }

  if (currentStep.value === 1) {
    return Object.values(roleForm.accesos).some(Boolean)
  }

  return true
})

const moduleIsActive = (type) => {
  if (type === 'usuarios') {
    return roleForm.accesos.verUsuarios || roleForm.accesos.gestionarUsuariosRoles
  }
  if (type === 'pedidos') {
    return roleForm.accesos.verPedidos || roleForm.accesos.gestionarPedidos
  }
  if (type === 'productos') {
    return roleForm.accesos.verProductos || roleForm.accesos.gestionarProductos
  }
  if (type === 'juegos') {
    return roleForm.accesos.verJuegos || roleForm.accesos.gestionarJuegos
  }
  if (type === 'mesas') {
    return roleForm.accesos.verMesas || roleForm.accesos.gestionarMesas
  }
  if (type === 'reservas') {
    return roleForm.accesos.verReservas ||     roleForm.accesos.crearReservas ||
    roleForm.accesos.gestionarReservas
  }
  return false
}

const nextStep = () => {
  if (currentStep.value === 0) {
    if (!roleForm.id_rol.trim() || !roleForm.nombre.trim()) {
      return
    }
  }

  if (currentStep.value === 1) {
    const hasAnyAccess = Object.values(roleForm.accesos).some(Boolean)
    if (!hasAnyAccess) {
      return
    }
  }

  if (currentStep.value < 2) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const closePopup = () => {
  resetForm()
  emit('close')
}

watch(
  () => props.roleData,
  () => {
    if (props.show) applyRoleData()
  },
  { deep: true }
)
const saveRole = () => {
  emit('save', JSON.parse(JSON.stringify(roleForm)))
}
</script>

<template>
  <div v-if="show" class="role-popup-overlay">
    <div
      v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 350 } }"
      class="role-popup role-popup-enhanced"
    >
      <div class="role-popup-header role-popup-header-enhanced">
        <div class="role-popup-title-wrap">
          <div class="role-popup-icon">
            <ShieldCheck :size="24" />
          </div>
          <div>
            <h2>{{ isEditing ? 'Editar rol' : 'Nuevo rol' }}</h2>
            <p>Configura identidad, accesos y resumen del rol en un flujo guiado.</p>
          </div>
        </div>

        <button v-wave class="close-btn" type="button" @click="closePopup">
          <X :size="18" />
        </button>
      </div>

      <div class="role-stepper role-stepper-enhanced">
        <div class="role-step" :class="{ active: currentStep.value === 0, done: currentStep.value > 0 }">
          <span>1</span>
          <p>Datos básicos</p>
        </div>
        <div class="role-step-line" :class="{ active: currentStep.value > 0 }"></div>
        <div class="role-step" :class="{ active: currentStep.value === 1, done: currentStep.value > 1 }">
          <span>2</span>
          <p>Accesos</p>
        </div>
        <div class="role-step-line" :class="{ active: currentStep.value > 1 }"></div>
        <div class="role-step" :class="{ active: currentStep.value === 2 }">
          <span>3</span>
          <p>Resumen</p>
        </div>
      </div>

      <div class="role-popup-body">
        <div class="role-popup-main">
          <div
            v-show="currentStep.value === 0"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 260 } }"
            class="role-step-panel"
          >
            <div class="form-group">
              <label for="role_id">ID Rol</label>
              <input
                id="role_id"
                v-model="roleForm.id_rol"
                type="text"
                :readonly="isEditing"
                placeholder="Ej: encargadoSeguridad"
              />
            </div>

            <div class="form-group">
              <label for="role_name">Nombre</label>
              <input
                id="role_name"
                v-model="roleForm.nombre"
                type="text"
                placeholder="Ej: Encargado de Seguridad"
              />
            </div>

            <div class="form-group switch-row modern-switch-row">
              <label for="role_active">Activo</label>
              <label class="modern-switch">
                <input id="role_active" v-model="roleForm.activo" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div
            v-show="currentStep.value === 1"
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 260 } }"
            class="role-step-panel"
          >
            <div class="permission-grid">
              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('usuarios') }"
              >
                <div class="permission-card-head">
                  <Users :size="18" />
                  <h4>Usuarios y roles</h4>
                </div>
                <p class="permission-description">Control de acceso y gestión del personal.</p>
                <label><input v-model="roleForm.accesos.verUsuarios" type="checkbox" /> Ver usuarios</label>
                <label><input v-model="roleForm.accesos.gestionarUsuariosRoles" type="checkbox" /> Gestión de usuarios y roles</label>
              </div>

              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('pedidos') }"
              >
                <div class="permission-card-head">
                  <ClipboardList :size="18" />
                  <h4>Pedidos</h4>
                </div>
                <p class="permission-description">Seguimiento y administración del flujo de pedidos.</p>
                <label><input v-model="roleForm.accesos.verPedidos" type="checkbox" /> Ver pedidos y detalles</label>
                <label><input v-model="roleForm.accesos.gestionarPedidos" type="checkbox" /> Gestión de pedidos</label>
              </div>

              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('productos') }"
              >
                <div class="permission-card-head">
                  <Package :size="18" />
                  <h4>Productos</h4>
                </div>
                <p class="permission-description">Visualización y control del catálogo de productos.</p>
                <label><input v-model="roleForm.accesos.verProductos" type="checkbox" /> Ver productos</label>
                <label><input v-model="roleForm.accesos.gestionarProductos" type="checkbox" /> Gestión de productos</label>
              </div>

              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('juegos') }"
              >
                <div class="permission-card-head">
                  <Gamepad2 :size="18" />
                  <h4>Juegos</h4>
                </div>
                <p class="permission-description">Acceso al catálogo y administración de juegos.</p>
                <label><input v-model="roleForm.accesos.verJuegos" type="checkbox" /> Ver juegos</label>
                <label><input v-model="roleForm.accesos.gestionarJuegos" type="checkbox" /> Gestión de juegos</label>
              </div>

              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('mesas') }"
              >
                <div class="permission-card-head">
                  <Armchair :size="18" />
                  <h4>Mesas</h4>
                </div>
                <p class="permission-description">Consulta y administración de espacios del local.</p>
                <label><input v-model="roleForm.accesos.verMesas" type="checkbox" /> Ver mesas</label>
                <label><input v-model="roleForm.accesos.gestionarMesas" type="checkbox" /> Gestión de mesas</label>
              </div>

              <div
                v-wave
                class="permission-card interactive-card"
                :class="{ active: moduleIsActive('reservas') }"
              >
                <div class="permission-card-head">
                  <CalendarCheck2 :size="18" />
                  <h4>Reservas</h4>
                </div>
                <p class="permission-description">Consulta y administración de reservas del sistema.</p>
                <label><input v-model="roleForm.accesos.verReservas" type="checkbox" /> Ver reservas y detalles</label>
                <label>
                <input v-model="roleForm.accesos.crearReservas" type="checkbox" />Crear reservas</label>
                <label><input v-model="roleForm.accesos.gestionarReservas" type="checkbox" /> Gestión de reservas</label>
              </div>
            </div>
          </div>

          <div
            v-show="currentStep.value === 2"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 260 } }"
            class="role-step-panel"
          >
            <div class="summary-list">
              <div v-for="item in summaryByModule" :key="item.title" class="summary-item enhanced-summary-item">
                <div class="summary-item-left">
                  <component :is="item.icon" :size="18" />
                  <span>{{ item.title }}</span>
                </div>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="role-popup-summary">
          <div class="role-preview-card role-preview-card-enhanced">
            <div class="preview-top">
              <div>
                <h3>{{ roleForm.nombre || 'Nuevo rol' }}</h3>
                <p><strong>ID:</strong> {{ roleForm.id_rol || '-' }}</p>
              </div>
              <Sparkles :size="22" />
            </div>

            <div class="preview-metrics">
              <div class="preview-metric">
                <span>Estado</span>
                <strong :class="roleForm.activo ? 'badge-active' : 'badge-inactive'">
                  {{ roleForm.activo ? 'Activo' : 'Inactivo' }}
                </strong>
              </div>
              <div class="preview-metric">
                <span>Permisos</span>
                <strong>{{ selectedAccesses.length }}</strong>
              </div>
            </div>
          </div>

          <div class="summary-chips">
            <span v-for="access in selectedAccesses" :key="access" class="summary-chip">
              <CheckCircle2 :size="14" />
              {{ access }}
            </span>
            <span v-if="selectedAccesses.length === 0" class="summary-empty">
              Aún no se seleccionaron accesos
            </span>
          </div>
        </div>
      </div>

      <div class="role-popup-actions">
        <button v-wave type="button" class="secondary-btn" @click="closePopup">Cancelar</button>
        <button v-if="currentStep.value > 0" v-wave type="button" class="secondary-btn" @click="prevStep">
          Anterior
        </button>
        <button
          v-if="currentStep.value < 2"
          v-wave
          type="button"
          class="primary-btn"
          :disabled="!canGoNext"
          @click="nextStep"
        >
          Siguiente
        </button>
        <button
          v-else
          v-wave
          type="button"
          class="primary-btn"
          :disabled="selectedAccesses.length === 0"
          @click="saveRole"
        >
          Guardar rol
        </button>
      </div>
    </div>
  </div>
</template>