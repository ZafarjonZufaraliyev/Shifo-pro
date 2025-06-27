<template>
  <div class="patient-details" v-if="!loading">
    <router-view></router-view>
    <h2>🩺 Bemor haqida maʼlumot</h2>

    <form @submit.prevent="updatePatient" class="form-grid-3" v-if="cardBemor">
      <!-- USTUN 1: Shaxsiy maʼlumotlar -->
      <div class="form-column">
        <div class="form-row"><label>Familiya:</label><input v-model="cardBemor.familiya" required class="editable" /></div>
        <div class="form-row"><label>Ism:</label><input v-model="cardBemor.ism" required class="editable" /></div>
        <div class="form-row"><label>Sharif:</label><input v-model="cardBemor.sharif" class="editable" /></div>
        <div class="form-row"><label>Tug‘ilgan sana:</label><input type="date" v-model="cardBemor.tugulgan_sana" class="editable" /></div>
      </div>

      <!-- USTUN 2: Hududiy maʼlumotlar -->
      <div class="form-column">
        <div class="form-row"><label>Davlat:</label><input v-model="cardBemor.davlat" class="editable" /></div>
        <div class="form-row"><label>Viloyat:</label><input v-model="cardBemor.viloyat" class="editable" /></div>
        <div class="form-row"><label>Tuman:</label><input v-model="cardBemor.tuman" class="editable" /></div>
        <div class="form-row"><label>Manzil:</label><textarea v-model="cardBemor.manzil" class="editable"></textarea></div>
      </div>

      <!-- USTUN 3: Bogʻlanish va tibbiy maʼlumotlar -->
      <div class="form-column">
        <div class="form-row"><label>Telefon 1:</label><input v-model="cardBemor.tel1" class="editable" /></div>
        <div class="form-row"><label>Telefon 2:</label><input v-model="cardBemor.tel2" class="editable" /></div>
        <div class="form-row">
          <label>Jinsi:</label>
          <select v-model="jinsi" class="editable">
            <option value="Erkak">Erkak</option>
            <option value="Ayol">Ayol</option>
            <option value="">Belgilanmagan</option>
          </select>
        </div>
        <div class="form-row"><label>Yoshi:</label><input type="number" v-model.number="yosh" min="0" class="editable" /></div>
      </div>

      <!-- Yangi qator: 3 ustunli readonly maʼlumotlar -->
      <div class="form-row-3">
        <div class="triple-field">
          <label>Takliflar:</label>
          <textarea v-model="takliflar" readonly class="readonly" placeholder="Qo‘shimcha ma'lumotlar"></textarea>
        </div>
        <div class="triple-field">
          <label>Kasallik tarixi:</label>
          <textarea v-model="kasallik_tarixi" readonly class="readonly" placeholder="Kasalliklar va tibbiy tarix"></textarea>
        </div>
        <div class="triple-field">
          <label>Sanalar va yotgan joylar:</label>
          <textarea v-model="sanalar" readonly class="readonly" placeholder="Yotgan sanalar"></textarea>
        </div>
      </div>

      <!-- Tugmalar -->
      <div class="buttons-row">
        <button type="submit" class="btn btn-save">💾 Saqlash</button>
        <button type="button" @click="deletePatient" class="btn btn-delete">🗑 O‘chirish</button>
        <router-link to="/super/bemorlar" class="btn btn-back">↩ Orqaga</router-link>
      </div>
    </form>
  </div>

  <div v-else class="loading-container">
    <p>⏳ Yuklanmoqda...</p>
  </div>
</template>

<script>
import api from "@/api"; // API sozlamalar joylashgan fayl

export default {
  data() {
    return {
      cardBemor: null,
      loading: true,
    };
  },
  methods: {
    async getPatient() {
      try {
        const id = this.$route.params.id; // Routerdan bemor ID sini olamiz
        const res = await api.get(`/public/api/v1/clients/${id}`); // To‘liq bitta bemor ma'lumotini olish
        this.cardBemor = res.data; // API javobiga qarab o'zgartiring, odatda res.data bo'ladi
      } catch (err) {
        console.error("API xatolik:", err);
        alert("Bemor ma'lumotlarini olishda xatolik yuz berdi.");
      } finally {
        this.loading = false;
      }
    },
    async updatePatient() {
      try {
        const id = this.$route.params.id;
        await api.put(`/public/api/v1/clients/${id}`, this.cardBemor);
        alert("Ma'lumotlar muvaffaqiyatli yangilandi.");
      } catch (err) {
        console.error("Yangilashda xatolik:", err);
        alert("Yangilashda xatolik yuz berdi.");
      }
    },
    async deletePatient() {
      if (confirm("Rostdan ham o‘chirmoqchimisiz?")) {
        try {
          const id = this.$route.params.id;
          await api.delete(`/public/api/v1/clients/${id}`);
          alert("Bemor muvaffaqiyatli o‘chirildi.");
          this.$router.push("/super/bemorlar");
        } catch (err) {
          console.error("O'chirishda xatolik:", err);
          alert("O'chirishda xatolik yuz berdi.");
        }
      }
    },
  },
  mounted() {
    this.getPatient();
  },
};
</script>




<style scoped>
.patient-details {
  max-width: 1280px;
 margin:20px 20px 20px 290px;
  padding: 20px;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  text-align: center;
  font-size: 2rem;
  color: #0f172a;
  margin-bottom: 2.5rem;
}

/* Uch ustunli grid */
.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row label {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.75rem;
  background-color: #f8fafc;
  outline: none;
  transition: border 0.2s, background 0.2s;
}

.editable:focus {
  border-color: #2563eb;
  background-color: #eef6ff;
}

.readonly {
  background-color: #e5e7eb;
  color: #475569;
  border-color: #cbd5e1;
  font-style: italic;
  cursor: not-allowed;
  resize: none;
}

textarea.readonly {
  min-height: 120px;
}

/* Yangi 3 qatorli blok */
.form-row-3 {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.triple-field {
  display: flex;
  flex-direction: column;
}

.triple-field label {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

/* Tugmalar qatori */
.buttons-row {
  grid-column: 1 / -1;
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.btn-save {
  background-color: #2563eb;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

.btn-delete {
  background-color: #dc2626;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

.btn-back {
  background-color: #475569;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background-color: #1e293b;
}

.loading-container {
  text-align: center;
  padding: 5rem;
  font-size: 1.25rem;
  color: #64748b;
}

/* Responsivlik */
@media (max-width: 1200px) {
  .form-grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .form-row-3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-grid-3 {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .patient-details {
    margin-left: 0;
    padding: 20px;
  }
}
</style>
