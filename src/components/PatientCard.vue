<template>
  <div class="patient-cardd" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <div class="info-grid">
      <div><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div><strong>Ism:</strong> {{ patient.ism }}</div>
      <div><strong>Yoshi:</strong> {{ hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼlum' }}</div>
    </div>

    <div class="tab-header">
      <div :class="['tab-title', { active: activeTab === 'xizmatlar' }]" @click="activeTab = 'xizmatlar'">Xizmatlar</div>
      <div :class="['tab-title', { active: activeTab === 'kasalliklar' }]" @click="activeTab = 'kasalliklar'">Kasalliklar</div>
      <div :class="['tab-title', { active: activeTab === 'natijalar' }]" @click="activeTab = 'natijalar'">Natijalar</div>
      <div :class="['tab-title', { active: activeTab === 'xonalar' }]" @click="activeTab = 'xonalar'">Xonalar</div>
      <div :class="['tab-title', { active: activeTab === 'davolanishlar' }]" @click="activeTab = 'davolanishlar'">Davolanishlar</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>

          <template v-if="activeTab === 'xizmatlar'">
            <th>Xizmat nomi</th>
            <th>Narxi</th>
            <th>Sana</th>
          </template>

          <th v-if="activeTab === 'kasalliklar'">Kasallik nomi</th>

          <th v-if="activeTab === 'natijalar'">Natija</th>

          <template v-if="activeTab === 'xonalar'">
            <th>Xona raqami</th>
            <th>Narxi</th>
            <th>Kirgan</th>
            <th>Chiqgan</th>
            <th>Amal</th>
          </template>

          <template v-if="activeTab === 'davolanishlar'">
            <th>Davolanish ID</th>
            <th>Boshlanish sanasi</th>
            <th>Tugash sanasi</th>
            <th>Status</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in filteredData" :key="item.id || i">
          <td>{{ i + 1 }}</td>

          <!-- Xizmatlar -->
          <template v-if="activeTab === 'xizmatlar'">
            <td>{{ item.nomi || '-' }}</td>
            <td>{{ formatPrice(item.narxi || item.price) }}</td>
            <td>{{ formatDate(item.sana) }}</td>
          </template>

          <!-- Kasalliklar -->
          <td v-if="activeTab === 'kasalliklar'">{{ item.nomi || '-' }}</td>

          <!-- Natijalar -->
          <td v-if="activeTab === 'natijalar'">{{ item.natija || '-' }}</td>

          <!-- Xonalar -->
          <template v-if="activeTab === 'xonalar'">
            <td>{{ item.roomNumber || '-' }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatDate(item.kirish_sanasi) }}</td>
            <td>
              <input type="date" v-model="item.chiqish_sanasi" />
            </td>
            <td>
              <button @click="updateExitDate(item)">Yangilash</button>
            </td>
          </template>

          <!-- Davolanishlar -->
          <template v-if="activeTab === 'davolanishlar'">
            <td>{{ item.id }}</td>
            <td>{{ formatDate(item.from_date || item.kelish_sanasi) }}</td>
            <td>{{ formatDate(item.to_date || item.tugash_sanasi) }}</td>
            <td>{{ item.status === 1 ? 'Aktiv' : 'Faol emas' }}</td>
          </template>
        </tr>

        <!-- Yangi xona qo'shish qatori -->
        <tr v-if="activeTab === 'xonalar'" class="input-row">
          <td>*</td>
          <td>
            <select v-model="rr.xona_id">
              <option disabled value="">Tanlang</option>
              <option v-for="r in availableRooms" :key="r.id" :value="r.id">
                {{ r.room_type?.name || 'Nomaʼlum' }} {{ r.xona }}
              </option>
            </select>
          </td>
          <td>{{ rrPrice ? formatPrice(rrPrice) : '-' }}</td>
          <td><input type="date" v-model="rr.kirish_sanasi" /></td>
          <td><input type="date" v-model="rr.chiqish_sanasi" /></td>
          <td><button @click="submitReRegister">➕</button></td>
        </tr>
      </tbody>
    </table>

    <router-link :to="`/${role}/bemorlar`" class="btn-back">↩ Orqaga</router-link>
  </div>

  <div v-else class="loading-container">
    <p>⏳ Yuklanmoqda...</p>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'PatientCardView',

  data() {
    return {
      loading: false,
      patient: null,
      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],
      roomAssignments: [],
      stays: [],
      availableRooms: [],
      availableRoomTypes: [],
      allServices: [],
      activeTab: 'xizmatlar',
      rr: { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] },
      role: localStorage.getItem('role') || 'mini',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}'),
    };
  },

  computed: {
    latestStay() {
      if (!this.stays.length) return null;
      return this.stays.reduce((latest, current) => {
        const d1 = new Date(current.from_date || current.kelish_sanasi);
        const d2 = new Date(latest.from_date || latest.kelish_sanasi);
        return d1 > d2 ? current : latest;
      });
    },

    roomData() {
      const stayIds = this.stays.map(s => s.id);
      return this.roomAssignments
        .filter(a => stayIds.includes(Number(a.davolanish_id)))
        .map(a => {
          const room = this.availableRooms.find(r => String(r.id) === String(a.room_id)) || {};
          const roomType = this.availableRoomTypes.find(rt => String(rt.id) === String(room.room_type_id)) || {};
          const pricePerDay = Number(a.price_per_day || roomType.Narxi || roomType.price || 0);

          const fromDate = new Date(a.from_date || a.kirish_sanasi);
          const toDate = new Date(a.to_date || a.chiqish_sanasi);
          const diff = toDate - fromDate;
          const days = diff >= 0 ? Math.floor(diff / 86400000) + 1 : 0;

          return {
            id: a.id,
            roomNumber: room.xona || room.room_number || room.nomi || room.name || 'Nomaʼlum',
            roomName: room.nomi || room.name || room.xona || room.room_number || 'Nomaʼlum',
            price: pricePerDay * days,
            kirish_sanasi: a.from_date || a.kirish_sanasi,
            chiqish_sanasi: a.to_date || a.chiqish_sanasi,
            sana: a.from_date || a.kirish_sanasi,
          };
        });
    },

    filteredData() {
      if (this.activeTab === 'xizmatlar') return this.xizmatlar;
      if (this.activeTab === 'kasalliklar') return this.kasalliklar;
      if (this.activeTab === 'natijalar') return this.natijalar;
      if (this.activeTab === 'xonalar') return this.roomData;
      if (this.activeTab === 'davolanishlar') return this.stays;
      return [];
    },

    rrPrice() {
      const room = this.availableRooms.find(r => r.id === this.rr.xona_id);
      if (!room) return 0;
      const roomType = Array.isArray(this.availableRoomTypes)
        ? this.availableRoomTypes.find(rt => Number(rt.id) === Number(room.room_type_id))
        : null;
      return Number(roomType?.Narxi || roomType?.price || 0);
    },
  },

  methods: {
    formatDate(d) {
      if (!d) return '-';
      const dt = new Date(d);
      return isNaN(dt) ? '-' : dt.toLocaleDateString('uz-UZ');
    },

    formatPrice(p) {
      return `${Number(p || 0).toLocaleString()} soʻm`;
    },

    hisoblaYosh(d) {
      if (!d) return '-';
      const birth = new Date(d);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ) age--;
      return age;
    },

    async fetchAll() {
      this.loading = true;
      const clientId = Number(this.$route.params.id);
      try {
        // Bemor ma'lumotlari
        const { data: patient } = await api.get(`/api/v1/clients/${clientId}`);
        this.patient = patient;

        // Kasalliklar va natijalar (filtrlash)
        this.kasalliklar = (patient.kasalliklar || []).filter(k =>
          Number(k.client_id ?? k.clientId ?? 0) === clientId
        );
        this.natijalar = (patient.natijalar || []).filter(n =>
          Number(n.client_id ?? n.clientId ?? 0) === clientId
        );

        // Davolanishlar (stays)
        const response = await api.get(`/api/v1/davolanish?client_id=${clientId}`);
        const allStays = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        this.stays = allStays;

        // Xona joylashuvlarni bitta chaqiruv orqali olish
        const { data: roomAssignmentsData } = await api.get(`/api/v1/xona-joylashuv/kassa?client_id=${clientId}`);
        this.roomAssignments = Array.isArray(roomAssignmentsData) ? roomAssignmentsData : (roomAssignmentsData?.data || []);

        // Xona turlari va xonalar
        const { data: roomTypesRaw } = await api.get('/api/v1/room-types');
        this.availableRoomTypes = Array.isArray(roomTypesRaw?.data) ? roomTypesRaw.data : roomTypesRaw;

        const { data: rooms } = await api.get('/api/v1/room');
        this.availableRooms = rooms || [];

        // Xizmatlar va client xizmatlari
        const { data: services } = await api.get('/api/v1/services');
        this.allServices = services || [];

        const clientServicesRes = await api.get('/api/v1/client-services');
        const clientServices = Array.isArray(clientServicesRes.data)
          ? clientServicesRes.data
          : (clientServicesRes.data?.data || []);

        this.xizmatlar = clientServices
          .filter(s => Number(s.client_id) === clientId)
          .map(s => {
            const info = this.allServices.find(a => a.id === Number(s.service_id));
            return {
              ...s,
              nomi: info?.nomi || info?.name || 'Nomaʼlum',
              narxi: Number(s.price || s.narxi || 0),
              sana: s.start_date || s.sana,
            };
          });
      } catch (e) {
        console.error("❌ Ma'lumotlarni olishda xatolik:", e);
        alert("❌ Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },

    async updateExitDate(item) {
      if (!item.chiqish_sanasi) return alert('❌ Chiqish sanasi kiritilmagan');
      try {
        await api.put(`/api/v1/xona-joylashuv/${item.id}`, { to_date: item.chiqish_sanasi });
        alert('✅ Chiqish sanasi yangilandi');
        await this.fetchAll();
      } catch (err) {
        console.error(err);
        alert('❌ Yangilashda xatolik yuz berdi');
      }
    },

    async submitReRegister() {
      const r = this.rr;
      if (!r.kirish_sanasi || !r.chiqish_sanasi || !r.xona_id) {
        return alert('❗ Barcha maydonlar toʻldirilishi kerak');
      }

      try {
        let stay = this.latestStay;
        // Agar oxirgi davolanish yopilgan bo'lsa, yangi ochamiz
        if (!stay || stay.to_date) {
          const { data: newStay } = await api.post('/api/v1/davolanish', {
            client_id: this.patient.id,
            from_date: r.kirish_sanasi,
            to_date: r.chiqish_sanasi,
            create_user_id: this.currentUser.id,
          });
          stay = newStay;
        }

        // Oxirgi xona joylashuvni topib, undan chiqish sanasini kirish sanasiga o'zgartirish (agar kerak bo'lsa)
        let lastRoom = null;
        for (const ra of this.roomAssignments) {
          if (ra.davolanish_id === stay.id) {
            if (!lastRoom || new Date(ra.from_date) > new Date(lastRoom.from_date)) {
              lastRoom = ra;
            }
          }
        }
        if (lastRoom) {
          await api.put(`/api/v1/xona-joylashuv/${lastRoom.id}`, {
            ...lastRoom,
            to_date: r.kirish_sanasi,
          });
        }

        // Yangi xona joylashuv qo'shish
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: stay.id,
          room_id: r.xona_id,
          from_date: r.kirish_sanasi,
          to_date: r.chiqish_sanasi,
          price_per_day: this.rrPrice,
        });

        // Tanlangan xizmatlarni qo'shish
        for (const sid of r.xizmatlar) {
          const s = this.allServices.find(srv => srv.id === sid);
          await api.post('/api/v1/client-services', {
            client_id: this.patient.id,
            davolanish_id: stay.id,
            service_id: sid,
            start_date: r.kirish_sanasi,
            price: s ? (s.narxi || s.price || 0) : 0,
          });
        }

        alert('✅ Muvaffaqiyatli qoʻshildi');
        this.rr = { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] };
        await this.fetchAll();
      } catch (err) {
        console.error(err);
        alert('❌ Saqlashda xatolik yuz berdi');
      }
    },
  },

  mounted() {
    this.fetchAll();
  },
};
</script>


<style scoped>
.patient-cardd {
  max-width: 1200px;
  margin: 20px auto;
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.patient-cardd h2 {
  text-align: center;
  color: #007BFF;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  background: #f4f9ff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1eaff;
}

.info-grid div {
  font-size: 15px;
  color: #333;
}

.tab-header {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-title {
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
  color: #666;
  transition: all 0.25s;
  border-bottom: 3px solid transparent;
}

.tab-title:hover {
  color: #007BFF;
}

.tab-title.active {
  color: #007BFF;
  border-color: #007BFF;
  background-color: #f0f8ff;
  border-radius: 6px 6px 0 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background-color: #f1f6ff;
  font-weight: bold;
  color: #333;
}

.data-table tr:nth-child(even) {
  background-color: #fafafa;
}

.input-row input[type="date"],
.input-row select {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  transition: border 0.3s ease;
}

.input-row input[type="date"]:focus,
.input-row select:focus {
  border-color: #007BFF;
  outline: none;
}

button {
  padding: 6px 12px;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s;
}

button:hover {
  background-color: #0056b3;
}

.btn-back {
  display: inline-block;
  margin-top: 15px;
  text-decoration: none;
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  color: #007BFF;
  transition: background 0.25s;
}

.btn-back:hover {
  background: #e6f0ff;
}

.loading-container {
  text-align: center;
  margin-top: 80px;
  font-size: 18px;
  color: #888;
}
</style>
