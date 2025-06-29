<template>
  <div class="container">
    <div class="signup">
      <h2 class="title_signup">Tizimga kirish</h2>

      <!-- FORM ishlatamiz ENTER uchun -->
      <form @submit.prevent="login">
        <div class="login">
          <div class="login_name">Login</div>
          <input
            type="text"
            placeholder="Username kiriting"
            v-model="username"
          />
        </div>

        <div class="parol">
          <div class="parol_name">Parol</div>
          <input
            type="password"
            placeholder="Parol kiriting"
            v-model="password"
          />
        </div>

        <div class="sing_btn">
          <button type="submit">Kirish</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import "@/assets/css/login.css";
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      const username = this.username.trim();
      const password = this.password.trim();

      if (username === 'Zafarjon' && password === '1234') {
        localStorage.setItem('role', 'super');
        localStorage.setItem('username', username);
        this.$router.push('/super');
      } else if (username === 'Ismoil' && password === '4321') {
        localStorage.setItem('role', 'mini');
        localStorage.setItem('username', username);
        this.$router.push('/mini');
      } else {
        alert('Login yoki parol noto‘g‘ri');
      }
    }
  }
}
</script>


<style scoped>
/* Kerak bo‘lsa login uchun style larni shu yerga yozing */
</style>
