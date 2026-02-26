import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/works',
    name: 'Works',
    component: () => import('@/views/Works.vue')
  },
  {
    path: '/works/:id',
    name: 'WorkDetail',
    component: () => import('@/views/WorkDetail.vue')
  },
  {
    path: '/episodes',
    name: 'Episodes',
    component: () => import('@/views/Episodes.vue')
  },
  {
    path: '/episodes/:id',
    name: 'EpisodeDetail',
    component: () => import('@/views/EpisodeDetail.vue')
  },
  {
    path: '/episodes/:id/edit',
    name: 'EpisodeEdit',
    component: () => import('@/views/EpisodeEdit.vue')
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('@/views/Materials.vue')
  },
  {
    path: '/styles',
    name: 'Styles',
    component: () => import('@/views/Styles.vue')
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('@/views/Tools.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
