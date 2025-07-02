<template>
  <div class="navbar">
    <div class="profile" @click="togglePanel">
      <img class="profile-img" :src="profileImg" alt="Profil" />
      <span class="username">{{ username }}</span>
    </div>

    <!-- Ongdan chiqadigan panel -->
    <div v-if="isPanelOpen" class="side-panel-overlay" @click.self="closePanel">
      <div class="side-panel">
        <h2>Profil</h2>
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Roli:</strong> {{ role }}</p>

        <hr />

        <!-- O'zgartirish tugmasi -->
        <div v-if="!editing" class="centered">
          <button class="edit-btn" @click="editing = true">✏️ Login va parolni o‘zgartirish</button>
        </div>

        <!-- O'zgartirish formasi -->
        <form v-else @submit.prevent="updateCredentials">
          <h4>🔐 Yangi ma’lumotlar</h4>

          <div class="form-group">
            <label>Yangi Login:</label>
            <input v-model="newUsername" type="text" required />
          </div>

          <div class="form-group">
            <label>Yangi Parol:</label>
            <div class="password-wrapper">
              <input :type="showPassword ? 'text' : 'password'" v-model="newPassword" required />
              <span class="toggle-eye" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn">💾 Saqlash</button>
            <button type="button" class="cancel-btn" @click="editing = false">Bekor qilish</button>
          </div>
        </form>

        <hr />

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
      role: localStorage.getItem("role") || "super",
      profileImg: "https://i.pravatar.cc/40?img=3",

      newUsername: localStorage.getItem("username") || "",
      newPassword: localStorage.getItem("password") || "",

      isPanelOpen: false,
      editing: false,
      showPassword: false
    };
  },
  methods: {
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      if (this.isPanelOpen) {
        this.newUsername = localStorage.getItem("username") || "";
        this.newPassword = localStorage.getItem("password") || "";
      }
    },
    closePanel() {
      this.isPanelOpen = false;
      this.editing = false;
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    updateCredentials() {
      if (!this.newUsername.trim() || !this.newPassword.trim()) {
        alert("Iltimos, login va parolni to‘liq kiriting!");
        return;
      }

      localStorage.setItem("username", this.newUsername.trim());
      localStorage.setItem("password", this.newPassword.trim());
      this.username = this.newUsername.trim();

      alert("✅ Ma’lumotlar yangilandi!");
      this.editing = false;
      this.closePanel();
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.side-panel-overlay {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
}

.side-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background-color: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow-y: auto;
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.centered {
  text-align: center;
}

.edit-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 22px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.edit-btn:hover {
  background-color: #0069d9;
}

.form-group {
  margin: 12px 0;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-eye {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  font-size: 18px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.save-btn {
  flex: 1;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background-color: #3b8e40;
}

.cancel-btn {
  flex: 1;
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #bbb;
}

.logout-btn {
  margin-top: 18px;
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 6px;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
