<template>
  <div :class="[{ dark: isDarkMode }, 'sidebar-wrapper']">
    <!-- 📱 Mobil hamburger -->
    <button v-if="!isDesktop" class="toggle-button" @click="toggleSidebar">☰</button>

    <!-- Overlay (mobil) -->
    <div v-if="isSidebarOpen && !isDesktop" class="overlay" @click="closeSidebar"></div>

    <!-- 🚀 Sidebar -->
    <nav :class="['sidebar', { open: isSidebarOpen || isDesktop, dark: isDarkMode }]">
      <!-- Logo va rejim tugmasi -->
      <div class="top-bar">
        <div class="logo">
          <img src="@/assets/image/logo.png" alt="Logo" />
          <h3>Koinot Kavsari</h3>
        </div>

        <button class="dark-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'Light mode' : 'Dark mode'">
          <span v-if="isDarkMode">🌞</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <!-- 📋 Asosiy linklar + accordion -->
      <ul class="primary-list">
        <li><router-link to="/admin" @click="closeSidebar">🏠 Bosh sahifa</router-link></li>
        <li><router-link to="/admin/bemorlar" @click="closeSidebar">Bemorlar</router-link></li>
        <li><router-link to="/admin/rooms" @click="closeSidebar">Xonalar</router-link></li>
        <li><router-link to="/admin/stats" @click="closeSidebar">Kassa</router-link></li>
        <li><router-link to="/admin/xodimlar" @click="closeSidebar">Xodimlar</router-link></li>

        <!-- 🍽️ Oshxona -->
        <li>
          <button class="main-link" :class="{ active: activeSection === 'oshxona' }" @click="toggleSection('oshxona')">
            🍽️ Oshxona
          </button>
          <ul v-if="activeSection === 'oshxona'" class="sub-menu">
            <li><router-link to="/admin/maxsulotlarOshxona" @click="closeSidebar">Oshxona Maxsulotlar</router-link></li>
             <li><router-link to="/admin/oshxonaOvqatlari" @click="closeSidebar">Oshxona ovqatlari</router-link></li>
            <li><router-link to="/admin/retseptOshxona" @click="closeSidebar">Oshxona Retsept</router-link></li>
            <li><router-link to="/admin/chiqimOshxona" @click="closeSidebar">Oshxona Chiqimlar</router-link></li>
          </ul>
        </li>

        <!-- 🏬 Ombor -->
        <li>
          <button class="main-link" :class="{ active: activeSection === 'ombor' }" @click="toggleSection('ombor')">
            🏬 Ombor
          </button>
          <ul v-if="activeSection === 'ombor'" class="sub-menu">
            <li><router-link to="/admin/omborMaxsulotlar" @click="closeSidebar">Ombor Maxsulotlar</router-link></li>
            <li><router-link to="/admin/omborKirim" @click="closeSidebar">Ombor Kirim</router-link></li>
            <li><router-link to="/admin/omborChiqim" @click="closeSidebar">Ombor Chiqimlar</router-link></li>
            <li><router-link to="/admin/omborBalans" @click="closeSidebar">Ombor Balans</router-link>
                                </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import "@/assets/css/superNavbar.css";

export default {
  name: "SuperSidebar",
  data() {
    return {
      isSidebarOpen: false,
      isDarkMode: false,
      isDesktop: window.innerWidth >= 768,
      activeSection: "",        // accordion holati
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    /* 📱 Hamburger */
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    /* Link bosilganda (mobilda) */
    closeSidebar() {
      if (!this.isDesktop) this.isSidebarOpen = false;
    },
    /* 🌙/🌞 rejim */
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    /* Responsive kuzatuvchi */
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
      if (this.isDesktop) this.isSidebarOpen = false;
    },
    /* 🔽 Accordion */
    toggleSection(section) {
      this.activeSection = this.activeSection === section ? "" : section;
    },
  },
};
</script>

<style scoped>
/* ===== Umumiy ===== */
.sidebar-wrapper.dark {
  --sidebar-bg: #13131f;
  --link-color: #c7c7d9;
}

.sidebar-wrapper {
  --sidebar-bg: #1e1e2d;
  --link-color: #c7c7d9;
}

/* ===== Layout ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 290px;
  height: 100%;
  background: var(--sidebar-bg);
  color: #fff;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar.open {
  transform: translateX(0);
}

/* Desktopda doim ko‘rinadi */
@media (min-width: 768px) {
  .sidebar {
    position: static;
    transform: none;
  }

  .toggle-button {
    display: none;
  }
}

/* ===== Overlay ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

/* ===== Top‑bar ===== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.logo {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.logo img {
  width: 32px;
  height: 32px;
}

.dark-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffd86b;
}

/* ===== Linklar ===== */
.primary-list,
.sub-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.primary-list>li {
  margin: .15rem 0;
}

a,
.main-link {
  display: block;
  padding: .65rem 1.25rem;
  color: var(--link-color);
  text-decoration: none;
  border-radius: 4px;
}

a.router-link-active,
a:hover,
.main-link:hover {
  background: rgba(255, 255, 255, .10);
  color: #fff;
}

/* ===== Accordion tugma ===== */
.main-link {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  position: relative;
}

.main-link::after {
  content: '▾';
  position: absolute;
  right: 1rem;
  transition: transform .25s;
}

.main-link.active::after {
  transform: rotate(-180deg);
}

/* ===== Sub‑menu ===== */
.sub-menu {
  padding-left: 1.25rem;
}

.sub-menu li {
  margin: .35rem 0;
}

/* ===== Scrollbar ===== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, .15);
  border-radius: 3px;
}

/* ===== Mobil hamburger ===== */
.toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: var(--sidebar-bg);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: .5rem .65rem;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .25);
}
</style>
