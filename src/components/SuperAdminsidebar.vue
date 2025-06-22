<template>
  <div :class="{ dark: isDarkMode }">
    <!-- Mobil uchun sidebar toggle tugmasi -->
    <button class="toggle-button" @click="toggleSidebar">☰</button>

    <!-- Overlay (mobilda) -->
    <div
      v-if="isSidebarOpen && !isDesktop"
      class="overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <div :class="['sidebar', { open: isSidebarOpen || isDesktop, dark: isDarkMode }]">
      <div class="top-bar">
        <div class="logo">
          <img src="../assets/image/logo.png" alt="Logo" />
          <h3>Koinot Kavsari</h3>
        </div>
        <button class="dark-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'Light mode' : 'Dark mode'">
          <span v-if="isDarkMode">🌞</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <ul>
        <li><router-link to="/super" @click.native="closeSidebar">🏠 Bosh sahifa</router-link></li>
        <li><router-link to="/super/bemorlar" @click.native="closeSidebar">Bemorlar</router-link></li>
        <li><router-link to="/super/rooms" @click.native="closeSidebar">Xonalar</router-link></li>
        <li><router-link to="/super/stats" @click.native="closeSidebar">Statistika</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuperSidebar",
  data() {
    return {
      isSidebarOpen: false,
      isDarkMode: false,
      isDesktop: window.innerWidth >= 768,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    closeSidebar() {
      if (!this.isDesktop) {
        this.isSidebarOpen = false;
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
      if (this.isDesktop) {
        this.isSidebarOpen = false;
      }
    },
  },
};
</script>

<style scoped>
/* --- Sidebar asosiy --- */
.sidebar {
  width: 270px;
  height: 100vh;
  padding: 20px 20px 0 20px;
  background-color: #fff;
  color: #000;
  z-index: 1101;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  display: flex;
  flex-direction: column;
}

/* Sidebar ochilganda ko‘rinadi */
.sidebar.open {
  transform: translateX(0);
}

/* Dark mode */
.dark .sidebar {
  background-color: #1e1e1e;
  color: #fff;
}

/* Top bar: logo va dark toggle yonma-yon */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.dark .top-bar {
  border-color: #444;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 50px;
  max-width: 50px;
  margin-right: 10px;
}

/* Dark mode tugmasi */
.dark-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: inherit;
  padding: 5px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.dark-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark .dark-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Menu list */
.sidebar ul {
  list-style: none;
  padding: 20px 0 0 0;
  margin: 0;
  flex-grow: 1;
}

.sidebar li {
  margin: 15px 0;
}

a {
  color: inherit;
  text-decoration: none;
}

a.router-link-exact-active {
  font-weight: bold;
}

/* Mobil uchun toggle tugma */
.toggle-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1201;
  background-color: #fff;
  border: none;
  padding: 10px 14px;
  font-size: 22px;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.dark .toggle-button {
  background-color: #2c2c2c;
  color: #fff;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 1100;
}

/* Desktop uchun: sidebar doim ko‘rinadi, tugmalar va overlay yashirinadi */
@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
  }

  .toggle-button,
  .overlay {
    display: none;
  }
}
</style>
