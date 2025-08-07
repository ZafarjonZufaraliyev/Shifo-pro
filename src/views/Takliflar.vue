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

      <!-- Bolalik belgilovchi -->
      <div class="form-group" style="margin:10px 0">
        <label><input type="checkbox" v-model="has_child" /> Bolalik (has_child)</label>
      </div>

      <!-- Xizmatlar -->
      <div class="services-section">
        <h4>Majburiy xizmatlar</h4>
        <div
          v-for="(s, i) in mandatoryServices"
          :key="'m' + i"
          class="service-item"
        >
          <!-- Checkbox olib tashlandi, barcha majburiy xizmatlar doimo tanlangan deb hisoblanadi -->
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" /> so'm
        </div>

        <h4>Qo‘shimcha xizmatlar</h4>
        <div v-for="(s, i) in additionalServices" :key="'a' + i" class="service-item">
          <input type="checkbox" v-model="s.selected" />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" /> so'm
        </div>
      </div>

      <div class="total-sum">
        Jami: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
      </div>

      <button class="submit-btn" @click="submitDavolanish">📥 Bron qilish</button>
      <button class="cancel-btn" @click="cancelSelection">Bekor</button>
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
      davolanishlar: [],
      bronlar: []
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
      // Majburiy xizmatlar har doim tanlangan, checkbox yo'q, shuning uchun selectedga qaralmaydi
      const mandCost = this.mandatoryServices.reduce((sum, svc) => sum + svc.price, 0);
      const addCost = this.additionalServices.filter(svc => svc.selected).reduce((sum, svc) => sum + svc.price, 0);
      return roomCost + mandCost + addCost;
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
          busy: false
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
          .map(s => ({ ...s, selected: true, price: +s.price, clickCount: 0 }));
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
    },
    async submitDavolanish() {
      if (!this.selectedRoom) return alert('Xona tanlang!');

      let davolanish = null;
      try {
        const res = await api.post('/api/v1/davolanish', {
          client_id: this.client.id,
          xona_id: this.selectedRoom.id,
          kelish_sanasi: this.arrivalDate,
          ketish_sanasi: this.leaveDate
        });
        davolanish = res.data.data || res.data;
      } catch (error) {
        console.error('Davolanish saqlash xatosi:', error);
        return alert('Davolanish saqlanmadi');
      }
      if (!davolanish?.id) return alert('Davolanish ID topilmadi');

      try {
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: davolanish.id,
          room_id: this.selectedRoom.id,
          from_date: this.arrivalDate,
          to_date: this.leaveDate,
          has_child: this.has_child ? 1 : 0,
          price_per_day: this.selectedRoom.price
        });
      } catch (error) {
        console.error('Joylashuv saqlash xatosi:', error);
        return alert('Joylashuv saqlanmadi');
      }

      // Majburiy xizmatlar - barchasi doim tanlangan
      // Qo'shimcha xizmatlar - faqat selected = true bo'lganlar
      const selectedServices = [
        ...this.mandatoryServices,
        ...this.additionalServices.filter(s => s.selected)
      ];

      try {
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
        alert('✅ Hammasi saqlandi');
      } catch (error) {
        console.error('Xizmatlar saqlash xatosi:', error);
        alert('Xizmatlar saqlanmadi');
      }

      this.cancelSelection();

      await Promise.all([
        this.loadRooms(),
        this.loadDavolanishlar(),
        this.loadBronlar()
      ]);
      this.markBusyRooms();
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
    await Promise.all([
      this.loadRooms(),
      this.loadServices(),
      this.loadDavolanishlar(),
      this.loadBronlar()
    ]);
    this.markBusyRooms();
  }
};
</script>


<style scoped>
.taklif-container {
  max-width: 1200px;
  margin: 20 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.title {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}
.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.filter-row input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.clear-filter-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.clear-filter-btn:hover {
  background-color: #ff3b3b;
}
.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.rooms-table th,
.rooms-table td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: center;
}
.room-row.busy {
  background-color: #ffcccc;
  cursor: not-allowed;
}
.room-row.current {
  background-color: #fff4e5;
  font-weight: 700;
}
.no-rooms {
  text-align: center;
  font-style: italic;
  color: #888;
}
.selected-room {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}
.date-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.services-section {
  margin-bottom: 15px;
}
.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  cursor: pointer;
}
.total-sum {
  font-size: 1.2em;
  margin-bottom: 20px;
  font-weight: 700;
}
.submit-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
}
.submit-btn:hover {
  background-color: #45a049;
}
.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.cancel-btn:hover {
  background-color: #d32f2f;
}
</style>
