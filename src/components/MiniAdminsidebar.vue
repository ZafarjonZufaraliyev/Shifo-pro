<template>
  <div class="sidebar">
    <h3>Mini Admin Panel</h3>
    <!-- <img src="" alt=""> -->
    <ul :class="['sidebar', { open: isSidebarOpen }]">
      <li><router-link to="/mini">🏠 Bosh sahifa</router-link></li>
      <li><router-link to="/mini/bemorlar">🧍‍♂️ Bemorlar</router-link></li>
      <li><router-link to="/mini/rooms">🏨 Xonalar</router-link></li>
      <li><router-link to="/mini/stats">📊 Statistika</router-link></li>
    </ul>
  </div>
</template>

<script>
import "@/assets/css/miniNavbar.css"
export default {
  name: 'MiniSidebar',
  data() {
  return {
    isSidebarOpen: false
  };
},
methods: {
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
}
</script>

<style scoped>

</style>
