<template>
  <MiniAdminLayout>
    <div class="dashboard">
      <h1>Mini Admin bosh sahifaga xush kelibsiz, {{ username }}!</h1>
      <p>Bu sahifada siz faqat o‘zingizga tegishli bemorlar va xonalarni ko‘rishingiz mumkin.</p>
    </div>
  </MiniAdminLayout>
</template>

<script>
import MiniAdminLayout from '@/layouts/MiniAdminLayout.vue'

export default {
  components: {
    MiniAdminLayout
  },
  data() {
    return {
      username: localStorage.getItem('username') || 'MiniAdmin'
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
