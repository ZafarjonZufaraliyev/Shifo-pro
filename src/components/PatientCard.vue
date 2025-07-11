<template>
  <div class="patient-card" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <div class="info-grid">
      <div class="info-item"><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div class="info-item"><strong>Ism:</strong> {{ patient.ism }}</div>
      <div class="info-item"><strong>Yoshi:</strong> {{ hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div class="info-item"><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼlum' }}</div>
      <div class="info-item"><strong>Kelgan vaqti:</strong> {{ formatDate(latestStay?.kelish_sanasi) }}</div>
      <div class="info-item"><strong>Ketadigan vaqti:</strong> {{ formatDate(latestStay?.ketish_sanasi) }}</div>
    </div>

    <div class="tab-section">
      <div class="tab-header">
        <div :class="['tab-title', activeTab === 'xizmatlar' ? 'active' : '']" @click="activeTab = 'xizmatlar'">Xizmatlar</div>
        <div :class="['tab-title', activeTab === 'kasalliklar' ? 'active' : '']" @click="activeTab = 'kasalliklar'">Kasalliklar tarixi</div>
        <div :class="['tab-title', activeTab === 'natijalar' ? 'active' : '']" @click="activeTab = 'natijalar'">Natijalar</div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th v-if="activeTab === 'xizmatlar'">Xizmat nomi</th>
            <th v-if="activeTab === 'xizmatlar'">Narxi</th>
            <th v-if="activeTab === 'xizmatlar'">Holati</th>
            <th v-if="activeTab === 'kasalliklar'">Kasallik nomi</th>
            <th v-if="activeTab === 'natijalar'">Natija</th>
            <th>Sana</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in filteredData" :key="i">
            <td>{{ i + 1 }}</td>
            <td v-if="activeTab === 'xizmatlar'">{{ item.xona }}</td>
            <td v-if="activeTab === 'xizmatlar'">{{ formatPrice(item.price) }}</td>
            <td v-if="activeTab === 'xizmatlar'">
              <span :class="['badge', item.tolangan ? 'paid' : 'unpaid']">
                {{ item.tolangan ? 'To‘langan' : 'To‘lanmagan' }}
              </span>
            </td>
            <td v-if="activeTab === 'kasalliklar'">{{ item.nomi }}</td>
            <td v-if="activeTab === 'natijalar'">{{ item.natija }}</td>
            <td>{{ formatDate(item.sana) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="activeTab === 'xizmatlar'" class="financial-summary">
        <p>💰 Jami: {{ formatPrice(total) }}</p>
        <p>✅ To‘langan: {{ formatPrice(totalPaid) }}</p>
        <p>❌ Qarz: {{ formatPrice(totalUnpaid) }}</p>
      </div>

      <div v-if="activeTab === 'xizmatlar'" class="action-buttons">
        <button @click="showServiceModal = true">+ Xizmat qo‘shish</button>
        <button :disabled="!canReRegister" @click="showReRegister = true">🔁 Yana yotaman</button>
      </div>

      <!-- Service Modal -->
      <div v-if="showServiceModal" class="modal-overlay" @click.self="showServiceModal = false">
        <div class="modal">
          <h3>Yangi xizmat qo‘shish</h3>
          <input v-model="newService.nomi" placeholder="Xizmat nomi" />
          <input type="number" v-model.number="newService.narxi" placeholder="Narxi" />
          <label><input type="checkbox" v-model="newService.tolangan" /> To‘langan</label>
          <div class="modal-actions">
            <button @click="addTempService">Qo‘shish</button>
            <button @click="showServiceModal = false">Bekor</button>
          </div>
        </div>
      </div>

      <!-- Re-register Modal -->
      <div v-if="showReRegister" class="modal-overlay" @click.self="showReRegister = false">
        <div class="modal">
          <h3>Yangi yotish</h3>
          <label>Kirish sanasi: <input type="date" v-model="rr.kirish_sanasi" /></label>
          <label>Chiqish sanasi: <input type="date" v-model="rr.chiqish_sanasi" /></label>
          <label>Xona: 
            <select v-model="rr.xona_id">
              <option disabled value="">Tanlang</option>
              <option v-for="r in availableRooms" :key="r.id" :value="r.id">{{ r.xona }}</option>
            </select>
          </label>
          <label>Xizmatlar:
            <select multiple v-model="rr.xizmatlar">
              <option v-for="s in allServices" :key="s.id" :value="s.id">{{ s.nomi }}</option>
            </select>
          </label>
          <div class="modal-actions">
            <button @click="submitReRegister">✅ Tasdiqlash</button>
            <button @click="showReRegister = false">❌ Bekor</button>
          </div>
        </div>
      </div>
    </div>

    <router-link :to="`/${role}/bemorlar`" class="btn-back">↩ Orqaga</router-link>
  </div>
  <div v-else class="loading-container"><p>⏳ Yuklanmoqda...</p></div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      loading: false,
      patient: null,
      stays: [],
      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],
      availableRooms: [],
      allServices: [],
      activeTab: 'xizmatlar',
      canReRegister: false,
      showServiceModal: false,
      showReRegister: false,
      newService: { nomi: '', narxi: 0, tolangan: false },
      rr: { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] },
      role: localStorage.getItem('role') || 'mini',
    };
  },
  computed: {
    latestStay() { return this.stays[0] || null; },
    filteredData() {
      if (this.activeTab === 'xizmatlar') return this.xizmatlar;
      return this.activeTab === 'kasalliklar' ? this.kasalliklar : this.natijalar;
    },
    total() { return this.sumField('price'); },
    totalPaid() { return this.xizmatlar.filter(x => x.tolangan).reduce((sum, x) => sum + x.narxi, 0); },
    totalUnpaid() { return this.total - this.totalPaid; }
  },
  methods: {
    sumField(f) { return this.xizmatlar.reduce((s, x) => s + (x[f] || 0), 0); },
    formatDate(d) { return d ? new Date(d).toLocaleDateString('uz-UZ') : '-'; },
    formatPrice(p) { return p ? `${p.toLocaleString()} soʻm` : '0 soʻm'; },
    hisoblaYosh(d) {
      if (!d) return '-'; const b = new Date(d), t = new Date();
      let y = t.getFullYear() - b.getFullYear();
      if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) y--;
      return y;
    },
    async fetchAll() {
      this.loading = true;
      const id = this.$route.params.id;
      try {
        const [p, st, rooms, services] = await Promise.all([
          api.get('/api/v1/clients/' + id),
          api.get('/api/v1/davolanish?client_id=' + id),
          api.get('/api/v1/room'),
          api.get('/api/v1/services')
        ]);
        this.patient = p.data;
        this.stays = st.data;
        this.kasalliklar = this.patient.kasalliklar;
        this.natijalar = this.patient.natijalar;
        this.availableRooms = rooms.data;
        this.allServices = services.data;

        if (this.latestStay) {
          const cs = await api.get('/api/v1/client-services?davolanish_id=' + this.latestStay.id);
          this.xizmatlar = cs.data.map(item => ({
            ...item,
            nomi: this.allServices.find(s => s.id === item.service_id)?.nomi || item.nomi,
          }));
          this.updateRoomCharge();
        }
        this.canReRegister = this.latestStay && new Date(this.latestStay.ketish_sanasi) > new Date();
      } catch (e) {
        console.error(e);
        alert('Maʼlumot olishda xatolik');
      } finally {
        this.loading = false;
      }
    },
    updateRoomCharge() {
      const x = this.latestStay;
      if (!x) return;
      const room = this.availableRooms.find(r => r.id === x.xona_id);
      const price = (room?.room_type_id ? room.room_type_price : 0) || 0;
      const days = Math.max(Math.ceil((new Date(x.ketish_sanasi) - new Date(x.kelish_sanasi)) / (864e5)), 0);
      this.xizmatlar.unshift({
        id: 'xona-auto',
        nomi: `Xona: ${room?.xona}`,
        narxi: price * days,
        sana: x.kirish_sanasi,
        tolangan: false
      });
    },
    addTempService() {
      const s = this.newService;
      if (!s.nomi || s.narxi <= 0) return alert('Iltimos, nomi va narx kiriting');
      this.xizmatlar.push({ ...s, id: Date.now(), sana: new Date().toISOString() });
      this.newService = { nomi: '', narxi: 0, tolangan: false };
      this.showServiceModal = false;
    },
    async submitReRegister() {
      const r = this.rr;
      if (!r.kirish_sanasi || !r.chiqish_sanasi || !r.xona_id) return alert('Barcha maydon to‘ldirilsin');
      try {
        const nd = await api.post('/api/v1/davolanish', {
          client_id: this.patient.id,
          kirish_sanasi: r.kirish_sanasi,
          chiqish_sanasi: r.chiqish_sanasi,
          xona_id: r.xona_id
        });
        for (const sid of r.xizmatlar) {
          await api.post('/api/v1/client-services', {
            client_id: this.patient.id,
            davolanish_id: nd.data.id,
            service_id: sid,
            start_date: r.kirish_sanasi,
            price: this.allServices.find(s => s.id === sid)?.narxi || 0
          });
        }
        alert('Yangi yotish qo‘shildi');
        this.showReRegister = false;
        this.fetchAll();
      } catch (e) {
        console.error(e);
        alert('Xatolik yuz berdi');
      }
    }
  },
  mounted() {
    this.fetchAll();
  }
};
</script>


<style scoped>
.patient-card {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
  gap: 10px;
  margin-bottom: 15px;
}
.info-item {
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px #ccc;
}
.tab-section {
  margin-top: 20px;
}
.tab-header {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}
.tab-title {
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 5px;
  background: #ddd;
  user-select: none;
}
.tab-title.active {
  background: #337ab7;
  color: white;
  font-weight: bold;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}
.data-table th, .data-table td {
  border: 1px solid #ccc;
  padding: 8px 10px;
  text-align: left;
}
.badge {
  padding: 3px 7px;
  border-radius: 12px;
  color: white;
  font-size: 0.9em;
}
.paid {
  background-color: #28a745;
}
.unpaid {
  background-color: #dc3545;
}
.financial-summary p {
  margin: 3px 0;
}
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.btn-action {
  padding: 8px 15px;
  background-color: #337ab7;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  user-select: none;
}
.btn-action:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
}
.modal input,
.modal select {
  width: 100%;
  padding: 8px 10px;
  margin: 8px 0 15px 0;
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-primary {
  background-color: #28a745;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #dc3545;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-back {
  display: inline-block;
  margin-top: 20px;
  text-decoration: none;
  color: #337ab7;
  font-weight: 600;
}
.loading-container {
  text-align: center;
  font-size: 1.2em;
  padding: 30px;
}
</style>
