import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    props: {},
    meta: { title: 'Silvertransfert - outil de transfert de fichier volumineux gratuit' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  from;
  const title = to.meta.title as string;
  if (title) {
    document.title = title;
  }
  next();
});

export default router
