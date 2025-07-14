<template>
  <div class="patient-card" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <!-- === Asosiy maʼlumotlar === -->
    <div class="info-grid">
      <div class="info-item"><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div class="info-item"><strong>Ism:</strong> {{ patient.ism }}</div>
      <div class="info-item"><strong>Yoshi:</strong> {{ hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div class="info-item"><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼlum' }}</div>
      <div class="info-item"><strong>Kelgan:</strong> {{ formatDate(latestStay?.kirish_sanasi) }}</div>
      <div class="info-item"><strong>Ketish:</strong> {{ formatDate(latestStay?.chiqish_sanasi) }}</div>
    </div>

    <!-- === Tablar === -->
    <div class="tab-header">
      <div :class="['tab-title', { active: activeTab === 'xizmatlar' }]" @click="activeTab = 'xizmatlar'">Xizmatlar
      </div>
      <div :class="['tab-title', { active: activeTab === 'kasalliklar' }]" @click="activeTab = 'kasalliklar'">
        Kasalliklar</div>
      <div :class="['tab-title', { active: activeTab === 'natijalar' }]" @click="activeTab = 'natijalar'">Natijalar
      </div>
      <div :class="['tab-title', { active: activeTab === 'xonalar' }]" @click="activeTab = 'xonalar'">Xonalar</div>
    </div>

    <!-- === Maʼlumot jadvali === -->
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <template v-if="activeTab === 'xizmatlar'">
            <th>Xizmat nomi</th>
            <th>Narxi</th>
            <th>Holati</th>
          </template>
          <th v-if="activeTab === 'kasalliklar'">Kasallik nomi</th>
          <th v-if="activeTab === 'natijalar'">Natija</th>
          <template v-if="activeTab === 'xonalar'">
            <th>Xona #</th>
            <th>Xona nomi</th>
            <th>Narxi</th>
            <th>Kirgan</th>
            <th>Chiqgan</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in filteredData" :key="i">
          <td>{{ i + 1 }}</td>

          <template v-if="activeTab === 'xizmatlar'">
            <td>{{ item.nomi }}</td>
            <td>{{ formatPrice(item.narxi) }}</td>
            <td>
              <span :class="['badge', item.tolangan ? 'paid' : 'unpaid']">
                {{ item.tolangan ? 'To‘langan' : 'To‘lanmagan' }}
              </span>
            </td>
          </template>

          <td v-if="activeTab === 'kasalliklar'">{{ item.nomi }}</td>
          <td v-if="activeTab === 'natijalar'">{{ item.natija }}</td>

          <template v-if="activeTab === 'xonalar'">
            <td>{{ item.roomNumber }}</td>
            <td>{{ item.roomName }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatDate(item.kirish_sanasi) }}</td>
            <td>{{ formatDate(item.chiqish_sanasi) }}</td>

          </template>

          <td v-if="activeTab !== 'xonalar'">{{ formatDate(item.sana) }}</td>
        </tr>

        <!-- ➕ Yangi xona satri -->
        <tr v-if="activeTab === 'xonalar'" class="input-row">
          <td>*</td>
          <td>
            <select v-model="rr.xona_id">
              <option disabled value="">Tanlang</option>
              <option v-for="r in availableRooms" :key="r.id" :value="r.id">{{ r.xona }}</option>
            </select>
          </td>
          <td>{{ rrPrice ? formatPrice(rrPrice) : '-' }}</td>
          <td>{{ rrPrice ? formatPrice(rrPrice) : '-' }}</td>

          <td><input type="date" v-model="rr.kirish_sanasi" /></td>
          <td><input type="date" v-model="rr.chiqish_sanasi" /></td>
          <td><button @click="submitReRegister">➕</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Moliyaviy xulosa -->
    <div v-if="activeTab === 'xizmatlar'" class="financial-summary">
      <p>💰 Jami: {{ formatPrice(total) }}</p>
      <p>✅ To‘langan: {{ formatPrice(totalPaid) }}</p>
      <p>❌ Qarz: {{ formatPrice(totalUnpaid) }}</p>
    </div>

    <router-link :to="`/${role}/bemorlar`" class="btn-back">↩ Orqaga</router-link>
  </div>

  <div v-else class="loading-container">
    <p>⏳ Yuklanmoqda...</p>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'PatientCardView',

  /* -------------------------------- data -------------------------------- */
  data() {
    return {
      /* yuklanish holati */
      loading: false,

      /* bemor va davolanish ma’lumotlari */
      patient: null,
      stays: [],              // davolanishlar (kelish‑ketish tarixi)
      roomAssignments: [],    // xona‑joylashuvlar

      /* qo‘shimcha ma’lumotlar */
      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],

      /* kataloglar */
      availableRooms: [],
      availableRoomTypes: [],
      allServices: [],

      /* UI holati */
      activeTab: 'xizmatlar',
      rr: { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] },

      /* foydalanuvchi va rol */
      role: localStorage.getItem('role') || 'mini',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}')  // { id, name, ... }
    };
  },

  /* ------------------------------ computed ------------------------------ */
  computed: {
    /** xona turlarining xavfsiz massivi */
    roomTypesArr() {
      return Array.isArray(this.availableRoomTypes) ? this.availableRoomTypes : [];
    },

    /** xona turi ID ➜ narx */
    roomTypePriceMap() {
      const map = {};
      this.roomTypesArr.forEach(rt => {
        map[rt.id] = Number(rt.Narxi || rt.price || rt.narxi || 0);
      });
      return map;
    },

    /** eng so‘nggi davolanish */
    latestStay() {
      return this.stays[0] || null;
    },

    /** jadvalda ko‘rinadigan xona ma’lumotlari */
    roomData() {
      return (Array.isArray(this.roomAssignments) ? this.roomAssignments : []).map(a => {
        const room = (a.room || this.availableRooms.find(r => r.id == a.room_id)) || {};
        const pricePerDay = Number(a.price_per_day || this.roomTypePriceMap[room.room_type_id] || 0);
        const days = Math.max(Math.ceil((new Date(a.to_date) - new Date(a.from_date)) / 864e5), 0);

        return {
          roomNumber: room.xona || '-',
          roomName:   room.nomi || room.xona || '-',
          price:      pricePerDay * days,
          kirish_sanasi: a.from_date,
          chiqish_sanasi: a.to_date,
          sana: a.from_date
        };
      });
    },

    /** joriy tab uchun ma’lumot */
    filteredData() {
      switch (this.activeTab) {
        case 'xizmatlar': return this.xizmatlar;
        case 'kasalliklar': return this.kasalliklar;
        case 'natijalar':   return this.natijalar;
        case 'xonalar':     return this.roomData;
        default:            return [];
      }
    },

    /** yangi xona tanlanganida kunlik narx */
    rrPrice() {
      const r = this.availableRooms.find(x => x.id === this.rr.xona_id);
      return r ? Number(this.roomTypePriceMap[r.room_type_id] || 0) : 0;
    },

    /** moliyaviy yig‘indilar */
    total() {
      return this.xizmatlar.reduce((s, x) => s + (x.narxi || 0), 0);
    },
    totalPaid() {
      return this.xizmatlar.filter(x => x.tolangan).reduce((s, x) => s + (x.narxi || 0), 0);
    },
    totalUnpaid() {
      return this.total - this.totalPaid;
    }
  },

  /* ------------------------------ methods ------------------------------ */
  methods: {
    /* --- format yordamchilari --- */
    formatDate(d) {
      return d ? new Date(d).toLocaleDateString('uz-UZ') : '-';
    },
    formatPrice(p) {
      return p ? `${Number(p).toLocaleString()} soʻm` : '0 soʻm';
    },
    hisoblaYosh(d) {
      if (!d) return '-';
      const b = new Date(d), t = new Date();
      let y = t.getFullYear() - b.getFullYear();
      if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) y--;
      return y;
    },

    /* --- hamma narsani olish --- */
    async fetchAll() {
      this.loading = true;
      try {
        const id = this.$route.params.id;

        /* parallel so‘rovlar */
        const [
          p, st, rooms, services, roomTypes, roomAssigns
        ] = await Promise.all([
          api.get(`/api/v1/clients/${id}`),
          api.get(`/api/v1/davolanish?client_id=${id}`),
          api.get('/api/v1/room'),
          api.get('/api/v1/services'),
          api.get('/api/v1/room-types'),
          api.get(`/api/v1/xona-joylashuv?client_id=${id}`)
        ]);

        /* state yangilash */
        this.patient            = p.data;
        this.stays              = st.data;
        this.availableRooms     = rooms.data;
        this.allServices        = services.data;
        this.availableRoomTypes = roomTypes.data || [];
        this.roomAssignments    = roomAssigns.data || [];
        this.kasalliklar        = this.patient.kasalliklar || [];
        this.natijalar          = this.patient.natijalar   || [];

        /* xizmatlar (so‘nggi davolanish bo‘yicha) */
        if (this.latestStay) {
          const { data: clientSrv } = await api.get(
            `/api/v1/client-services?davolanish_id=${this.latestStay.id}`
          );
          this.xizmatlar = clientSrv.map(srv => ({
            ...srv,
            nomi:  this.allServices.find(a => a.id === srv.service_id)?.nomi || srv.nomi,
            narxi: srv.narxi ?? srv.price ?? 0
          }));
        }
      } catch (err) {
        console.error(err);
        alert('Maʼlumotlarni olishda xatolik');
      } finally {
        this.loading = false;
      }
    },

    /* --- “Yana yotaman” (re‑register) --- */
    async submitReRegister() {
      /* forma tekshiruvi */
      const r = this.rr;
      if (!r.kirish_sanasi || !r.chiqish_sanasi || !r.xona_id) {
        return alert('Barcha maydonlarni toʻldiring');
      }

      try {
        /* 1. Davolanish yaratish */
        const { data: newStay } = await api.post('/api/v1/davolanish', {
          client_id:       this.patient.id,
          room_id:         r.xona_id,          // ← backend nomi
          from_date:       r.kirish_sanasi,
          to_date:         r.chiqish_sanasi,
          create_user_id:  this.currentUser.id // ← xodim ID
        });

        /* 2. Xona‑joylashuv */
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: newStay.id,
          room_id:       r.xona_id,
          from_date:     r.kirish_sanasi,
          to_date:       r.chiqish_sanasi
        });

        /* 3. Xizmatlar biriktirish */
        for (const sid of r.xizmatlar) {
          await api.post('/api/v1/client-services', {
            client_id:      this.patient.id,
            davolanish_id:  newStay.id,
            service_id:     sid,
            start_date:     r.kirish_sanasi,
            price:          this.allServices.find(s => s.id === sid)?.narxi || 0
          });
        }

        alert('✅ Yangi yotish muvaffaqiyatli qo‘shildi');
        /* forma tozalash va yangilash */
        this.rr = { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] };
        this.fetchAll();
      } catch (err) {
        console.error(err);
        alert('❌ Saqlashda xatolik yuz berdi');
      }
    }
  },

  /* ------------------------------ lifecycle ----------------------------- */
  mounted() {
    this.fetchAll();
  }
};
</script>


<style scoped>
.patient-card {
  background: #fff;
  max-width: 1200px;
  width: 100%;
  margin: 20px auto 80px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  animation: fadeIn 0.5s ease-in-out;
}

/* Maʼlumot grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  background: #F5F9FC;
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 5px solid #1A6291;
}

/* Tablar */
.tab-header {
  display: flex;
  gap: 12px;
  margin: 16px 0 24px;
  flex-wrap: wrap;
}

.tab-title {
  padding: 10px 20px;
  background: #eee;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  user-select: none;
}

.tab-title.active,
.tab-title:hover {
  background: #1A6291;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(26, 98, 145, 0.3);
}

/* Jadval */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 15px;
}

.data-table th,
.data-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table thead {
  background: #F5F9FC;
  font-weight: 600;
}

.input-row select,
.input-row input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

/* Belgilar */
.badge {
  padding: 5px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
  display: inline-block;
}

.badge.paid {
  background: #daf5e8;
  color: #1a7350;
}

.badge.unpaid {
  background: #fddcdc;
  color: #a93535;
}

/* Yangi xona tugmasi */
.input-row button {
  padding: 6px 14px;
  background: #1A6291;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.input-row button:hover {
  background: #165479;
}

/* Orqaga tugmasi */
.btn-back {
  display: inline-block;
  margin-top: 24px;
  background: #1A6291;
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(26, 98, 145, 0.2);
  transition: transform 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
}

/* Yuklanmoqda */
.loading-container {
  padding: 40px;
  text-align: center;
  font-size: 18px;
  color: #1A6291;
  animation: pulse 1.5s infinite;
}

/* Footer - pastda doim ko‘rinib turadi */
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1A6291;
  color: white;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

/* Animatsiyalar */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}
</style>
