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
            <input v-model="form.familiya" type="text" placeholder="Familiya" required />
            <input v-model="form.ism" type="text" placeholder="Ism" required />
            <input v-model="form.sharif" type="text" placeholder="Sharif (otasining ismi)" required />
          </div>
        </div>

        <!-- Fuqarolik -->
        <div class="form-group">
          <label>Fuqaroligi</label>
          <select v-model="form.davlat" required>
            <option disabled value="">Tanlang</option>
            <option>O‘zbekiston</option>
            <option>Xorijiy</option>
          </select>
        </div>

        <!-- Pasport va Tug‘ilgan sana -->
        <div class="form-row">
          <div class="form-group">
            <label>Pasport seriyasi va raqami</label>
            <input 
              v-model="form.pasport" 
              type="text" 
              placeholder="AA1234567" 
              pattern="[A-Z]{2}[0-9]{7}" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Tug‘ilgan sana</label>
            <input v-model="form.tugulgan_sana" type="date" required />
          </div>
        </div>

        <!-- Viloyat -->
        <div v-if="form.davlat === 'O‘zbekiston'" class="form-group">
          <label>Viloyat</label>
          <select v-model="form.viloyat" required>
            <option disabled value="">Tanlang</option>
            <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat.name">
              {{ viloyat.name }}
            </option>
          </select>
        </div>
        <div v-else-if="form.davlat === 'Xorijiy'" class="form-group">
          <label>Viloyat (yozma)</label>
          <input v-model="form.viloyat" type="text" placeholder="Viloyatni kiriting" required />
        </div>

        <!-- Tuman -->
        <div v-if="form.davlat" class="form-group">
          <label>Tuman (yozma)</label>
          <input v-model="form.tuman" type="text" placeholder="Tuman nomini kiriting" required />
        </div>

        <!-- Telefon raqami -->
        <div class="form-group">
          <label>Telefon raqami (majburiy)</label>
          <input 
            v-model="form.tel1" 
            type="tel" 
            placeholder="+998901234567" 
            pattern="^\+998[0-9]{9}$" 
            required 
          />
        </div>

        <!-- Qo'shimcha telefon -->
        <div class="form-group">
          <label>Qo'shimcha telefon (ixtiyoriy)</label>
          <input v-model="form.tel2" type="tel" placeholder="+998901234568" />
        </div>

        <!-- Uy manzili -->
        <div class="form-group">
          <label>Uy manzili</label>
          <input v-model="form.manzil" type="text" placeholder="Manzilni kiriting" required />
        </div>

        <!-- Qayerdan eshitgan -->
        <div class="form-group">
          <label>Biz haqimizda qayerdan eshitdingiz?</label>
          <select v-model="form.referral" required>
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
import api from "@/api";  // api.js ichida baseURL to‘g‘ri ko‘rsatilgan bo‘lishi kerak

export default {
  name: "RegisterPage",
  data() {
    return {
      isChildVisible: false,
      viloyatlar: [],
      form: {
        familiya: "",
        ism: "",
        sharif: "",
        davlat: "",
        pasport: "",
        tugulgan_sana: "",
        viloyat: "",
        tuman: "",
        manzil: "",
        tel1: "",
        tel2: "",
        referral: "",
      }
    };
  },
  methods: {
    async fetchViloyatlar() {
      try {
        if (this.form.davlat !== "O‘zbekiston") {
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
    async handleSubmit() {
      console.log("Yuborilayotgan ma'lumot:", this.form);
      try {
        const response = await api.post('public/api/v1/clients', this.form);
        console.log('Server javobi:', response.data);
        // Keyingi sahifaga o'tish
        this.$router.push("/RoyxatgaOlish/taklif");
      } catch (error) {
        if (error.response?.status === 422) {
          const errors = error.response.data.errors;
          console.error("Validatsiya xatolari:", errors);
          let msg = "❗ Xatoliklar:\n";
          for (let key in errors) {
            msg += `- ${key}: ${errors[key].join(", ")}\n`;
          }
          alert(msg);
        } else {
          console.error("Ma'lumot yuborishda xatolik:", error);
          alert("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.");
        }
      }
    }
  },
  watch: {
    "form.davlat"(newVal) {
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
    if (this.form.davlat === "O‘zbekiston") {
      this.fetchViloyatlar();
    }
  }
};
</script>

<style scoped>
/* Zarur bo‘lsa, shu yerga style qo‘shing */
</style>
