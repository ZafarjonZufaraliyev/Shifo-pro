<template>
  <div class="container">
    <div class="signup">
      <h2 class="title_signup">Tizimga kirish</h2>

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
        <button @click="login">Kirish</button>
      </div>
    </div>
  </div>
</template>


<script>
import '@/assets/css/login.css'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      if (this.username === 'Zafarjon' && this.password === '1234') {
        localStorage.setItem('role', 'super');
        localStorage.setItem('username', this.username);
        this.$router.push('/super');
      } else if (this.username === 'Ismoil' && this.password === '4321') {
        localStorage.setItem('role', 'mini');
        localStorage.setItem('username', this.username);
        this.$router.push('/mini');
      } else {
        alert('Login yoki parol noto‘g‘ri');
      }
    }
  }
}
</script>


<style scoped>
/* Bu yerga kerak bo'lsa maxsus style yozing */
</style>
