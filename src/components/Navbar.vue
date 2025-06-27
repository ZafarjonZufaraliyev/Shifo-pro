<template>
  <div class="navbar">
    <div class="profile" @click="toggleModal">
      <img class="profile-img" :src="profileImg" alt="Profil" />
      <span class="username">{{ username }}</span>
    </div>

    <!-- Modal oynasi -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ username }}</h3>
        <p>Email: {{ email }}</p>
        <p>Roli: <strong>{{ role }}</strong></p>

        <button @click="logout" class="logout-btn">🚪 Chiqish</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      username: localStorage.getItem("username") || "Foydalanuvchi",
      email: localStorage.getItem("email") || "zufaraliyev@gmail.com",
      role: localStorage.getItem("role") || "SuperAdmin",
      isModalOpen: false,
      profileImg: "https://i.pravatar.cc/40?img=3" // avatar rasmi
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
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  z-index: 10;
  position: sticky;
  top: 0;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.profile-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-right: 12px;
}

.username {
  font-weight: 600;
  color: #333;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.logout-btn {
  margin-top: 16px;
  background: #ff4d4f;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s ease;
}

.logout-btn:hover {
  background: #d9363e;
}
</style>
