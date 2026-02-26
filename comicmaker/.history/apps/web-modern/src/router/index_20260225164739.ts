import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Materials from '../views/Materials.vue'
import Works from '../views/Works.vue'
import WorkDetail from '../views/WorkDetail.vue'
import EpisodeEdit from '../views/EpisodeEdit.vue'
import Styles from '../views/Styles.vue'
import Tools from '../views/Tools.vue'

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
    component: Works
  },
  {
    path: '/works/:id',
    name: 'WorkDetail',
    component: WorkDetail
  },
  {
    path: '/works/:workId/episodes/:episodeId',
    name: 'EpisodeEdit',
    component: EpisodeEdit
  },
  {
    path: '/styles',
    name: 'Styles',
    component: Styles
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools
  }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
