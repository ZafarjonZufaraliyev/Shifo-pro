<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Mijoz -->
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

    <!-- Xonalar jadvali -->
    <div v-if="!selectedRoom">
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Turi</th>
            <th>№</th>
            <th>Sig'imi</th>
            <th>Narxi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRooms" :key="r.id" :class="['room-row', { busy: r.busy }]" @click="selectRoom(r)"
            :title="r.busy ? 'Band' : 'Tanlash'">
            <td>{{ r.room_type }}</td>
            <td>{{ r.xona }}</td>
            <td>{{ r.sigim }}</td>
            <td>{{ r.price.toLocaleString('ru-RU') }}</td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td class="no-rooms" colspan="4">Xonalar topilmadi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tanlangan xona -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>{{ selectedRoom.display }}</h3>

      <p>
        Narxi:
        <input type="number" v-model.number="selectedRoom.price" style="width:120px" /> so'm
      </p>

      <div class="date-row">
        <div class="form-group">
          <label>Kelish</label>
          <input type="date" :min="today" v-model="arrivalDate" @change="loadRoomBookings" />
        </div>
        <div class="form-group">
          <label>Kunlar</label>
          <input type="number" min="0" v-model.number="stayDays" @input="loadRoomBookings" />
        </div>
        <div class="form-group">
          <label>Ketish</label>
          <input type="date" :value="leaveDate" readonly />
        </div>
      </div>

      <!-- has_child -->
      <div class="form-group" style="margin:10px 0">
        <label><input type="checkbox" v-model="has_child" /> Bolalik (has_child)</label>
      </div>

      <!-- Xizmatlar -->
      <div class="services-section">
        <h4>Majburiy xizmatlar</h4>
        <div v-for="(s, i) in mandatoryServices" :key="'m' + i" class="service-item" @click="handleMandatoryClick(s)">
          <input type="checkbox" :checked="s.selected" readonly />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" /> so'm
          <small>({{ s.clickCount }})</small>
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
      has_child: false       // boolean
    };
  },

  computed: {
    leaveDate() {
      const d = new Date(this.arrivalDate);
      d.setDate(d.getDate() + this.stayDays-1);
      return d.toISOString().slice(0, 10);
    },
    filteredRooms() {
      return this.rooms.filter(r => {
        const a = this.roomFilterNumber ? r.xona.includes(this.roomFilterNumber) : true;
        const b = this.roomFilterName
          ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase())
          : true;
        const c = this.roomFilterSigim ? r.sigim == this.roomFilterSigim : true;
        return a && b && c;
      });
    },
    totalSum() {
      const room = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mand = this.mandatoryServices.reduce((s, x) => s + (x.selected ? x.price : 0), 0);
      const add = this.additionalServices.filter(x => x.selected).reduce((s, x) => s + x.price, 0);
      return room + mand + add;
    }
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
    /* ===== yuklamalar ===== */
    async loadClient(id) {
      try {
        this.client = (await api.get(`/api/v1/clients/${id}`)).data;
      } catch (e) { console.error('client', e); }
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
      } catch (e) { console.error('rooms', e); }
    },
    async loadRoomBookings() {
      try {
        if (!this.arrivalDate || !this.leaveDate) return;
        const res = await api.get('/api/v1/bron');
        const a = new Date(this.arrivalDate), b = new Date(this.leaveDate);
        const busyIds = res.data.filter(br => {
          const s = new Date(br.start), e = new Date(br.end);
          return a <= e && b >= s;
        }).map(br => br.xona_id.toString());
        this.rooms = this.rooms.map(r => ({ ...r, busy: busyIds.includes(r.id.toString()) }));
        if (this.selectedRoom && busyIds.includes(this.selectedRoom.id.toString())) {
          this.cancelSelection(); alert('Tanlangan xona band bo‘ldi.');
        }
      } catch (e) { console.error('bron', e); }
    },
    async loadServices() {
      try {
        const res = await api.get('/api/v1/services');
        this.mandatoryServices = res.data.filter(x => x.required == 1).map(x => ({ ...x, selected: true, price: +x.price, clickCount: 0 }));
        this.additionalServices = res.data.filter(x => x.required != 1).map(x => ({ ...x, selected: false, price: +x.price }));
      } catch (e) { console.error('services', e); }
    },

    /* ===== UI yordamchi ===== */
    selectRoom(r) { if (!r.busy) this.selectedRoom = { ...r }; },
    clearFilters() { this.roomFilterNumber = ''; this.roomFilterName = ''; this.roomFilterSigim = null; },
    cancelSelection() { this.selectedRoom = null; this.loadServices(); },
    handleMandatoryClick(s) { s.clickCount++; if (s.clickCount >= 5) { s.selected = false; s.clickCount = 0; } },

    /* ===== Submit ===== */
    async submitDavolanish() {
      if (!this.selectedRoom) return alert('Xona tanlang!');

      // --- 1. davolanish
      let dav = null;
      try {
        const r = await api.post('/api/v1/davolanish', {
          client_id: this.client.id,
          xona_id: this.selectedRoom.id,
          kelish_sanasi: this.arrivalDate,
          ketish_sanasi: this.leaveDate
        });
        dav = r.data.data;
      } catch (e) { console.error('dav', e); return alert('Davolanish saqlanmadi'); }
      if (!dav?.id) return alert('Davolanish ID topilmadi');

      // --- 2. xona-joylashuv
      try {
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: dav.id,
          room_id: this.selectedRoom.id,
          from_date: this.arrivalDate,
          to_date: this.leaveDate,
          has_child: this.has_child ? 1 : 0,
          price_per_day: this.selectedRoom.price
        });
      } catch (e) { console.error('joy', e); return alert('Joylashuv saqlanmadi'); }

      // --- 3. xizmatlar
      const sel = [...this.mandatoryServices.filter(x => x.selected), ...this.additionalServices.filter(x => x.selected)];
      try {
        await api.post('/api/v1/client-services', {
          client_id: this.client.id,
          davolanish_id: dav.id,
          services: sel.map(s => ({
            service_id: s.id, price: s.price, mahal: s.mahal || 1,
            total_days: this.stayDays, start_date: this.arrivalDate,
            kunlik_vaqtlari: s.kunlik_vaqtlari || []
          }))
        });
        alert('✅ Hammasi saqlandi');
      } catch (e) { console.error('serv', e); alert('Xizmatlar saqlanmadi'); }

      this.cancelSelection();
      this.loadRoomBookings();
    }
  }
};
</script>

<style scoped>
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
  background-color: #ffe4e6 !important;
  color: #991b1b !important;
  border: 1px solid #f87171 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  font-style: italic;
  font-weight: bold;
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

.services-section h3,
.services-section h4 {
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
  .filter-row,
  .date-row {
    flex-direction: column;
  }

  .submit-btn {
    width: 100%;
    float: none;
  }
}
</style>
