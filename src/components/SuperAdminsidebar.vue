<template>
  <div :class="{ dark: isDarkMode }">
    <!-- Mobil uchun sidebar toggle tugmasi -->
    <button class="toggle-button" @click="toggleSidebar">☰</button>

    <!-- Overlay (mobil versiyada sidebar ochilganda) -->
    <div v-if="isSidebarOpen && !isDesktop" class="overlay" @click="closeSidebar"></div>

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

      <!-- Select - telefon uchun responsive -->
        
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
      selectedType: "",
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
/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 270px;
  height: 100vh;
  background-color: #fff;
  color: #000;
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.dark {
  background-color: #1e1e1e;
  color: white;
}

.sidebar ul {
  list-style: none;
  padding: 20px 0 0 0;
  margin: 0;
}

.sidebar li {
  margin: 12px 0;
}

.sidebar a {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 10px 15px;
  border-radius: 8px;
  transition: background 0.2s;
  font-weight: 500;
}

.sidebar a.router-link-exact-active,
.sidebar a:hover {
  background-color: #1A6291;
  color: white;
}

/* Mobilda yopiq holatda */
@media (max-width: 768px) {
  .sidebar {
    left: -100%;
    width: 250px;
  }
  .sidebar.open {
    left: 0;
  }
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.logo img {
  width: 40px;
}

.logo h3 {
  margin: 0;
  font-size: 18px;
}

/* Toggle dark */
.dark-toggle {
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 2px solid #1A6291;
  background: white;
  color: #1A6291;
  cursor: pointer;
}

.dark .dark-toggle {
  background: #1e1e1e;
  color: white;
}

/* Mobil toggle button */
.toggle-button {
  display: none;
}

@media (max-width: 768px) {
  .toggle-button {
    display: block;
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1100;
    background-color: #fff;
    border: 2px solid #1A6291;
    padding: 8px 14px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 8px;
  }

  .dark .toggle-button {
    background-color: #333;
    color: white;
  }
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
}

/* Select (responsive) */
.select-wrapper {
  margin-top: auto;
  padding-top: 20px;
}

.custom-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}
</style>
