<template>
  <div class="navbar">
    <!-- Profil bloki -->
    <div class="profile" @click="toggleModal">
      <img class="profile-img" src="../assets/image/profile.png" alt="Profil" />
      <span class="username">{{ username }}</span>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ username }}</h3>
        <p>Email: {{ email }}</p>
        <p>Kimsiz: {{ role }}Admin</p>

        <button @click="logout" class="logout-btn">Chiqish</button>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/sidebar.css"
export default {
  data() {
    return {
      username: localStorage.getItem("username") || "Foydalanuvchi",
      email: localStorage.getItem("email") || "zufaraliyev@gmail.com", // misol uchun
      role: localStorage.getItem("role") || "Foydalanuvchi roli",
      isModalOpen: false,
    };
  },
  methods: {
    toggleModal() {
      this.isModalOpen = !this.isModalOpen;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    logout() {
      localStorage.clear();
      this.closeModal();
      this.$router.push("/login"); // kerak bo‘lsa aktivlashtiring
    },
  },
};
</script>

<style scoped>

</style>
