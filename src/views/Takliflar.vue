<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Mijoz haqida ma'lumot -->
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

    <!-- Xonalar jadvali -->
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
          <tr v-for="room in filteredRooms" :key="room.id" :class="['room-row', { busy: room.busy }]"
            @click="selectRoom(room)" :title="room.busy ? '❌ Bu xona band' : '✅ Tanlash uchun bosing'">
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

    <!-- Tanlangan xona va xizmatlar -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>Tanlangan xona</h3>
      <p>{{ selectedRoom.display }}</p>
      <p>
        Narxi:
        <input type="number" v-model.number="selectedRoom.price"
          style="width: 120px; padding: 6px 10px; border-radius: 6px" /> so'm
      </p>

      <!-- Sana tanlash -->
      <div class="date-row">
        <div class="form-group">
          <label>Kelish sanasi</label>
          <input type="date" :min="today" v-model="arrivalDate" @change="loadRoomBookings" />
        </div>
        <div class="form-group">
          <label>Necha kun?</label>
          <input type="number" v-model.number="stayDays" min="1" @input="loadRoomBookings" />
        </div>
        <div class="form-group">
          <label>Ketish sanasi</label>
          <input type="date" :value="leaveDate" readonly />
        </div>
      </div>

      <!-- Xizmatlar -->
      <div class="services-section">
        <h3>Majburiy xizmatlar</h3>
        <div v-for="(service, i) in mandatoryServices" :key="'mand-' + i" class="service-item"
          @click="handleMandatoryClick(service)" style="cursor: pointer">
          <input type="checkbox" :checked="service.selected" readonly />
          {{ service.name }} —
          <input type="number" v-model.number="service.price" style="width: 100px" /> so'm
          <small>(Bosilgan: {{ service.clickCount }})</small>
        </div>

        <h3>Qo‘shimcha xizmatlar</h3>
        <div v-for="(service, i) in additionalServices" :key="'add-' + i" class="service-item">
          <input type="checkbox" v-model="service.selected" />
          {{ service.name }} —
          <input type="number" v-model.number="service.price" style="width: 100px" /> so'm
        </div>
      </div>

      <!-- Jami summa -->
      <div class="total-sum">
        Jami summa: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
      </div>

      <!-- Tugmalar -->
      <button class="submit-btn" @click="submitDavolanish">📥 Bron qilish</button>
      <button class="cancel-btn" @click="cancelSelection">❌ Bekor qilish</button>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  props: ['clientId'],

  data() {
    return {
      today: new Date().toISOString().slice(0, 10),
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
    leaveDate() {
      const date = new Date(this.arrivalDate);
      date.setDate(date.getDate() + this.stayDays);
      return date.toISOString().slice(0, 10);
    },

    filteredRooms() {
      return this.rooms.filter((room) => {
        const byNumber = this.roomFilterNumber ? room.xona.includes(this.roomFilterNumber) : true;
        const byName = this.roomFilterName
          ? room.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase())
          : true;
        const bySigim = this.roomFilterSigim ? room.sigim == this.roomFilterSigim : true;
        return byNumber && byName && bySigim;
      });
    },

    totalSum() {
      const roomSum = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mandatory = this.mandatoryServices.reduce((sum, s) => sum + (s.selected ? s.price : 0), 0);
      const additional = this.additionalServices.filter((s) => s.selected).reduce((sum, s) => sum + s.price, 0);
      return roomSum + mandatory + additional;
    },
  },

  async mounted() {
    const id = this.clientId || this.$route.params.clientId;
    if (!id) return alert('Client ID topilmadi!');
    await this.loadClient(id);
    await this.loadRooms();
    await this.loadServices();
    await this.loadRoomBookings();
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
          busy: false,
        }));
      } catch (err) {
        console.error('Xonalarni yuklashda xatolik:', err);
      }
    },

    async loadRoomBookings() {
      try {
        if (!this.arrivalDate || !this.leaveDate) return;
        const res = await api.get('/api/v1/bron');
        const arrival = new Date(this.arrivalDate);
        const leave = new Date(this.leaveDate);
        const busyRoomIds = res.data
          .filter((bron) => {
            const bronStart = new Date(bron.start);
            const bronEnd = new Date(bron.end);
            return arrival <= bronEnd && leave >= bronStart;
          })
          .map((bron) => bron.xona_id.toString());

        this.rooms = this.rooms.map((room) => ({
          ...room,
          busy: busyRoomIds.includes(room.id.toString()),
        }));

        if (this.selectedRoom && busyRoomIds.includes(this.selectedRoom.id.toString())) {
          this.cancelSelection();
          alert('Tanlangan xona band bo‘lib qoldi, boshqa xona tanlang.');
        }
      } catch (err) {
        console.error('Bronlarni yuklashda xatolik:', err);
      }
    },

    async loadServices() {
      try {
        const res = await api.get('/api/v1/services');
        this.mandatoryServices = res.data
          .filter((s) => s.required == 1)
          .map((s) => ({
            ...s,
            selected: true,
            price: +s.price || 0,
            clickCount: 0,
          }));
        this.additionalServices = res.data
          .filter((s) => s.required != 1)
          .map((s) => ({ ...s, selected: false, price: +s.price || 0 }));
      } catch (err) {
        console.error('Xizmatlarni yuklashda xatolik:', err);
      }
    },

    selectRoom(room) {
      if (!room.busy) this.selectedRoom = { ...room };
    },

    clearFilters() {
      this.roomFilterNumber = '';
      this.roomFilterName = '';
      this.roomFilterSigim = null;
    },

    cancelSelection() {
      this.selectedRoom = null;
      this.loadServices();
    },

    handleMandatoryClick(service) {
      service.clickCount++;
      if (service.clickCount >= 5) {
        service.selected = false;
        service.clickCount = 0;
      }
    },

  async submitDavolanish() {
  if (!this.selectedRoom) return alert('Iltimos, xona tanlang!');

  const selectedServices = [
    ...this.mandatoryServices.filter((s) => s.selected),
    ...this.additionalServices.filter((s) => s.selected),
  ];

  const davolanishPayload = {
    client_id: this.client.id,
    xona_id: this.selectedRoom.id,
    kelish_sanasi: this.arrivalDate,
    ketish_sanasi: this.leaveDate,
    create_user_id: this.$store?.state?.user?.id || 1,
    create_user_name: this.$store?.state?.user?.name || 'Zafarjon',
  };

  let davolanish = null;

  try {
    const res = await api.post('/api/v1/davolanish', davolanishPayload);
    davolanish = res.data.data;
    console.log('✅ Davolanish yaratildi:', davolanish);
  } catch (err) {
    console.error('❌ Davolanishni yaratishda xatolik:', err.response?.data || err);
    return alert('❌ Davolanishni saqlab bo‘lmadi.');
  }

  if (!davolanish?.id) {
    return alert('❌ Davolanish ID topilmadi!');
  }

  // Mana shu qismda services ni to'g'ri formatda yaratamiz:
  const servicesPayload = {
    client_id: this.client.id,
    davolanish_id: davolanish.id,
    services: selectedServices.map((s) => ({
      service_id: s.id,
      price: s.price,
      mahal: s.mahal || 1,
      total_days: this.stayDays,
      start_date: this.arrivalDate,
      kunlik_vaqtlari: s.kunlik_vaqtlari || [], // bo‘sh array yoki kerakli vaqtlar
    })),
  };

  console.log('Yuboriladigan services payload:', JSON.stringify(servicesPayload, null, 2));

  try {
    await api.post('/api/v1/client-services', servicesPayload);
    alert('✅ Xizmatlar muvaffaqiyatli saqlandi.');
  } catch (err) {
    console.error('❌ Xizmatlarni saqlashda xatolik:', err.response?.data || err);
    return alert('❌ Xizmatlarni saqlab bo‘lmadi.');
  }

  this.cancelSelection();
  this.loadRoomBookings();
},
  },
};
</script>





<style scoped>
.room-row.busy {
  background-color: #ffdede;
  color: #b30000;
  font-weight: bold;
  cursor: not-allowed;
  pointer-events: none;
  font-style: italic;
}

.no-rooms {
  text-align: center;
  color: #888;
}

.taklif-container {
  max-width: 1200px;
  margin: 20px auto;
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
