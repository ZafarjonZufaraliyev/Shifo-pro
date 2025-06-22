<template>
  <SuperAdminLayout>
    <div class="dashboard">
      <h1>Super Admin bosh sahifaga xush kelibsiz, {{ username }}!</h1>
      <p>Bu sahifada siz mini adminlarni, bemorlarni va xonalarni boshqarishingiz mumkin.</p>
    </div>
  </SuperAdminLayout>
</template>

<script>
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'

export default {
  components: {
    SuperAdminLayout
  },
  data() {
    return {
      username: localStorage.getItem('username') || 'SuperAdmin'
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
