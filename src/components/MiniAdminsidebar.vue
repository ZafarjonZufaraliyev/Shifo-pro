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
        <li><router-link to="/mini" @click="closeSidebar">🏠 Bosh sahifa</router-link></li>
        <li><router-link to="/mini/bemorlar" @click="closeSidebar">Bemorlar</router-link></li>
        <li><router-link to="/mini/rooms" @click="closeSidebar">Xonalar</router-link></li>
        <!-- <li><router-link to="/mini/stats" @click="closeSidebar">Kassa</router-link></li> -->
      </ul>

      <!-- Select - telefon uchun responsive -->
        
    </div>
  </div>
</template>

<script>
import "@/assets/css/superNavbar.css"
export default {
  name: "MiniSidebar",
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

</style>
