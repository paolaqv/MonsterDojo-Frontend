import { createRouter, createWebHistory } from 'vue-router'
import GameMenuView from '@/views/games/GameMenuView.vue'
import AdminPanelView from '@/views/admin/AdminPanelView.vue'
import AddOrderView from '@/views/orders/AddOrderView.vue'
import EditReservationView from '@/views/reservations/EditReservationView.vue'
import ErrorView from '@/views/common/ErrorView.vue'
import FoodMenuView from '@/views/products/FoodMenuView.vue'
import FoodPanelView from '@/views/products/FoodPanelView.vue'
import ReservationFormView from '@/views/reservations/ReservationFormView.vue'
const routes = [
  {
    path: '/',
    redirect: '/games',
  },
  {
    path: '/games-menu',
    name: 'games-menu',
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
    path: '/editar-reserva',
    name: 'editar-reserva',
    component: EditReservationView,
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
}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
}
)

export default router