<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- F.I.Sh -->
    <div class="form-group">
      <label>Ism Familya</label>
      <input v-model="form.fullName" type="text" required />
    </div>

    <!-- Telefon raqam -->
    <div class="form-group">
      <label>Telefon raqami (ixtiyoriy)</label>
      <input v-model="form.phone" type="tel" placeholder="+998..." />
    </div>

    <!-- Ikki ustunli: Yosh va Jins -->
    <div class="row">
      <div class="form-group">
        <label>Yoshi</label>
        <input v-model="form.age" type="number" required />
      </div>
      <div class="form-group">
        <label>Jinsi (ixtiyoriy)</label>
        <select v-model="form.gender">
          <option value="">Tanlanmagan</option>
          <option>Erkak</option>
          <option>Ayol</option>
        </select>
      </div>
    </div>

    <!-- Sana -->
    <div class="form-group">
      <label>Ketish sanasi</label>
      <input v-model="form.leaveDate" type="date" required />
    </div>

    <!-- "+" tugmasi -->
    <div class="form-group">
      <label>Xizmatlar</label>
      <button class="add-btn" @click="showOffers = true">+</button>
    </div>

    <!-- Takliflar ro‘yxati -->
    <div v-if="showOffers" class="offers">
      <div v-for="(item, index) in offers" :key="index" class="offer-item">
        <input type="checkbox" v-model="item.selected" />
        <span>{{ item.name }} - {{ item.price }} so'm</span>
      </div>
    </div>

    <!-- Umumiy narx -->
    <div v-if="showOffers" class="total">
      Umumiy: <strong>{{ totalPrice }} so'm</strong>
    </div>

    <!-- Yaratish tugmasi -->
    <button class="submit-btn" @click="submit">Yaratish</button>
  </div>
</template>

<script>
import "@/assets/css/taklif.css"
export default {
  name: 'TaklifPage',
  data() {
    return {
      showOffers: false,
      form: {
        fullName: '',
        phone: '',
        age: '',
        gender: '',
        leaveDate: ''
      },
      offers: [
        { name: "Massaj", price: 50000, selected: true },
        { name: "Fizioterapiya", price: 60000, selected: true },
        { name: "Dori muolajasi", price: 45000, selected: true },
        { name: "Psixolog bilan suhbat", price: 40000, selected: true },
        { name: "Vitamin terapiyasi", price: 55000, selected: true }
      ]
    };
  },
  computed: {
    totalPrice() {
      return this.offers
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price, 0);
    }
  },
  methods: {
    submit() {
      if (!this.form.fullName || !this.form.age || !this.form.leaveDate) {
        alert("Iltimos, kerakli maydonlarni to‘ldiring!");
        return;
      }

      const data = {
        ...this.form,
        tanlanganXizmatlar: this.offers.filter(o => o.selected),
        umumiyNarx: this.totalPrice
      };

      console.log("Yakuniy ma'lumot:", data);
      alert("Ma'lumotlar yuborildi!");
    }
  }
};
</script>

<style scoped>

</style>
