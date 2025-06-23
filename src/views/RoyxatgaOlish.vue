<template>
  <div class="register-container">
    <!-- Ichki sahifa ko‘rinadi -->
    <router-view></router-view>

    <!-- Asosiy forma faqat /RoyxatgaOlish da ko‘rinadi -->
    <div v-if="!isChildVisible">
      <h2 class="title">Ro'yxatdan O'tkazish</h2>
      <form @submit.prevent="handleSubmit" class="form">
        <!-- F.I.Sh. -->
        <div class="form-group full-width">
          <label for="fullName">Familiya, Ism</label>
          <input v-model="form.fullName" id="fullName" type="text" required />
        </div>

        <div class="two-columns">
          <div class="column">
            <div class="form-group">
              <label for="address">Yashash manzili</label>
              <input v-model="form.address" id="address" type="text" required />
            </div>
            <div class="form-group">
              <label for="age">Yosh</label>
              <input v-model="form.age" id="age" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label for="arrivalDate">Kelgan sanasi</label>
              <input v-model="form.arrivalDate" id="arrivalDate" type="date" required />
            </div>
          </div>
          <div class="column">
            <div class="form-group">
              <label for="phone">Telefon raqami</label>
              <input v-model="form.phone" id="phone" type="tel" required />
            </div>
            <div class="form-group">
              <label>Jinsi</label>
              <div class="radio-group">
                <label><input type="radio" value="Erkak" v-model="form.gender" /> Erkak</label>
                <label><input type="radio" value="Ayol" v-model="form.gender" /> Ayol</label>
              </div>
            </div>
            <div class="form-group">
              <label for="leaveDate">Ketgan sanasi</label>
              <input v-model="form.leaveDate" id="leaveDate" type="date" />
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="source">Qayerdan eshitgan?</label>
          <select v-model="form.source" id="source" required>
            <option disabled value="">Tanlang</option>
            <option>Do‘stdan</option>
            <option>Reklama orqali</option>
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
import "@/assets/css/ro'yxat.css"
export default {
  name: "RegisterPage",
  data() {
    return {
      form: {
        fullName: "",
        age: null,
        phone: "",
        address: "",
        gender: "",
        arrivalDate: "",
        leaveDate: "",
        source: "",
      },
      isChildVisible: false
    };
  },
  methods: {
    handleSubmit() {
      localStorage.setItem("ro_yxat_form", JSON.stringify(this.form));
      this.$router.push("/RoyxatgaOlish/taklif");
    }
  },
  watch: {
    '$route.path'(val) {
      this.isChildVisible = val.includes('/RoyxatgaOlish/taklif');
    }
  },
  created() {
    this.isChildVisible = this.$route.path.includes('/RoyxatgaOlish/taklif');
  }
};
</script>
<style scoped>

</style>
