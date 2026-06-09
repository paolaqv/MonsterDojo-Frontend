import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { LoadingPlugin } from 'vue-loading-overlay'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'vue-loading-overlay/dist/css/index.css'
import '@fontsource/baloo-bhai-2/400.css'
import '@fontsource/baloo-bhai-2/600.css'
import '@fontsource/baloo-bhai-2/700.css'
import '@fontsource/bangers/400.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

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