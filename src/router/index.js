import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gps from '../views/Gps.vue'
import Gyroscope from '../views/Gyroscope.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/gps',
    name: 'Gps',
    component: Gps
  },
  {
    path: '/gyroscope',
    name: 'Gyroscope',
    component: Gyroscope
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

