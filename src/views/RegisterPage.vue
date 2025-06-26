<template>
  <div class="register-container">
    <router-view></router-view>

    <div v-if="!isChildVisible">
      <h2 class="title">Ro'yxatdan O'tkazish</h2>
      <form method="POST" action="${http://192.168.63.12/api/v1/clients}" @submit.prevent="handleSubmit" class="form">



        <!-- F.I.Sh. -->
        <div class="form-group">
          <label>Familiya, Ism, Sharif</label>
          <div class="ismfamilya">
            <input v-model="form.familiya" type="text"  placeholder="Familiya" required />
            <input v-model="form.ism" type="text" name="ism" placeholder="Ism" required />
            <input v-model="form.sharif" type="text" name="sharif" placeholder="Sharif (otasining ismi)" required />
          </div>
        </div>
        <!-- Fuqarolik -->
        <div class="form-group">
          <label>Fuqaroligi</label>
          <select v-model="form.davlat" name="davlat" required>
            <option disabled value="">Tanlang</option>
            <option>O‘zbekiston</option>
            <option>Xorijiy</option>
          </select>
        </div>
        <!-- Pasport va Tug‘ilgan sana -->
        <div class="form-row">
          <div class="form-group">
            <label>Pasport seriyasi va raqami</label>
            <input v-model="form.pasport" type="text" name="pasport" placeholder="AD1234567" required />
          </div>

          <div class="form-group">
            <label>Tug‘ilgan sana</label>
            <input v-model="form.tugulgan_sana" type="date" name="tugulgan_sana" required />
          </div>
        </div>



        <!-- Viloyat -->
        <div v-if="form.fuqaro === 'O‘zbekiston'" class="form-group">
          <label>Viloyat</label>
          <select v-model="form.viloyat" name="viloyat">
            <option disabled value="">Tanlang</option>
            <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat.name">
              {{ viloyat.name }}
            </option>
          </select>
        </div>
        <div v-else-if="form.davlat === 'Xorijiy'" class="form-group">
          <label>Viloyat (yozma)</label>
          <input v-model="form.viloyat" type="text" name="viloyat" placeholder="Viloyatni kiriting" required />
        </div>

        <!-- Tuman -->
        <div v-if="form.davlat" class="form-group">
          <label>Tuman (yozma)</label>
          <input v-model="form.tuman" type="text" name="tuman" placeholder="Tuman nomini kiriting" required />
        </div>

        <div class="form-group">
          <label>Telefon raqami (majburiy)</label>
          <input v-model="form.tel1" type="tel" name="tel1" placeholder="+998 90 123 45 67" required />
        </div>

        <div class="form-group">
          <label>Qo'shimcha telefon (ixtiyoriy)</label>
          <input v-model="form.tel2" type="tel" name="tel2" placeholder="+998 90 123 45 68" />
        </div>

        <div class="form-group">
          <label>Uy manzili</label>
          <input v-model="form.manzil" type="text" name="manzil" required />
        </div>
        <!-- Jins -->
        <!-- <div class="form-group">
          <label>Jins</label>
          <select v-model="form.jins" name="referral" required>
            <option disabled value="">Tanlang</option>
            <option>Erkak</option>
            <option>Ayol</option>
          </select>
        </div> -->
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
import api from "@/api";  // api.js joylashgan joyiga qarab yo‘lni o‘zgartiring

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
        davlat: "",               // "fuqaro" emas, "davlat" bo‘lishi kerak
        pasport: "",
        tugulgan_sana: "",        // nomi `tugulgan_sana` bo‘lishi kerak
        viloyat: "",
        tuman: "",
        manzil: "",
        tel1: "",                 // telefon1 emas
        tel2: "",                 // telefon2 emas
        referral: "",
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
    async handleSubmit() {
      console.log("Yuborilayotgan ma'lumot:", this.form);
      try {
        const response = await api.post('/api/v1/clients', this.form);
        console.log('Server javobi:', response.data);
        console.log("Yuborilayotgan ma'lumot:", this.form);
        // LocalStorage ga ham yozish mumkin
        localStorage.setItem("ro_yxat_form", JSON.stringify(this.form));

        // Keyingi sahifaga o'tish
        this.$router.push("/RoyxatgaOlish/taklif");
      } catch (error) {
        console.error("Ma'lumot yuborishda xatolik:", error);
        alert("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
      }
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

<style scoped></style>
