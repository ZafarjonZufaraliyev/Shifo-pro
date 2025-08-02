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
              <span v-if="isCurrentRoom(r.id)" style="color: #d97706; font-weight: 700;">Joriy yotmoqda</span>
              <span v-else-if="r.busy" style="color: red">Band</span>
              <span v-else style="color: green">Bo'sh</span>
            </td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td class="no-rooms" colspan="5">Xonalar topilmadi</td>
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

      <!-- has_child -->
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
          @click="handleMandatoryClick(s)"
        >
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
      has_child: false,
      davolanishlar: [],  // davolanishlar ro'yxati
      bronlar: []         // bronlar ro'yxati
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
        const a = this.roomFilterNumber ? r.xona.toString().includes(this.roomFilterNumber) : true;
        const b = this.roomFilterName ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase()) : true;
        const c = this.roomFilterSigim ? r.sigim == this.roomFilterSigim : true;
        return a && b && c;
      });
    },
    totalSum() {
      const roomCost = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mand = this.mandatoryServices.reduce((sum, svc) => sum + (svc.selected ? svc.price : 0), 0);
      const add = this.additionalServices.filter(svc => svc.selected).reduce((sum, svc) => sum + svc.price, 0);
      return roomCost + mand + add;
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
        this.mandatoryServices = res.data.filter(s => s.required == 1).map(s => ({ ...s, selected: true, price: +s.price, clickCount: 0 }));
        this.additionalServices = res.data.filter(s => s.required != 1).map(s => ({ ...s, selected: false, price: +s.price }));
      } catch (error) {
        console.error('Services load error:', error);
      }
    },
    async loadDavolanishlar() {
      try {
        const res = await api.get('/api/v1/davolanish');
        this.davolanishlar = res.data;
      } catch (error) {
        console.error('Davolanish load error:', error);
      }
    },
    async loadBronlar() {
      try {
        const res = await api.get('/api/v1/bron');
        this.bronlar = res.data;
        console.log(this.bronlar)
      } catch (error) {
        console.error('Bron load error:', error);
      }
    },
    markBusyRooms() {
      const today = new Date(this.today);

      // Barcha xonalarni dastlab bo'sh deb belgilang
      this.rooms = this.rooms.map(r => ({ ...r, busy: false }));

      const busyRoomIds = new Set();

      // Davolanishlar bo'yicha band xonalar
      this.davolanishlar.forEach(dav => {
        const kelish = new Date(dav.kelish_sanasi);
        const ketish = new Date(dav.ketish_sanasi);
        if (today >= kelish && today <= ketish) {
          busyRoomIds.add(dav.xona_id.toString());
        }
      });

      // Bronlar bo'yicha band xonalar (status "faol" bo'lsa)
      this.bronlar.forEach(bron => {
        if (bron.status !== 'faol') return;
        const start = new Date(bron.start);
        const end = new Date(bron.end);
        if (today >= start && today <= end) {
          busyRoomIds.add(bron.xona_id.toString());
        }
      });

      // Rooms massivida busy flagini yangilang
      this.rooms = this.rooms.map(r => ({
        ...r,
        busy: busyRoomIds.has(r.id.toString())
      }));
    },
    isCurrentRoom(roomId) {
      const today = new Date(this.today);
      // Davolanishlar orasida joriy kunda shu xonada yotgan bo'lsa true qaytaradi
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
    handleMandatoryClick(service) {
      service.clickCount++;
      if (service.clickCount >= 5) {
        service.selected = false;
        service.clickCount = 0;
      }
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
        davolanish = res.data.data;
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

      const selectedServices = [...this.mandatoryServices.filter(s => s.selected), ...this.additionalServices.filter(s => s.selected)];
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
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.filter-row {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
}

.rooms-table th,
.rooms-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.room-row {
  cursor: pointer;
}

.room-row.busy {
  background-color: #f8d7da;
}

.room-row.current {
  background-color: #fff3cd;
}

.no-rooms {
  text-align: center;
  font-style: italic;
  color: #999;
}

.selected-room {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 15px;
}

.date-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
}

.services-section {
  margin-top: 10px;
}

.service-item {
  margin-bottom: 5px;
  cursor: pointer;
}

.total-sum {
  margin-top: 15px;
  font-size: 1.2em;
}

.submit-btn,
.cancel-btn {
  margin-top: 15px;
  margin-right: 10px;
  padding: 8px 15px;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn {
  background-color: #28a745;
  color: white;
  border: none;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
  border: none;
}
</style>
