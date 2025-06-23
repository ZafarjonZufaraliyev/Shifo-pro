import { createRouter, createWebHistory } from 'vue-router'

// Sahifalarni va layoutlarni import qilish
import Login from '@/views/Login.vue'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import MiniAdminLayout from '@/layouts/MiniAdminLayout.vue'

import SuperDashboard from '@/views/SuperDashboard.vue'
import MiniDashboard from '@/views/MiniDashboard.vue'
import Bemorlar from '@/components/Bemorlar.vue'
import Rooms from '@/components/Rooms.vue'
import Stats from '@/components/Stats.vue'
import RoyxatgaOlish from '@/views/RoyxatgaOlish.vue'
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
        path: '/RoyxatgaOlish',
        name: 'RoyxatgaOlish',
        component: RoyxatgaOlish
      },

  // Super admin marshrutlari
  {
    path: '/super',
    component: SuperAdminLayout,
    meta: { role: 'super' },
    children: [
      {
        path: '',
        name: 'SuperDashboard',
        component: SuperDashboard
      },
      {
        path: 'bemorlar',
        name: 'SuperBemorlar',
        component: Bemorlar
      },
      {
        path: 'rooms',
        name: 'SuperRooms',
        component: Rooms
      },
      {
        path: 'stats',
        name: 'SuperStats',
        component: Stats
      },
      
    ]
  },

  // Mini admin marshrutlari
  {
    path: '/mini',
    component: MiniAdminLayout,
    meta: { role: 'mini' },
    children: [
      {
        path: '',
        name: 'MiniDashboard',
        component: MiniDashboard
      },
      {
        path:"bemorlar",
        name:"MiniBemorlar",
        component:Bemorlar
      },
      {
        path:"rooms",
        name:"MiniRooms",
        component:Rooms
      },
      {
        path: 'stats',
        name: 'MiniStats',
        component: Stats
      } ,
      
      // agar mini uchun bemorlar bo‘lsa, shu yerga qo‘shish mumkin
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global guard - role asosida sahifaga kirishni cheklash
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role')
  if (to.meta.role && to.meta.role !== role) {
    next('/login')
  } else {
    next()
  }
})

export default router
