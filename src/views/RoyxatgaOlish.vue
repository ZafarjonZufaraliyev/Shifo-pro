<template>
  <div class="register-container">
    <h2 class="title">Ro'yxatdan O'tkazish</h2>
    <form @submit.prevent="handleSubmit" class="form">

      <!-- F.I.Sh. -->
      <div class="form-group full-width">
        <label for="fullName">Familiya, Ism</label>
        <input v-model="form.fullName" id="fullName" type="text" required />
      </div>

      <!-- 2 ustunli bo'lim -->
      <div class="two-columns">
        <!-- Chap ustun -->
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

        <!-- O'ng ustun -->
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

      <!-- Qayerdan eshitgan -->
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

      <!-- Submit -->
      <button type="submit" class="submit-btn">Yuborish</button>
    </form>
  </div>
</template>

<script>
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
    };
  },
  methods: {
    handleSubmit() {
      console.log("Yuborilgan ma'lumotlar:", this.form);
      alert("Ma'lumotlar yuborildi!");
    },
  },
};
</script>

<style scoped>
.register-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: #fdfdfd;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #1A6291;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.full-width {
  width: 100%;
}

.two-columns {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.column {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: white;
}

.radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.radio-group input[type="radio"] {
  margin-right: 6px;
}

.submit-btn {
  padding: 14px;
  background-color: #1A6291;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #154a7e;
}

/* Responsive */
@media (max-width: 768px) {
  .two-columns {
    flex-direction: column;
  }
}
</style>
