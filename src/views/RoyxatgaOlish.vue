<template>
  <div class="register-container">
    <router-view></router-view>

    <div v-if="!isChildVisible">
      <h2 class="title">Ro'yxatdan O'tkazish</h2>
      <form @submit.prevent="handleSubmit" class="form">

       

        <!-- F.I.Sh. -->
        <div class="form-group">
          <label>Familiya, Ism, Sharif</label>
          <div class="ismfamilya">
            <input v-model="form.familya" type="text" placeholder="Familiya" required />
            <input v-model="form.ism" type="text" placeholder="Ism" required />
            <input v-model="form.otasi" type="text" placeholder="Sharif (otasining ismi)" required />
          </div>
        </div>
        <!-- Fuqarolik -->
        <div class="form-group">
          <label>Fuqaroligi</label>
          <select v-model="form.fuqaro" required>
            <option disabled value="">Tanlang</option>
            <option>O‘zbekiston</option>
            <option>Xorijiy</option>
          </select>
        </div>
        <!-- Pasport va Tug‘ilgan sana -->
        <div class="form-row">
          <div class="form-group">
            <label>Pasport seriyasi va raqami</label>
            <input v-model="form.pasport" type="text" placeholder="AD1234567" required />
          </div>

          <div class="form-group">
            <label>Tug‘ilgan sana</label>
            <input v-model="form.tugilganYil" type="number" required />
          </div>
        </div>

        

        <!-- Viloyat -->
        <div v-if="form.fuqaro === 'O‘zbekiston'" class="form-group">
          <label>Viloyat</label>
          <select v-model="form.viloyat" >
            <option disabled value="">Tanlang</option>
            <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat.name">
              {{ viloyat.name }}
            </option>
          </select>
        </div>
        <div v-else-if="form.fuqaro === 'Xorijiy'" class="form-group">
          <label>Viloyat (yozma)</label>
          <input v-model="form.viloyat" type="text" placeholder="Viloyatni kiriting" required />
        </div>

        <!-- Tuman -->
        <div v-if="form.fuqaro" class="form-group">
          <label>Tuman (yozma)</label>
          <input v-model="form.tuman" type="text" placeholder="Tuman nomini kiriting" required />
        </div>

        <div class="form-group">
          <label>Uy manzili</label>
          <input v-model="form.manzil" type="text" required />
        </div>
         <!-- Jins -->
        <div class="form-group">
          <label>Jins</label>
          <select v-model="form.jins" required>
            <option disabled value="">Tanlang</option>
            <option>Erkak</option>
            <option>Ayol</option>
          </select>
        </div>
        <!-- Qayerdan eshitgan -->
        <div class="form-group">
          <label>Biz haqimizda qayerdan eshitdingiz?</label>
          <select v-model="form.qayerdan" required>
            <option disabled value="">Tanlang</option>
            <option>Do‘stdan</option>
            <option>Reklama</option>
            <option>Ijtimoiy tarmoq</option>
            <option>Vrach tavsiyasi</option>
            <option>Boshqa</option>
          </select>
        </div>

        <button type="submit" class="submit-btn">Yuborish</button>
      </form>
    </div>
  </div>
</template>

<script>
import "@/assets/css/ro'yxat.css";

export default {
  name: "RegisterPage",
  data() {
    return {
      isChildVisible: false,
      viloyatlar: [],
      form: {
        jins: "",
        familya: "",
        ism: "",
        otasi: "",
        fuqaro: "",
        pasport: "",
        viloyat: "",
        tuman: "",
        manzil: "",
        tugilganYil: "",
        qayerdan: ""
      }
    };
  },
  methods: {
    async fetchViloyatlar() {
      try {
        if (this.form.fuqaro !== "O‘zbekiston") {
          this.viloyatlar = [];
          this.form.viloyat = "";
          return;
        }
        const res = await fetch('https://thingproxy.freeboard.io/fetch/https://uzbekistan-regions.vercel.app/api/regions');
        this.viloyatlar = await res.json();
      } catch (error) {
        console.error("Viloyatlar yuklanishda xatolik:", error);
      }
    },
    handleSubmit() {
      localStorage.setItem("ro_yxat_form", JSON.stringify(this.form));
      this.$router.push("/RoyxatgaOlish/taklif");
    }
  },
  watch: {
    "form.fuqaro"(newVal) {
      if (newVal === "O‘zbekiston") {
        this.fetchViloyatlar();
      } else {
        this.viloyatlar = [];
        this.form.viloyat = "";
      }
      this.form.tuman = "";
    },
    "$route.path"(val) {
      this.isChildVisible = val.includes("/RoyxatgaOlish/taklif");
    }
  },
  created() {
    this.isChildVisible = this.$route.path.includes("/RoyxatgaOlish/taklif");
    if (this.form.fuqaro === "O‘zbekiston") {
      this.fetchViloyatlar();
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 28px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.ismfamilya {
  display: flex;
  gap: 0.75rem;
}
.ismfamilya input {
  flex: 1;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
  flex: 1;
}
input,
select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}
.submit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.submit-btn:hover {
  background-color: #45a049;
}
</style>
