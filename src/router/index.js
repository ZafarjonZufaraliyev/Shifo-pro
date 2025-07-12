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

//Oshxona

import OshxonaLayout from "@/layouts/OshxonaLayout.vue";
import OshxonaDashboard from "@/views/OshxonaDashboard.vue";
import RetseptOshxonaOshxona from "@/components/RetseptOshxona.vue";
import ChiqimOshxona from "@/components/ChiqimOshxona.vue";
import MaxsulotlarOshxona from "@/components/MaxsulotlarOshxona.vue";

// Ombor

import OmborChiqim from "@/components/OmborChiqim.vue";
import OmborKirim from "@/components/OmborKirim.vue";
import OmborMaxsulotlar from "@/components/OmborMaxsulotlar.vue";
import OmborLayout from "@/layouts/OmborLayout.vue";
import OmborDashboard from "@/views/OmborDashboard.vue";

//Col Markaz


import ColMarkazDashboard from "@/views/ColMarkazDashboard.vue";
import ColMarkazLayout from "@/layouts/ColMarkazLayout.vue";


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
      {
        path: "RegisterPage",
        name: "adminRegisterPage",
        component: RegisterPage,
      },
      {
        path: "taklif/:clientId",
        name: "adminTakliflar",
        component: Takliflar,
        props: true,
      },
      { 
        path: "retseptOshxona", 
        name: "AdminKirimOshxona", 
        component: RetseptOshxonaOshxona 
      },
      {
        path: "chiqimOshxona",
        name: "AdminchiqimOshxona",
        component: ChiqimOshxona,
      },
      {
        path: "maxsulotlarOshxona",
        name: "AdminmaxsulotlarOshxona",
        component: MaxsulotlarOshxona,
      },
       {
      path: "omborMaxsulotlar",
      name: "adminOmborMaxsulotlar",
      component: OmborMaxsulotlar,
    },
    {
      path: "omborKirim",
      name: "adminOmborKirim",
      component: OmborKirim,
    },
    {
      path: "omborChiqim",
      name: "adminOmborChiqim",
      component: OmborChiqim,
    },
    ],
  },

  // MINI
  {
    path: "/mini",
    component: MiniAdminLayout,
    meta: { role: "kassa" },
    children: [
      { path: "", name: "MiniDashboard", component: MiniDashboard },
      { path: "BemorCard/:id", name: "miniBemor_card", component: Bemor_card },
      { path: "room/:id", name: "miniRoomDetails", component: RoomDetels },
      { path: "bemorlar", name: "MiniBemorlar", component: Bemorlar },
      { path: "rooms", name: "MiniRooms", component: Rooms },
      {
        path: "RegisterPage",
        name: "miniRegisterPage",
        component: RegisterPage,
      },
      { path: "taklif", name: "miniTakliflar", component: Takliflar },
      { path: "stats", name: "miniKassa", component: Stats },
    ],
  },
  //OSHXONA
  {
    path: "/oshxona",
    component: OshxonaLayout,
    meta: { role: "oshxona" },
    children: [
      { path: "", name: "OshxonaDashboard", component: OshxonaDashboard },
      { path: "retseptOshxona", name: "KirimOshxona", component: RetseptOshxonaOshxona },
      {
        path: "chiqimOshxona",
        name: "chiqimOshxona",
        component: ChiqimOshxona,
      },
      {
        path: "maxsulotlarOshxona",
        name: "maxsulotlarOshxona",
        component: MaxsulotlarOshxona,
      },
    ],
  },
  //OMBOR
  {
  path: "/ombor",
  component: OmborLayout,
  meta: { role: "ombor" },
  children: [
    { path: "", name: "OmborDashboard", component: OmborDashboard },
    { path: "omborKirim", name: "omborKirim", component: OmborKirim },
    { path: "omborChiqim", name: "omborChiqim", component: OmborChiqim },
    { path: "omborMaxsulotlar", name: "omborMaxsulotlar", component: OmborMaxsulotlar },
  ]
  },
  {
    path: "/callCenter",
    component: ColMarkazLayout,
    meta: { role: "call_center" },
    children: [
      { path: "", name: "ColMarkazDashboard", component: ColMarkazDashboard },
      { path: "roomsCallCenter", name: "roomsCallCenter", component: Rooms },
      
    ],
  },
  //CAL MARKAZ
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
