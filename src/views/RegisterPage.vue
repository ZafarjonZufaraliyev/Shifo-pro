<template>
  <div class="register-container">
    <h2 class="title">Ro'yxatdan O'tkazish</h2>
    <form @submit.prevent="handleSubmit" class="form">
      <!-- F.I.Sh -->
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
          <input v-model="form.pasport" type="text" placeholder="AA1234567" pattern="[A-Z]{2}[0-9]{7}" required />
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
          <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat.name">{{ viloyat.name }}</option>
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
        <input v-model="form.tel1" type="tel" placeholder="+998901234567" pattern="^\+998[0-9]{9}$" required />
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
</template>

<script>
import api from "@/api"; // api.js to'g'ri sozlangan bo'lishi kerak
import "@/assets/css/ro'yxat.css";

export default {
  name: "RegisterPage",
  data() {
    return {
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
      },
    };
  },
  async mounted() {
    // agar boshlang'ich davlat "O‘zbekiston" bo'lsa viloyatlarni yuklash
    if (this.form.davlat === "O‘zbekiston") {
      await this.fetchViloyatlar();
    }
  },
  watch: {
    // Davlat o'zgarganda viloyatlar ro'yxatini yangilash yoki tozalash
    "form.davlat"(val) {
      if (val === "O‘zbekiston") {
        this.fetchViloyatlar();
      } else {
        this.viloyatlar = [];
        this.form.viloyat = "";
      }
      this.form.tuman = "";
    },
  },
  methods: {
    async fetchViloyatlar() {
      try {
        const res = await fetch(
          "https://thingproxy.freeboard.io/fetch/https://uzbekistan-regions.vercel.app/api/regions"
        );
        this.viloyatlar = await res.json();
      } catch (err) {
        console.error("Viloyatlar yuklashda xatolik:", err);
      }
    },

    async handleSubmit() {
      try {
        const res = await api.post("/api/v1/clients", this.form);
        const client = res.data; // serverdan qaytgan yangi client ma'lumotlari

        // Formani localStorage ga saqlash (Takliflar sahifasida foydalanish uchun)
        localStorage.setItem(
          "ro_yxat_form",
          JSON.stringify({
            ...this.form,
            id: client.id || null,
          })
        );

        // Role ni olish (super yoki mini)
        const role = localStorage.getItem("role") || "mini";

        // Takliflar sahifasiga role ga qarab userId bilan yo'naltirish
        this.$router.push({ path: `/${role}/taklif`, query: { userId: client.id } });
      } catch (err) {
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          let msg = "❗ Xatoliklar:\n";
          for (let key in errors) {
            msg += `- ${key}: ${errors[key].join(", ")}\n`;
          }
          alert(msg);
        } else {
          alert("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.");
          console.error(err);
        }
      }
    },
  },
};
</script>


<style scoped>
/* Style larni o'zgarishsiz olib qo'yishingiz mumkin */
</style>
