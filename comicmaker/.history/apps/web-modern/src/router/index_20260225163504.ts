import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Materials from '../views/Materials.vue'

// 简单的占位组件
const Placeholder = { template: '<div style="padding: 20px"><h2>功能开发中...</h2></div>' }

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
    component: Placeholder
  },
  {
    path: '/styles',
    name: 'Styles',
    component: Placeholder
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Placeholder
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
