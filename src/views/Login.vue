<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Tizimga kirish</h2>

      <form @submit.prevent="handleLogin">
        <label>
          Login:
          <input
            type="text"
            v-model="username"
            placeholder="Login kiriting"
            required
            autocomplete="username"
          />
        </label>

        <label>
          Parol:
          <input
            type="password"
            v-model="password"
            placeholder="Parol kiriting"
            required
            autocomplete="current-password"
          />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? "Yuklanmoqda..." : "Kirish" }}
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import roleRoutes from "@/constants/roleRoutes"; // { admin: "/super", kassa: "/mini", ... }

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const router = useRouter();

const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const response = await api.post("/api/v1/login", {
      username: username.value.trim(), // 👈 backend shuni kutyapti!
      password: password.value.trim(),
    });

    const { token, user, role } = response.data;

    console.log("Role:", role);
    console.log("Redirect path:", roleRoutes[role]);

    if (!token) {
      error.value = "Login yoki parol noto‘g‘ri.";
      return;
    }

    // Local saqlash
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);

    // Role asosida yo‘naltirish
    const redirectPath = roleRoutes[role];
    if (redirectPath) {
      await router.push(redirectPath);
      console.log("✅ Redirected to", redirectPath);
    } else {
      error.value = `Bu rol uchun sahifa mavjud emas: ${role}`;
    }
  } catch (e) {
    console.log("❌ Login xato:", e.response?.data || e);
    error.value = e.response?.data?.message || "Login xatoligi.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f6f8;
}

.login-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 360px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-size: 14px;
  color: #555;
  display: flex;
  flex-direction: column;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 4px;
}

button {
  padding: 12px;
  background-color: #0f7bd8;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background-color: #357ab8;
}

button:disabled {
  background-color: #aacbeb;
  cursor: not-allowed;
}

.error-msg {
  color: red;
  font-size: 14px;
  text-align: center;
}
</style>
