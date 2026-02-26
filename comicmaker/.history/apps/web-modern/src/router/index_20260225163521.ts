import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Materials from '../views/Materials.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/materials',
    name: 'Materials',
    component: Materials
  },
  {
    path: '/works',
    name: 'Works',
    component: { template: '<div style="padding: 20px"><h2>作品管理功能开发中...</h2></div>' }
  },
  {
    path: '/styles',
    name: 'Styles',
    component: { template: '<div style="padding: 20px"><h2>风格管理功能开发中...</h2></div>' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: { template: '<div style="padding: 20px"><h2>工具箱功能开发中...</h2></div>' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
