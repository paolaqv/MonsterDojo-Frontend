import { createRouter, createWebHistory } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
import GameMenuView from '@/views/games/GameMenuView.vue'
import AdminPanelView from '@/views/admin/AdminPanelView.vue'
import AddOrderView from '@/views/orders/AddOrderView.vue'
import EditReservationView from '@/views/reservations/EditReservationView.vue'
import ErrorView from '@/components/common/ErrorView.vue'
import FoodMenuView from '@/views/products/FoodMenuView.vue'
import FoodPanelView from '@/views/products/FoodPanelView.vue'
import ReservationFormView from '@/views/reservations/ReservationFormView.vue'
import UserHomeView from '@/views/user/UserHomeView.vue'
import HomeView from '@/components/common/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import NewPasswordView from '@/views/auth/NewPasswordView.vue'
import OrdersPanelView from '@/views/orders/OrdersPanelView.vue'
import AdminProfileView from '@/views/admin/AdminProfileView.vue'
import UserProfileView from '@/views/user/UserProfileView.vue'
import ShoppingCartPopup from '@/components/popups/ShoppingCartPopup.vue'
import OrderReceiptView from '@/views/orders/OrderReceiptView.vue'
import UserOrderReceiptView from '@/views/orders/UserOrderReceiptView.vue'
import ReservationReceiptView from '@/views/reservations/ReservationReceiptView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import RegisterTableView from '@/views/reservations/RegisterTableView.vue'
import ActiveReservationView from '@/views/reservations/ActiveReservationView.vue'
import ReservationsPanelView from '@/views/reservations/ReservationsPanelView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import ResetSecurityQuestionView from '@/views/auth/ResetSecurityQuestionView.vue'
import NoActiveReservationView from '@/views/reservations/NoActiveReservationView.vue'
import UserReservationView from '@/views/reservations/UserReservationView.vue'
import UserOrdersView from '@/views/orders/UserOrdersView.vue'
import UsersPanelView from '@/views/admin/UsersPanelView.vue'
import MyOrdersView from '@/views/orders/MyOrdersView.vue'
import OrderDetailView from '@/views/orders/OrderDetailView.vue'
import ReservationDetailsView from '@/views/reservations/ReservationDetailsView.vue'
import VerifySecurityQuestionView from '@/views/auth/VerifySecurityQuestionView.vue'
import SecurityPanelView from '@/views/security/SecurityPanelView.vue'
import WaiterPanelView from '@/views/mesero/WaiterPanelView.vue'
import GamePanelView from '@/views/games/GamePanelView.vue'
import ReservationsAdminPanelView from '@/views/reservations/ReservationsAdminPanelView.vue'
import AuditPanelView from "@/views/security/AuditPanelView.vue"
import PasswordPolicyView from '@/views/security/PasswordPolicyView.vue'
import ChangeRequiredPasswordView from '@/views/auth/ChangeRequiredPasswordView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorView,
  },

  // --------- vistas públicas / generales ----------
  {
    path: '/food-menu',
    name: 'food-menu',
    component: FoodMenuView,
  },
  {
    path: '/game-menu',
    name: 'game-menu',
    component: GameMenuView,
  },

  // --------- paneles base por rol ----------
  {
    path: '/inicio_usuario',
    name: 'inicio_usuario',
    component: UserHomeView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/adminpanel',
    name: 'adminpanel',
    component: AdminPanelView,
    meta: { roles: ['encargadoLocal'] },
  },
  {
    path: '/panel-seguridad',
    name: 'panel-seguridad',
    component: SecurityPanelView,
    meta: { roles: ['encargadoSeguridad'] },
  },
  {
 path:"/auditoria",
 name:"auditPanel",
 component:AuditPanelView,
 meta: { roles: ['encargadoSeguridad'] },
},
  {
    path: '/panel-mesero',
    name: 'panel-mesero',
    component: WaiterPanelView,
    meta: { roles: ['mesero'] },
  },

  // --------- perfiles ----------
  {
    path: '/perfil_admin',
    name: 'perfil_admin',
    component: AdminProfileView,
    meta: { roles: ['encargadoLocal', 'encargadoSeguridad', 'mesero'] },
  },
  {
    path: '/perfil_user',
    name: 'perfil_user',
    component: UserProfileView,
    meta: { roles: ['cliente'] },
  },

  // --------- módulo seguridad ----------
  {
    path: '/userspanel',
    name: 'userspanel',
    component: UsersPanelView,
    meta: { permissions: ['ver_usuarios'] },
  },

    {
    path: '/politicas-contrasena',
    name: 'politicas-contrasena',
    component: PasswordPolicyView,
    meta: { roles: ['encargadoSeguridad'] },
  },
  {
    path: '/change-required-password',
    name: 'change-required-password',
    component: ChangeRequiredPasswordView,
  },

  // --------- operación ----------
  {
    path: '/food_panel',
    name: 'food_panel',
    component: FoodPanelView,
    meta: { permissions: ['ver_productos'] },
  },
  {
    path: '/game_panel',
    name: 'game_panel',
    component: GamePanelView,
    meta: { permissions: ['ver_juegos'] },
  },
  {
    path: '/pedidos_panel',
    name: 'pedidos_panel',
    component: OrdersPanelView,
    props: true,
    meta: { permissions: ['ver_pedidos_detalle'] },
  },
  {
    path: '/reservas_panel',
    name: 'reservas_panel',
    component: ReservationsAdminPanelView,
    meta: { permissions: ['ver_reservas_detalle'] },
  },
  {
    path: '/registro_mesa',
    name: 'registro_mesa',
    component: RegisterTableView,
    meta: { permissions: ['ver_mesas'] },
  },

  // --------- cliente / reservas ----------
  {
    path: '/form-reserva',
    name: 'form-reserva',
    component: ReservationFormView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/user_reservation',
    name: 'user_reservation',
    component: UserReservationView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/reservas_panelUser',
    name: 'reservas_panelUser',
    component: ReservationsPanelView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/reserva-active',
    name: 'reserva-active',
    component: ActiveReservationView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/sin_reserva',
    name: 'sin_reserva',
    component: NoActiveReservationView,
    meta: { roles: ['cliente'] },
  },

  // --------- cliente / pedidos ----------
  {
    path: '/ver_pedidos',
    name: 'ver_pedidos',
    component: UserOrdersView,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/ver_Mispedidos',
    name: 'ver_Mispedidos',
    component: MyOrdersView,
    meta: { roles: ['cliente'] },
  },

  // --------- detalles / edición ----------
  {
    path: '/agregar-pedido',
    name: 'agregar-pedido',
    component: AddOrderView,
    meta: { permissions: ['gestionar_pedidos'] },
  },
  {
    path: '/editar-reserva/:id',
    name: 'editar-reserva',
    component: EditReservationView,
    props: true,
    meta: { roles: ['cliente'] },
  },
  {
    path: '/verDetalle-pedido/:id',
    name: 'verDetalle-pedido',
    component: OrderDetailView,
    props: true,
    meta: { permissions: ['ver_pedidos_detalle'] },
  },
  {
    path: '/verDetalle-reserva/:id',
    name: 'verDetalle-reserva',
    component: ReservationDetailsView,
    props: true,
    meta: { permissions: ['ver_reservas_detalle'] },
  },

  // --------- recibos ----------
  {
    path: '/receipt_pedido/:id',
    name: 'receipt_pedido',
    component: OrderReceiptView,
    props: true,
    meta: { permissions: ['ver_pedidos_detalle'] },
  },
  {
    path: '/receipt_pedidoUser/:id',
    name: 'receipt_pedidoUser',
    component: UserOrderReceiptView,
    props: true,
    meta: { permissions: ['ver_pedidos_detalle'] },
  },
  {
    path: '/receipt',
    name: 'receipt',
    component: ReservationReceiptView,
    meta: { permissions: ['ver_reservas_detalle'] },
  },
  {
    path: '/receipt/:id',
    name: 'receipt-reserva',
    component: ReservationReceiptView,
    props: true,
    meta: { permissions: ['ver_reservas_detalle'] },
  },

  // --------- auth recovery ----------
  {
    path: '/new_password',
    name: 'new_password',
    component: NewPasswordView,
  },
  {
    path: '/reset_password',
    name: 'reset_password',
    component: ResetPasswordView,
  },
  {
    path: '/reset_security_question',
    name: 'reset_security_question',
    component: ResetSecurityQuestionView,
  },
  {
    path: '/verify_security_question',
    name: 'verify_security_question',
    component: VerifySecurityQuestionView,
  },
  // --------- misc ----------
  {
    path: '/carrito',
    name: 'carrito',
    component: ShoppingCartPopup,
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: () => {
      const authStore = useAuthStore()
      authStore.clearSession()
      return '/login'
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')

  const needsRoles = to.meta?.roles
  const needsPermissions = to.meta?.permissions

  if (!needsRoles && !needsPermissions) {
    next()
    return
  }

  if (!token) {
    authStore.clearSession()
    next('/login')
    return
  }

 if (!authStore.user || !authStore.permissions.length) {
  try {
    await authStore.refreshCurrentUser()
  } catch (error) {
    authStore.clearSession()
    next('/login')
    return
  }
}

  if (!authStore.user) {
    next('/login')
    return
  }

  if (to.meta.roles) {
    const hasAllowedRole = to.meta.roles.includes(authStore.role)

    if (!hasAllowedRole) {
      await Swal.fire({
        title: 'Acceso denegado',
        text: 'No tienes permisos para ingresar a esta sección.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      next(authStore.getDefaultRouteByRole())
      return
    }
  }

  if (to.meta.permissions) {
    const hasAllPermissions = to.meta.permissions.every((permission) =>
      authStore.permissions.includes(permission)
    )

    if (!hasAllPermissions) {
      await Swal.fire({
        title: 'Acceso denegado',
        text: 'No tienes permisos para ingresar a esta sección.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      next(authStore.getDefaultRouteByRole())
      return
    }
  }

  next()
})

export default router
