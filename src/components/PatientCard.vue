<template>
  <div class="patient-details" v-if="!loading">
    <h2>Bemor haqida ma'lumot</h2>

    <form @submit.prevent="updatePatient" class="form-grid">
      <!-- Chap ustun -->
      <div class="form-column">
        <div class="form-row">
          <label>Familiya:</label>
          <input v-model="cardBemor.familiya" required class="editable" />
        </div>

        <div class="form-row">
          <label>Ism:</label>
          <input v-model="cardBemor.ism" required class="editable" />
        </div>

        <div class="form-row">
          <label>Sharif:</label>
          <input v-model="cardBemor.sharif" class="editable" />
        </div>

        <div class="form-row">
          <label>Davlat:</label>
          <input v-model="cardBemor.davlat" class="editable" />
        </div>

        <div class="form-row">
          <label>Pasport:</label>
          <input v-model="cardBemor.pasport" class="editable" />
        </div>

        <div class="form-row">
          <label>Tug‘ilgan sana:</label>
          <input type="date" v-model="cardBemor.tugulgan_sana" class="editable" />
        </div>

        <div class="form-row">
          <label>Viloyat:</label>
          <input v-model="cardBemor.viloyat" class="editable" />
        </div>

        <div class="form-row">
          <label>Tuman:</label>
          <input v-model="cardBemor.tuman" class="editable" />
        </div>
      </div>

      <!-- O'ng ustun -->
      <div class="form-column">
        <div class="form-row">
          <label>Manzil:</label>
          <textarea v-model="cardBemor.manzil" class="editable"></textarea>
        </div>

        <div class="form-row">
          <label>Telefon 1:</label>
          <input v-model="cardBemor.tel1" class="editable" />
        </div>

        <div class="form-row">
          <label>Telefon 2:</label>
          <input v-model="cardBemor.tel2" class="editable" />
        </div>

        <div class="form-row">
          <label>Jinsi:</label>
          <select v-model="cardBemor.jinsi" class="editable">
            <option value="Erkak">Erkak</option>
            <option value="Ayol">Ayol</option>
            <option value="">Belgilanmagan</option>
          </select>
        </div>

        <div class="form-row">
          <label>Yoshi:</label>
          <input type="number" v-model.number="cardBemor.yosh" min="0" class="editable" />
        </div>

        <!-- Readonly maydonlar -->
        <div class="form-row">
          <label>Takliflar:</label>
          <textarea
            v-model="cardBemor.takliflar"
            readonly
            class="readonly"
            placeholder="Qo‘shimcha ma'lumotlar"
          ></textarea>
        </div>

        <div class="form-row">
          <label>Kasallik tarixi:</label>
          <textarea
            v-model="cardBemor.kasallik_tarixi"
            readonly
            class="readonly"
            placeholder="Kasalliklar va tibbiy tarix"
          ></textarea>
        </div>

        <div class="form-row">
          <label>Sanalar va yotgan joylar:</label>
          <textarea
            v-model="cardBemor.sanalar"
            readonly
            class="readonly"
            placeholder="Misol: Yotgan joylar, sanalar"
          ></textarea>
        </div>
      </div>

      <!-- Tugmalar -->
      <div class="buttons-row">
        <button type="submit" class="btn btn-save">Saqlash</button>
        <button type="button" @click="deletePatient" class="btn btn-delete">O‘chirish</button>
        <router-link to="/Bemorlar" class="btn btn-back">Orqaga</router-link>
      </div>
    </form>
  </div>

  <div v-else class="loading-container">
    <p>Yuklanmoqda...</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cardBemor: null,
      loading: true,
    };
  },
  methods: {
    async getPatient() {
      this.loading = true;

      // Demo ma'lumotlar (API o'rniga)
      const mockData = {
        familiya: "Jo‘rayev",
        ism: "Azimjon",
        sharif: "Aliyevich",
        davlat: "O‘zbekiston",
        pasport: "AA1234567",
        tugulgan_sana: "1990-05-10",
        viloyat: "Toshkent viloyati",
        tuman: "Chirchiq tumani",
        manzil: "Ko‘cha 15, Uy 7",
        tel1: "+998901234567",
        tel2: "+998912345678",
        jinsi: "Erkak",
        yosh: 35,
        takliflar: "Qon bosimini pasaytiruvchi dori",
        kasallik_tarixi: "Qandli diabet, gipertoniya",
        sanalar: "2023-01-01 dan 2023-02-15 gacha yotgan",
      };

      setTimeout(() => {
        this.cardBemor = mockData;
        this.loading = false;
      }, 800);
    },

    async updatePatient() {
      alert("Saqlash so'rovi hozircha faqat demo uchun. Haqiqiy API bilan bog'lanish kerak.");
    },

    async deletePatient() {
      if (!confirm("Bemorni o'chirishni xohlaysizmi?")) return;
      alert("O'chirish so'rovi hozircha faqat demo uchun. Haqiqiy API bilan bog'lanish kerak.");
    },
  },
  mounted() {
    this.getPatient();
  },
};
</script>

<style scoped>
.patient-details {
  max-width: 1200px;
  margin: 40px auto;
  background: #fefefe;
  padding: 40px 60px;
  border-radius: 20px;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.12),
    0 8px 24px rgba(0,0,0,0.06);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  box-sizing: border-box;
  transition: box-shadow 0.4s ease;
}

.patient-details:hover {
  box-shadow:
    0 4px 16px rgba(0,0,0,0.18),
    0 16px 48px rgba(0,0,0,0.08);
}

h2 {
  text-align: center;
  margin-bottom: 48px;
  color: #0d4a6c;
  font-weight: 900;
  font-size: 38px;
  letter-spacing: 0.06em;
  user-select: none;
  text-shadow: 0 1px 3px rgba(13, 74, 108, 0.2);
}

/* Form grid - 2 ustun */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px 70px;
  align-items: start;
}

/* Har bir ustun */
.form-column {
  display: flex;
  flex-direction: column;
}

/* Form satrlar */
.form-row {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

/* Label */
.form-row label {
  font-weight: 800;
  margin-bottom: 12px;
  color: #1b344b;
  font-size: 19px;
  user-select: none;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-shadow: 0 0 2px #e0f0ff;
}

/* Umumiy input/select/textarea */
.form-row input,
.form-row select,
.form-row textarea {
  padding: 18px 26px;
  font-size: 18px;
  border: 3px solid #a3b1c6;
  border-radius: 20px;
  transition:
    border-color 0.4s ease,
    box-shadow 0.4s ease,
    background-color 0.3s ease;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  background-color: #fff;
  color: #34495e;
  min-width: 100%;
  outline-offset: 3px;
  outline: none;
  box-shadow: inset 0 1px 5px rgb(0 0 0 / 0.05);
}

/* Focus effekt faqat editable maydonlarda */
.form-row input.editable:focus,
.form-row select.editable:focus,
.form-row textarea.editable:focus {
  border-color: #3178c6;
  box-shadow:
    0 0 18px rgba(49, 120, 198, 0.7),
    inset 0 1px 8px rgb(49 120 198 / 0.15);
  background-color: #f0f7ff;
  color: #1a293d;
  transition-delay: 0.1s;
}

/* Editable maydonlar uchun pointer normal */
input.editable,
select.editable,
textarea.editable {
  cursor: text;
}

/* READONLY maydonlar uchun maxsus uslublar */
.readonly {
  background-color: #e6ebf5 !important;
  color: #5e6a82 !important;
  border-color: #9ba9bf !important;
  box-shadow:
    inset 0 0 8px rgba(0, 0, 0, 0.07);
  cursor: not-allowed !important;
  font-style: italic;
  resize: none !important;
  user-select: text !important;
  transition: none !important;
}

/* READONLY maydonlarga hover effekt yo'q */
.readonly:hover {
  border-color: #9ba9bf !important;
  box-shadow:
    inset 0 0 8px rgba(0, 0, 0, 0.07) !important;
}

/* Matnni o'qish uchun qulayroq */
textarea.readonly {
  min-height: 140px;
  line-height: 1.7;
  letter-spacing: 0.02em;
}

/* Tugmalar - butun kenglikda, ustunlar ostida */
.buttons-row {
  grid-column: 1 / -1;
  margin-top: 60px;
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Tugmalar */
.btn {
  padding: 20px 42px;
  border-radius: 24px;
  font-weight: 900;
  cursor: pointer;
  font-size: 19px;
  border: none;
  transition: background-color 0.3s ease, transform 0.15s ease;
  user-select: none;
  text-align: center;
  text-decoration: none;
  color: white;
  min-width: 190px;
  box-shadow: 0 9px 25px rgba(0, 0, 0, 0.2);
  will-change: transform;
}

.btn:hover {
  transform: translateY(-4px);
}

.btn:active {
  transform: translateY(1px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
}

.btn-save {
  background-color: #1d71b8;
  box-shadow: 0 9px 30px rgba(29, 113, 184, 0.7);
}

.btn-save:hover {
  background-color: #155a86;
}

.btn-delete {
  background-color: #d63131;
  box-shadow: 0 9px 30px rgba(214, 49, 49, 0.7);
}

.btn-delete:hover {
  background-color: #a72525;
}

.btn-back {
  background-color: #6b7a8f;
  padding: 20px 48px;
  display: inline-block;
  line-height: 1;
  text-decoration: none;
  min-width: 190px;
  box-shadow: 0 9px 30px rgba(107, 122, 143, 0.7);
  user-select: none;
}

.btn-back:hover {
  background-color: #495363;
}

/* Yuklanish uchun */
.loading-container {
  text-align: center;
  margin-top: 140px;
  font-size: 24px;
  color: #7a8ca4;
  font-weight: 800;
  user-select: none;
}

/* Kichik ekranlar uchun revert - bitta ustun */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .buttons-row {
    margin-top: 42px;
  }

  .btn {
    min-width: 100%;
  }
}
</style>
