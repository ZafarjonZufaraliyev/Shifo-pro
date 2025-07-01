<template>
  <div class="details-page" v-if="booking">
    <h2>🧾 Bemor Ma'lumotlari</h2>

    <!-- KO‘RISH HOLATI -->
    <div class="card-view" v-if="!editMode">
      <div class="info-block">
        <p><strong>F.I.Sh:</strong> {{ booking.fullName }}</p>
        <p><strong>Yosh:</strong> {{ booking.age }} yosh</p>
        <p><strong>Jinsi:</strong> {{ booking.gender }}</p>
        <p><strong>Kelgan sana:</strong> {{ booking.arrivalDate }}</p>
        <p><strong>Ketgan sana:</strong> {{ booking.leaveDate }}</p>
        <p><strong>Xona:</strong> {{ booking.room.name }} — {{ booking.room.price }} so'm</p>
        <p><strong>Xizmatlar:</strong></p>
        <ul>
          <li v-for="(s, i) in booking.services" :key="i">{{ s.name }} — {{ s.price }} so'm</li>
        </ul>
        <p class="total">Jami: {{ booking.totalSum }} so'm</p>
      </div>

      <div class="action-buttons">
        <button class="btn primary" @click="editMode = true">✏️ Tahrirlash</button>
        <button class="btn danger" @click="deleteAll">🗑 O‘chirish</button>
        <button class="btn success" @click="save">💾 Saqlash</button>
      </div>
    </div>

    <!-- TAHRIR HOLATI -->
    <div class="edit-block" v-else>
      <input v-model="edited.fullName" placeholder="F.I.Sh" />
      <input v-model="edited.age" type="number" placeholder="Yosh" />
      <select v-model="edited.gender">
        <option>Erkak</option>
        <option>Ayol</option>
      </select>
      <input type="date" v-model="edited.arrivalDate" />
      <input type="date" v-model="edited.leaveDate" />
      <input v-model="edited.room.name" placeholder="Xona nomi" />

      <ul>
        <li v-for="(s, i) in edited.services" :key="i">
          {{ s.name }} — {{ s.price }} so'm
        </li>
      </ul>

      <div class="action-buttons">
        <button class="btn success" @click="save">💾 Saqlash</button>
        <button class="btn secondary" @click="cancelEdit">❌ Bekor qilish</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      booking: null,       // Asl maʼlumot (readonly holatda ko‘rsatiladi)
      edited: null,        // Tahrirlanayotgan nusxa
      editMode: false      // Holat: true = tahrir, false = ko‘rish
    };
  },
  mounted() {
    const q = this.$route.query.data;
    if (q) {
      const parsed = JSON.parse(decodeURIComponent(q));
      this.booking = parsed;
      this.edited = JSON.parse(JSON.stringify(parsed));
    }
  },
  methods: {
    async save() {
      try {
        // Ma'lumotni serverga yuborish
        const response = await api.post('public/api/v1/clients', this.edited);

        // Serverdan qaytgan ID ni olish
        const savedId = response.data.id;

        // ID ni booking va edited obyektlariga yozish
        this.edited.id = savedId;
        this.booking = JSON.parse(JSON.stringify(this.edited));

        // LocalStorage uchun: yangilash (agar kerak bo‘lsa)
        let all = JSON.parse(localStorage.getItem("bookings") || "[]");
        all = all.filter(b => b.id !== this.booking.id);
        all.push(this.booking);
        localStorage.setItem("bookings", JSON.stringify(all));

        this.editMode = false;
        alert("Maʼlumot saqlandi!");

        // Yangi sahifaga yo'naltirish
        this.$router.push(`/super/BemorCard/${savedId}`);
      } catch (error) {
        console.error("Saqlashda xatolik:", error);
        alert("Xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      }
    },
    cancelEdit() {
      this.edited = JSON.parse(JSON.stringify(this.booking));
      this.editMode = false;
    },
    deleteAll() {
      if (confirm("Rostdan ham o‘chirishni xohlaysizmi?")) {
        let all = JSON.parse(localStorage.getItem("bookings") || "[]");
        all = all.filter(b => b.id !== this.booking.id);
        localStorage.setItem("bookings", JSON.stringify(all));
        alert("O‘chirildi!");
        this.$router.push("/super/bemorlar");
      }
    }
  }
};
</script>


<style scoped>
.details-page {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #fefefe;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", sans-serif;
  color: #1f2937;
}

h2 {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 30px;
  color: #0f172a;
}

.card-view,
.edit-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-block {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.info-block p,
ul li {
  margin: 6px 0;
}

.total {
  margin-top: 12px;
  font-weight: 600;
  color: #16a34a;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn.primary {
  background-color: #3b82f6;
  color: white;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.success {
  background-color: #10b981;
  color: white;
}

.btn.secondary {
  background-color: #9ca3af;
  color: white;
}

.edit-block input,
.edit-block select {
  padding: 10px;
  font-size: 15px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f9fafb;
  outline: none;
}

.edit-block input:focus,
.edit-block select:focus {
  border-color: #3b82f6;
  background: #eef6ff;
}

ul {
  padding-left: 20px;
  margin: 10px 0;
  list-style: disc;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
