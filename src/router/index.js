import { createRouter, createWebHistory } from "vue-router";

// Layout va sahifalar
import Login from "@/views/Login.vue";
import SuperAdminLayout from "@/layouts/SuperAdminLayout.vue";
import MiniAdminLayout from "@/layouts/MiniAdminLayout.vue";

import SuperDashboard from "@/views/SuperDashboard.vue";
import MiniDashboard from "@/views/MiniDashboard.vue";
import Bemorlar from "@/components/Bemorlar.vue";
import Rooms from "@/components/Rooms.vue";
import Stats from "@/components/Kassa.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import Takliflar from "@/views/Takliflar.vue";
import Bemor_card from "@/components/PatientCard.vue";
import RoomDetels from "@/components/RoomDetels.vue";
import TaklifDetelis from "@/components/TaklifDetelis.vue";
import Xodimlar from "@/components/Xodimlar.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/TaklifDetelis", name: "TaklifDetelis", component: TaklifDetelis },
  { path: "/login", component: Login, meta: { public: true } },

  // SUPER
  {
    path: "/admin",
    component: SuperAdminLayout,
    meta: { role: "admin" },
    children: [
      { path: "", name: "adminDashboard", component: SuperDashboard },
      { path: "BemorCard/:id", name: "adminBemor_card", component: Bemor_card },
      { path: "xodimlar", name: "adminXodimlar", component: Xodimlar },
      { path: "room/:id", name: "adminRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "adminBemorlar", component: Bemorlar },
      { path: "rooms", name: "adminRooms", component: Rooms },
      { path: "stats", name: "adminKassa", component: Stats },
      { path: "RegisterPage", name: "adminRegisterPage", component: RegisterPage },
   { path: "taklif/:clientId", name: "adminTakliflar", component: Takliflar, props: true, },

    ],
  },

  // MINI
  {
    path: "/mini",
    component: MiniAdminLayout,
    meta: { role: "kassir" },
    children: [
      { path: "", name: "MiniDashboard", component: MiniDashboard },
      { path: "BemorCard/:id", name: "miniBemor_card", component: Bemor_card },
      { path: "room/:id", name: "miniRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "MiniBemorlar", component: Bemorlar },
      { path: "rooms", name: "MiniRooms", component: Rooms },
      { path: "RegisterPage", name: "miniRegisterPage", component: RegisterPage },
      { path: "taklif", name: "miniTakliflar", component: Takliflar },
      { path: "stats", name: "miniKassa", component: Stats },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Route Guard
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  // Ochiq sahifalarga ruxsat
  if (to.meta.public) {
    return next();
  }

  // Agar sahifa rolega bog‘liq bo‘lsa, tekshir
  if (to.meta.role && to.meta.role !== role) {
    return next("/login");
  }

  next();
});

export default router;
