import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import { MotionPlugin } from '@vueuse/motion'
import VWave from 'v-wave'

createApp(App)
  .use(router)
  .use(MotionPlugin)
  .use(VWave)
  .mount('#app')