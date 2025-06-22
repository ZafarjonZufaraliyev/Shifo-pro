<template>
  <div class="layout">
    <SuperSidebar />
    <div class="content">
      <Navbar />
      <main>
        <router-view />
      
      </main>
    </div>
  </div>
</template>

<script>
import SuperSidebar from '@/components/SuperAdminsidebar.vue'
import Navbar from '@/components/Sidebar.vue'

export default {
  components: {
    SuperSidebar,
    Navbar
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
main {
  padding: 20px;
  flex-grow: 1;
  background-color: #f9f9f9;
}
</style>
