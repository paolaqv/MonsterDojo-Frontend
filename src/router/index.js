import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/game-menu',
    name: 'game-menu',
    component: GameMenuView,
  },
  {
    path: '/adminpanel',
    name: 'adminpanel',
    component: AdminPanelView,
  },
  {
    path: '/agregar-pedido',
    name: 'agregar-pedido',
    component: AddOrderView,
  },
  {
    path: '/editar-reserva/:id',
    name: 'editar-reserva',
    component: EditReservationView,
    props: true,
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorView,
  },
  {
    path: '/food-menu',
    name: 'food-menu',
    component: FoodMenuView,
  },
  {
    path: '/food_panel',
    name: 'food_panel',
    component: FoodPanelView,
  },
  {
    path: '/form-reserva',
    name: 'form-reserva',
    component: ReservationFormView,
  },
  {
    path: '/inicio_usuario',
    name: 'inicio_usuario',
    component: UserHomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/new_password',
    name: 'new_password',
    component: NewPasswordView,
  },
  {
    path: '/pedidos_panel',
    name: 'pedidos_panel',
    component: OrdersPanelView,
  },
  {
    path: '/perfil_admin',
    name: 'perfil_admin',
    component: AdminProfileView,
  },
  {
    path: '/perfil_user',
    name: 'perfil_user',
    component: UserProfileView,
  },
  {
    path: '/carrito',
    name: 'carrito',
    component: ShoppingCartPopup,
  },
  {
    path: '/receipt_pedido',
    name: 'receipt_pedido',
    component: OrderReceiptView,
  },
  {
    path: '/receipt_pedidoUser',
    name: 'receipt_pedidoUser',
    component: UserOrderReceiptView,
  },
  {
    path: '/receipt',
    name: 'receipt',
    component: ReservationReceiptView,
  },
  {
    path: '/receipt/:id',
    name: 'receipt-reserva',
    component: ReservationReceiptView,
    props: true,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/registro_mesa',
    name: 'registro_mesa',
    component: RegisterTableView,
  },
  {
    path: '/reserva-active',
    name: 'reserva-active',
    component: ActiveReservationView,
  },
  {
    path: '/reservas_panel',
    name: 'reservas_panel',
    component: ReservationsPanelView,
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
    path: '/sin_reserva',
    name: 'sin_reserva',
    component: NoActiveReservationView,
  },
  {
    path: '/user_reservation',
    name: 'user_reservation',
    component: UserReservationView,
  },
  {
    path: '/ver_pedidos',
    name: 'ver_pedidos',
    component: UserOrdersView,
  },
  {
    path: '/userspanel',
    name: 'userspanel',
    component: UsersPanelView,
  },
  {
    path: '/ver_Mispedidos',
    name: 'ver_Mispedidos',
    component: MyOrdersView,
  },
  {
    path: '/verDetalle-pedido',
    name: 'verDetalle-pedido',
    component: OrderDetailView,
  },
  {
    path: '/verDetalle-reserva/:id',
    name: 'verDetalle-reserva',
    component: ReservationDetailsView,
    props: true,
  },
  {
    path: '/verify_security_question',
    name: 'verify_security_question',
    component: VerifySecurityQuestionView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router