import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { LoadingPlugin } from 'vue-loading-overlay'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'vue-loading-overlay/dist/css/index.css'

import { MotionPlugin } from '@vueuse/motion'
import VWave from 'v-wave'

import { configureGlobalLoading } from '@/services/globalLoading'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)
app.use(VWave)
app.use(LoadingPlugin)

configureGlobalLoading(app.config.globalProperties.$loading)

app.mount('#app')