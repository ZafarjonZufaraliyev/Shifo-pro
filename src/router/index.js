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
    path: "/super",
    component: SuperAdminLayout,
    meta: { role: "super" },
    children: [
      { path: "", name: "SuperDashboard", component: SuperDashboard },
      { path: "BemorCard/:id", name: "supperBemor_card", component: Bemor_card },
      { path: "xodimlar", name: "SuperXodimlar", component: Xodimlar },
      { path: "room/:id", name: "superRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "SuperBemorlar", component: Bemorlar },
      { path: "rooms", name: "SuperRooms", component: Rooms },
      { path: "stats", name: "SuperKassa", component: Stats },
      { path: "RegisterPage", name: "superRegisterPage", component: RegisterPage },
      { path: "taklif", name: "superTakliflar", component: Takliflar },
    ],
  },

  // MINI
  {
    path: "/mini",
    component: MiniAdminLayout,
    meta: { role: "mini" },
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
