<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Mijoz ma'lumotlari -->
    <div v-if="client" class="user-info">
      <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }}</p>
    </div>

    <!-- Filtrlar -->
    <div class="filter-row">
      <input v-model="roomFilterNumber" placeholder="Xona raqami" />
      <input v-model="roomFilterName" placeholder="Xona turi" />
      <input type="number" v-model.number="roomFilterSigim" placeholder="Sig'imi" />
      <button class="clear-filter-btn" @click="clearFilters">Tozalash</button>
    </div>

    <!-- Xonalar ro'yxati -->
    <div v-if="!selectedRoom">
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Turi</th>
            <th>№</th>
            <th>Sig'imi</th>
            <th>Narxi</th>
            <th>Holati</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in filteredRooms"
            :key="r.id"
            :class="['room-row', { busy: r.busy }, { current: isCurrentRoom(r.id) }]"
            @click="selectRoom(r)"
            :title="r.busy ? 'Band' : 'Tanlash'"
          >
            <td>{{ r.room_type }}</td>
            <td>{{ r.xona }}</td>
            <td>{{ r.sigim }}</td>
            <td>{{ r.price.toLocaleString('ru-RU') }}</td>
            <td>
              <span v-if="isCurrentRoom(r.id)" style="color: #d97706; font-weight: 700;">
                Joriy yotmoqda ({{ r.currentPeople }}/{{ r.sigim }})
              </span>
              <span v-else-if="r.busy" style="color: red">
                Band ({{ r.currentPeople }}/{{ r.sigim }})
              </span>
              <span v-else style="color: green">
                Bo'sh <span v-if="r.currentPeople">({{ r.currentPeople }}/{{ r.sigim }})</span>
              </span>
            </td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td class="no-rooms" colspan="5">Xonalar topilmadi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tanlangan xona haqida ma'lumot -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>{{ selectedRoom.display }}</h3>

      <p>
        Narxi:
        <input type="number" v-model.number="selectedRoom.price" style="width:120px" /> so'm
      </p>

      <div class="date-row">
        <div class="form-group">
          <label>Kelish</label>
          <input type="date" :min="today" v-model="arrivalDate" @change="loadAllData" />
        </div>
        <div class="form-group">
          <label>Kunlar</label>
          <input type="number" min="1" v-model.number="stayDays" @input="loadAllData" />
        </div>
        <div class="form-group">
          <label>Ketish</label>
          <input type="date" :value="leaveDate" readonly />
        </div>
      </div>

      <!-- Bolalik checkbox va bola soni input -->
      <div class="form-group" style="margin:10px 0; display: flex; align-items: center; gap: 10px;">
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" v-model="has_child" /> Bolalik (has_child)
        </label>

        <input
          v-if="has_child"
          type="number"
          min="1"
          v-model.number="childCount"
          placeholder="Bola soni"
          style="width: 100px;"
        />
      </div>

      <!-- Xizmatlar -->
      <div class="services-section">
        <h4>Majburiy xizmatlar</h4>
        <div
          v-for="(s, i) in mandatoryServices"
          :key="'m' + i"
          class="service-item"
        >
          <input type="checkbox" v-model="s.selected" />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" /> so'm
        </div>

        <h4>Qo‘shimcha xizmatlar</h4>
        <div v-for="(s, i) in additionalServices" :key="'a' + i" class="service-item">
          <input type="checkbox" v-model="s.selected" />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" />
          <button
            @click="removeAdditionalService(i)"
            class="remove-btn"
            title="Xizmatni o'chirish"
          >❌</button>
        </div>
      </div>

      <!-- Qo'shimcha to'lovlar -->
      <div class="extra-payments" style="margin-top: 20px;">
        <h4>Qo'shimcha to'lovlar</h4>
        <div class="payment-item">
          <label>Naqd to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.cash" />
        </div>
        <div class="payment-item">
          <label>Karta to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.card" />
        </div>
        <div class="payment-item">
          <label>Click to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.click" />
        </div>
      </div>

      <div class="total-sum" style="margin: 15px 0;">
        Jami: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong><br />
        To‘lovlar jami: <strong>{{ totalPaid.toLocaleString('ru-RU') }} so'm</strong><br />
        Qoldiq: <strong :style="{ color: balance < 0 ? 'red' : 'green' }">{{ balance.toLocaleString('ru-RU') }} so'm</strong>
      </div>

      <!-- Loading overlay -->
      <div v-if="loading" class="overlay">
        <div class="spinner"></div>
        <p>Iltimos kuting...</p>
      </div>

      <button class="submit-btn" @click="submitDavolanish" :disabled="loading">📥 Saqlash</button>
      <button class="cancel-btn" @click="cancelSelection" :disabled="loading">Bekor</button>
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
      has_child: false,
      childCount: 0,
      davolanishlar: [],
      bronlar: [],
      extraPayments: {
        cash: 0,
        card: 0,
        click: 0,
      },
      loading: false
    };
  },
  computed: {
    leaveDate() {
      const d = new Date(this.arrivalDate);
      d.setDate(d.getDate() + this.stayDays - 1);
      return d.toISOString().slice(0, 10);
    },
    filteredRooms() {
      return this.rooms.filter(r => {
        const matchNumber = this.roomFilterNumber ? r.xona.toString().includes(this.roomFilterNumber) : true;
        const matchName = this.roomFilterName ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase()) : true;
        const matchSigim = this.roomFilterSigim ? r.sigim == this.roomFilterSigim : true;
        return matchNumber && matchName && matchSigim;
      });
    },
    totalSum() {
      const roomCost = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mandCost = this.mandatoryServices
        .filter(s => s.selected)
        .reduce((sum, svc) => sum + svc.price, 0);
      const addCost = this.additionalServices
        .filter(svc => svc.selected)
        .reduce((sum, svc) => sum + svc.price, 0);
      return roomCost + mandCost + addCost;
    },
    totalPaid() {
      return (
        (this.extraPayments.cash || 0) +
        (this.extraPayments.card || 0) +
        (this.extraPayments.click || 0)
      );
    },
    balance() {
      return this.totalSum - this.totalPaid;
    }
  },
  methods: {
    async loadClient(id) {
      try {
        const res = await api.get(`/api/v1/clients/${id}`);
        this.client = res.data;
      } catch (error) {
        console.error('Client load error:', error);
      }
    },
    async loadRooms() {
      try {
        const res = await api.get('/api/v1/room');
        this.rooms = res.data.map(r => ({
          ...r,
          sigim: r.sigim || r.capacity || 1,
          room_type: r.room_type?.name || 'Nomaʼlum',
          price: +r.room_type?.Narxi || 0,
          display: `${r.room_type?.name} (xona №${r.xona})`,
          busy: false,
          currentPeople: 0,
        }));
      } catch (error) {
        console.error('Rooms load error:', error);
      }
    },
    async loadServices() {
      try {
        const res = await api.get('/api/v1/services');
        this.mandatoryServices = res.data
          .filter(s => s.required == 1)
          .map(s => ({ ...s, selected: true, price: +s.price }));
        this.additionalServices = res.data
          .filter(s => s.required != 1)
          .map(s => ({ ...s, selected: false, price: +s.price }));
      } catch (error) {
        console.error('Services load error:', error);
      }
    },
    async loadDavolanishlar() {
      try {
        const res = await api.get('/api/v1/davolanish');
        this.davolanishlar = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (error) {
        console.error('Davolanish load error:', error);
        this.davolanishlar = [];
      }
    },
    async loadBronlar() {
      try {
        const res = await api.get('/api/v1/bron');
        this.bronlar = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (error) {
        console.error('Bron load error:', error);
        this.bronlar = [];
      }
    },
    markBusyRooms() {
      const today = new Date(this.today);
      const roomOccupancy = {};

      this.davolanishlar.forEach(dav => {
        if (!dav.kelish_sanasi || !dav.ketish_sanasi) return;
        const kelish = new Date(dav.kelish_sanasi);
        const ketish = new Date(dav.ketish_sanasi);
        if (today >= kelish && today <= ketish) {
          const roomId = dav.xona_id.toString();
          roomOccupancy[roomId] = (roomOccupancy[roomId] || 0) + 1;
        }
      });

      this.bronlar.forEach(bron => {
        if (bron.status !== 'faol') return;
        if (!bron.start || !bron.end) return;
        const start = new Date(bron.start);
        const end = new Date(bron.end);
        if (today >= start && today <= end) {
          const roomId = (bron.xona?.id || bron.xona_id).toString();
          roomOccupancy[roomId] = (roomOccupancy[roomId] || 0) + 1;
        }
      });

      this.rooms = this.rooms.map(r => {
        const roomId = (r.id ?? r.xona).toString();
        const odamlarSoni = roomOccupancy[roomId] || 0;
        const isBusy = odamlarSoni >= r.sigim;
        return {
          ...r,
          busy: isBusy,
          currentPeople: odamlarSoni
        };
      });
    },
    isCurrentRoom(roomId) {
      const today = new Date(this.today);
      return this.davolanishlar.some(dav => {
        if (dav.xona_id.toString() !== roomId.toString()) return false;
        const kelish = new Date(dav.kelish_sanasi);
        const ketish = new Date(dav.ketish_sanasi);
        return today >= kelish && today <= ketish;
      });
    },
    selectRoom(room) {
      if (!room.busy) {
        this.selectedRoom = { ...room };
      } else {
        alert('Bu xona band!');
      }
    },
    clearFilters() {
      this.roomFilterNumber = '';
      this.roomFilterName = '';
      this.roomFilterSigim = null;
    },
    cancelSelection() {
      this.selectedRoom = null;
      this.loadServices();
      this.extraPayments = { cash: 0, card: 0, click: 0 };
      this.has_child = false;
      this.childCount = 0;
    },
    removeAdditionalService(index) {
      this.additionalServices.splice(index, 1);
    },
    async submitDavolanish() {
      if (this.loading) return; // double submitni oldini olish
      if (!this.selectedRoom) {
        alert('Xona tanlang!');
        return;
      }
      if (!this.client?.id) {
        alert('Mijoz tanlanmagan!');
        return;
      }

      this.loading = true;
      let davolanish = null;
      try {
        // Davolanish yaratish
        const res = await api.post('/api/v1/davolanish', {
          client_id: this.client.id,
          xona_id: this.selectedRoom.id,
          kelish_sanasi: this.arrivalDate,
          ketish_sanasi: this.leaveDate
        });
        davolanish = res.data.data || res.data;

        if (!davolanish?.id) {
          alert('Davolanish ID topilmadi');
          this.loading = false;
          return;
        }

        // Xona joylashuv yaratish
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: davolanish.id,
          room_id: this.selectedRoom.id,
          from_date: this.arrivalDate,
          to_date: this.leaveDate,
          has_child: this.has_child ? 1 : 0,
          num_child: this.childCount || 0,
          price_per_day: this.selectedRoom.price
        });

        // Xizmatlarni saqlash
        const selectedServices = [
          ...this.mandatoryServices.filter(s => s.selected),
          ...this.additionalServices.filter(s => s.selected)
        ];

        await api.post('/api/v1/client-services', {
          client_id: this.client.id,
          davolanish_id: davolanish.id,
          services: selectedServices.map(s => ({
            service_id: s.id,
            price: s.price,
            mahal: s.mahal || 1,
            total_days: this.stayDays,
            start_date: this.arrivalDate,
            kunlik_vaqtlari: s.kunlik_vaqtlari || []
          }))
        });

        // To‘lovlarni saqlash
        await api.post('/api/v1/payments', {
          davolanish_id: davolanish.id,
          is_patient_payment: 1,
          client_id: this.client.id,
          cash: this.extraPayments.cash,
          card: this.extraPayments.card,
          click: this.extraPayments.click,
          total: this.totalSum,
          type: 'kirim',
          from: `${this.client.familiya} ${this.client.ism}`,
          datetime: new Date().toISOString()
        });

        // Tozalash va qayta yuklash
        this.cancelSelection();
        await Promise.all([
          this.loadRooms(),
          this.loadDavolanishlar(),
          this.loadBronlar(),
          this.loadServices()
        ]);
        this.markBusyRooms();
      } catch (error) {
        alert('Xatolik yuz berdi: ' + (error.message || error));
      } finally {
        this.loading = false;
      }
    },
    async loadAllData() {
      await Promise.all([
        this.loadRooms(),
        this.loadServices(),
        this.loadDavolanishlar(),
        this.loadBronlar()
      ]);
      this.markBusyRooms();
    }
  },
  async mounted() {
    const id = this.clientId || this.$route.params.clientId;
    if (!id) {
      alert('Client ID topilmadi!');
      return;
    }
    await this.loadClient(id);
    await this.loadAllData();
  }
};
</script>

<style scoped>
.taklif-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 15px;
}

.user-info {
  margin-bottom: 20px;
  font-weight: 600;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-row input {
  padding: 6px 10px;
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.clear-filter-btn {
  padding: 6px 15px;
  cursor: pointer;
  background-color: #f44336;
  border: none;
  color: white;
  border-radius: 4px;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.rooms-table th,
.rooms-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.room-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.room-row:hover {
  background-color: #f0f0f0;
}

.room-row.busy {
  background-color: #ffcccc;
  cursor: not-allowed;
}

.room-row.current {
  font-weight: 700;
}

.no-rooms {
  text-align: center;
  font-style: italic;
  color: #777;
}

.selected-room {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.date-row {
  display: flex;
  gap: 20px;
  margin: 15px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.services-section {
  margin-top: 20px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 5px 0;
}

.remove-btn {
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
}

.extra-payments .payment-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-sum {
  font-size: 16px;
}

.submit-btn {
  background-color: #3a86ff;
  border: none;
  color: white;
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
}

.submit-btn:disabled {
  background-color: #aacbff;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #ccc;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
}

.cancel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Loading overlay styles */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ccc;
  border-top: 5px solid #3a86ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
