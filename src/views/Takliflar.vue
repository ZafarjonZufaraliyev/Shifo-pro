<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Foydalanuvchi haqida ma'lumot -->
    <div v-if="client" class="user-info">
      <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }}</p>
    </div>

    <!-- Filtrlar -->
    <div class="filter-row">
      <input v-model="roomFilterNumber" placeholder="Xona raqami (masalan: 205)" />
      <input v-model="roomFilterName" placeholder="Xona turi (masalan: LUX)" />
      <input type="number" v-model.number="roomFilterSigim" placeholder="Sig'imi (masalan: 2)" />
      <button class="clear-filter-btn" @click="clearFilters">Filtrlarni tozalash</button>
    </div>

    <!-- Xonalar ro'yxati -->
    <div v-if="!selectedRoom">
      <h3>Mavjud xonalar:</h3>
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Xona turi</th>
            <th>Xona raqami</th>
            <th>Sig'imi</th>
            <th>Narxi (so'm)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="room in filteredRooms"
            :key="room.id"
            :class="['room-row', { busy: room.busy }]"
            @click="!room.busy && selectRoom(room)"
            :title="room.busy ? 'Bu xona band' : 'Tanlash uchun bosing'"
          >
            <td>{{ room.room_type }}</td>
            <td>{{ room.xona }}</td>
            <td>{{ room.sigim }}</td>
            <td>{{ room.price.toLocaleString('ru-RU') }}</td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td colspan="4" class="no-rooms">Xonalar topilmadi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Xizmatlar va tanlangan xona -->
    <div v-if="selectedRoom">
      <div class="selected-room">
        <h3>Tanlangan xona</h3>
        <p>{{ selectedRoom.display }}</p>
        <p>
          Narxi:
          <input
            type="number"
            v-model.number="selectedRoom.price"
            style="width: 120px; padding: 6px 10px; border-radius: 6px"
          />
          so'm
        </p>

        <div class="date-row">
          <div class="form-group">
            <label>Kelgan sana</label>
            <input type="date" :min="today" v-model="arrivalDate" />
          </div>
          <div class="form-group">
            <label>Necha kun?</label>
            <input type="number" v-model.number="stayDays" min="1" />
          </div>
          <div class="form-group">
            <label>Ketgan sana</label>
            <input type="date" :value="leaveDate" readonly />
          </div>
        </div>

        <!-- Xizmatlar -->
        <div class="services-section">
          <h3>Majburiy xizmatlar</h3>
          <div v-for="(service, i) in mandatoryServices" :key="'mand-' + i" class="service-item">
            <input type="checkbox" v-model="service.selected" disabled />
            {{ service.name }} — <input type="number" v-model.number="service.price" style="width: 100px" /> so'm
          </div>

          <h3>Qo‘shimcha xizmatlar</h3>
          <div v-for="(service, i) in additionalServices" :key="'add-' + i" class="service-item">
            <input type="checkbox" v-model="service.selected" />
            {{ service.name }} — <input type="number" v-model.number="service.price" style="width: 100px" /> so'm
          </div>
        </div>

        <!-- Jami va tugma -->
        <div class="total-sum">
          Jami summa: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
        </div>

        <button class="submit-btn" @click="submitDavolanish">📥 Bron qilish</button>
        <button class="cancel-btn" @click="cancelSelection">❌ Bekor qilish</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'TaklifPage',

  props: ['clientId'], // Props orqali clientId olinyapti

  data() {
    return {
      client: null,
      selectedRoom: null,
      rooms: [],
      mandatoryServices: [],
      additionalServices: [],
      arrivalDate: new Date().toISOString().slice(0, 10),
      stayDays: 7,
      roomFilterNumber: '',
      roomFilterName: '',
      roomFilterSigim: null,
    };
  },

  computed: {
    today() {
      return new Date().toISOString().slice(0, 10);
    },

    leaveDate() {
      const date = new Date(this.arrivalDate);
      date.setDate(date.getDate() + this.stayDays);
      return date.toISOString().slice(0, 10);
    },

    filteredRooms() {
      return this.rooms.filter((room) => {
        const byNumber = this.roomFilterNumber ? room.xona.includes(this.roomFilterNumber) : true;
        const byName = this.roomFilterName ? room.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase()) : true;
        const bySigim = this.roomFilterSigim ? room.sigim == this.roomFilterSigim : true;
        return byNumber && byName && bySigim;
      });
    },

    totalSum() {
      const roomSum = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mandatory = this.mandatoryServices.reduce((sum, s) => sum + s.price, 0);
      const additional = this.additionalServices
        .filter((s) => s.selected)
        .reduce((sum, s) => sum + s.price, 0);
      return roomSum + mandatory + additional;
    },
  },

  async mounted() {
    // clientId props kelmasa fallback uchun $route.params dan ham olamiz
    const id = this.clientId || this.$route.params.clientId;
    if (!id) {
      alert('Client ID topilmadi!');
      return;
    }

    await this.loadClient(id);
    await this.loadRooms();
    await this.loadServices();
  },

  methods: {
    async loadClient(id) {
      try {
        const res = await api.get(`/api/v1/clients/${id}`);
        this.client = res.data;
      } catch (err) {
        console.error('Client ma\'lumotlarini olishda xatolik:', err);
      }
    },

    async loadRooms() {
      try {
        const res = await api.get('/api/v1/room');
        this.rooms = res.data.map((room) => ({
          ...room,
          sigim: room.sigim || room.capacity || 1,
          room_type: room.room_type?.name || 'Nomaʼlum',
          price: parseFloat(room.room_type?.Narxi || 0),
          display: `${room.room_type?.name} (xona №${room.xona})`,
          busy: false, // bandlikni boshqa so'rovdan olish mumkin
        }));
      } catch (err) {
        console.error('Xonalarni yuklashda xatolik:', err);
      }
    },

    async loadServices() {
      try {
        const res = await api.get('/api/v1/services');
        this.mandatoryServices = res.data
          .filter((s) => s.required == 1)
          .map((s) => ({ ...s, selected: true, price: +s.price || 0 }));
        this.additionalServices = res.data
          .filter((s) => s.required != 1)
          .map((s) => ({ ...s, selected: false, price: +s.price || 0 }));
      } catch (err) {
        console.error('Xizmatlarni yuklashda xatolik:', err);
      }
    },

    selectRoom(room) {
      this.selectedRoom = { ...room };
    },

    clearFilters() {
      this.roomFilterNumber = '';
      this.roomFilterName = '';
      this.roomFilterSigim = null;
    },

    cancelSelection() {
      this.selectedRoom = null;
      this.mandatoryServices = [];
      this.additionalServices = [];
    },

    async submitDavolanish() {
      const xizmatlar = [
        ...this.mandatoryServices.map((s) => s.id),
        ...this.additionalServices.filter((s) => s.selected).map((s) => s.id),
      ];

      if (!this.selectedRoom) {
        alert('Iltimos, xona tanlang!');
        return;
      }

      const payload = {
        client_id: this.client.id,
        xona_id: this.selectedRoom.id,
        start: this.arrivalDate,
        end: this.leaveDate,
        xizmatlar,
      };

      try {
        await api.post('/api/v1/davolanish', payload);
        alert('✅ Bron muvaffaqiyatli qilindi');
        this.cancelSelection();
      } catch (err) {
        console.error('❌ Bron qilishda xatolik:', err.response?.data || err);
        alert('Xatolik yuz berdi');
      }
    },
  },
};
</script>

<style scoped>
.taklif-container {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
  color: #1f2937;
}

.title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  margin-bottom: 30px;
}

.user-info {
  background: #e0f2fe;
  border-left: 6px solid #3b82f6;
  padding: 16px 24px;
  margin-bottom: 30px;
  border-radius: 12px;
  font-size: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-row input {
  flex: 1 1 200px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 15px;
}

.clear-filter-btn {
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filter-btn:hover {
  background: #1e40af;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.rooms-table th,
.rooms-table td {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  text-align: left;
  font-size: 15px;
}

.room-row {
  transition: background 0.2s ease;
  cursor: pointer;
}

.room-row:hover:not(.busy) {
  background: #eff6ff;
}

.room-row.busy {
  background: #ffe4e6 !important;
  color: #991b1b !important;
  border: 1px solid #f87171 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  font-style: italic;
}

.no-rooms {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 12px;
}

.selected-room {
  background: #f0fdf4;
  border-left: 6px solid #10b981;
  padding: 24px;
  border-radius: 16px;
  margin-top: 30px;
}

.date-row {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.form-group {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 15px;
}

.total-sum {
  font-size: 20px;
  font-weight: 700;
  text-align: right;
  margin-top: 10px;
  color: #1e40af;
}

.submit-btn {
  background: #22c55e;
  color: white;
  font-weight: 700;
  font-size: 16px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  margin-top: 20px;
  float: right;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #16a34a;
}

.cancel-btn {
  background: #f87171;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #dc2626;
}

.services-section {
  margin: 30px 0 20px 0;
  background: #eff6ff;
  padding: 16px 20px;
  border-radius: 12px;
}

.services-section h3 {
  margin-bottom: 12px;
  color: #1e40af;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .date-row {
    flex-direction: column;
  }

  .submit-btn {
    width: 100%;
    float: none;
  }
}
</style>
