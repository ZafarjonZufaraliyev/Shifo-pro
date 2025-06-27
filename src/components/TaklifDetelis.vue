<template>
  <div class="details-page" v-if="booking">
    <h2>Taklif tafsilotlari</h2>

    <!-- KO‘RISH HOLATI -->
    <div class="card-flex" v-if="!editMode">
      <div class="card-content">
        <p>{{ booking.fullName }}</p>
        <p>{{ booking.age }} yosh</p>
        <p>{{ booking.gender }}</p>
        <p>Kelgan sana: {{ booking.arrivalDate }}</p>
        <p>Ketgan sana: {{ booking.leaveDate }}</p>
        <p>Xona: {{ booking.room.name }} — {{ booking.room.price }} so'm</p>
        <p><strong>Xizmatlar:</strong></p>
        <ul>
          <li v-for="(s, i) in booking.services" :key="i">{{ s.name }} — {{ s.price }} so'm</li>
        </ul>
        <p class="total">Jami: {{ booking.totalSum }} so'm</p>
      </div>

      <div class="button-group">
        <button class="btn edit" @click="editMode = true">✏️ Tahrirlash</button>
        <button class="btn delete" @click="deleteAll">🗑 O‘chirish</button>
        <button class="btn save" @click="save">💾 Saqlash</button>
      </div>
    </div>

    <!-- TAHRIR HOLATI -->
    <div v-else>
      <div class="edit-form">
        <input v-model="edited.fullName" placeholder="F.I.Sh" />

        <input v-model="edited.age" type="number" placeholder="Yosh:" />

        <select v-model="edited.gender">
          <option>Erkak</option>
          <option>Ayol</option>
        </select>

        <input type="date" v-model="edited.arrivalDate" placeholder="Kelgan sana" />

        <input type="date" v-model="edited.leaveDate" placeholder="Ketgan sana" />

        <input v-model="edited.room.name" placeholder="Xona nomi" />

        <ul>
          <li v-for="(s, i) in edited.services" :key="i">
            {{ s.name }} — {{ s.price }}
          </li>
        </ul>

        <button class="btn save-full" @click="save">💾 Maʼlumotni saqlash</button>
      </div>

      <!-- Pastdagi umumiy tugmalar -->
      <div class="button-group bottom">
        <button class="btn save" @click="save">💾 Saqlash</button>
        <button class="btn cancel" @click="cancelEdit">❌ Bekor qilish</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      booking: null,
      edited: null,
      editMode: false
    };
  },
  mounted() {
    const q = this.$route.query.data;
    if (q) {
      this.booking = JSON.parse(decodeURIComponent(q));
      this.edited = JSON.parse(JSON.stringify(this.booking));
    }
  },
  methods: {
    save() {
      this.booking = JSON.parse(JSON.stringify(this.edited));
      localStorage.setItem("booking_data", JSON.stringify(this.booking));
      this.editMode = false;
      alert("Maʼlumot saqlandi!");
      this.$router.push("/super/bemorlar");
    },
    cancelEdit() {
      this.edited = JSON.parse(JSON.stringify(this.booking));
      this.editMode = false;
    },
    deleteAll() {
      if (confirm("Rostdan ham o‘chirishni xohlaysizmi?")) {
        localStorage.removeItem("booking_data");
        alert("O‘chirildi!");
        this.$router.push("/super/bemorlar");
      }
    }
  }
};
</script>
<style>
     .details-page {
  padding: 30px;
  max-width: 1200px;
  margin: auto;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', sans-serif;
  color: #1e293b;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 2rem;
  color: #0f172a;
}

.card-flex {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-top: 20px;
}

.card-content {
  flex: 1.5;
  background-color: #f9fafb;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  font-size: 16px;
}

.card-content p {
  margin-bottom: 10px;
}

.total {
  margin-top: 16px;
  font-weight: bold;
  color: #047857;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
  margin-top: 10px;
}

.button-group {
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 16px;
}

.button-group.bottom {
  margin-top: 24px;
  flex-direction: row;
}

.btn {
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 160px;
  transition: background-color 0.2s ease;
  text-align: center;
}

.btn.edit {
  background-color: #3b82f6;
  color: white;
}

.btn.delete {
  background-color: #ef4444;
  color: white;
}

.btn.save {
  background-color: #10b981;
  color: white;
}

.btn.cancel {
  background-color: #9ca3af;
  color: white;
}

.edit-form {
  background-color: #f9fafb;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-form input,
.edit-form select {
  padding: 10px 14px;
  font-size: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  outline: none;
}

.edit-form input:focus,
.edit-form select:focus {
  border-color: #3b82f6;
  background-color: #eef6ff;
}

.btn.save-full {
  background-color: #0ea5e9;
  color: white;
  margin-top: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .card-flex {
    flex-direction: column;
  }

  .button-group,
  .button-group.bottom {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
  }

  .details-page {
    padding: 16px;
  }
}

</style>