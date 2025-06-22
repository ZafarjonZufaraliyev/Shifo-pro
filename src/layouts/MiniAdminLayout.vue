<template>
  <div class="layout">
    <SuperSidebar />
    <div class="content">
      <Navbar />
      <router-view /> 
       <!-- Bu yerga ichki sahifalar yuklanadi -->
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
