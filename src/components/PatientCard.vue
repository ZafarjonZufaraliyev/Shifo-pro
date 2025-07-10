<template>
  <div class="patient-card" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <!-- Bemor ma'lumotlari -->
    <div class="info-grid">
      <div class="info-item"><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div class="info-item"><strong>Ism:</strong> {{ patient.ism }}</div>
      <div class="info-item"><strong>Yoshi:</strong> {{ patient.yosh || hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div class="info-item"><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼlum' }}</div>
      <div class="info-item"><strong>Kelgan vaqti:</strong> {{ formatDate(latestStay?.kelish_sanasi) }}</div>
      <div class="info-item"><strong>Ketadigan vaqti:</strong> {{ formatDate(latestStay?.ketish_sanasi) }}</div>
    </div>

    <!-- Tablar -->
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
          <tr v-for="(item, index) in filteredData" :key="index">
            <td>{{ index + 1 }}</td>
            <td v-if="activeTab === 'xizmatlar'">{{ item.nomi }}</td>
            <td v-if="activeTab === 'xizmatlar'">{{ formatPrice(item.arxi) }}</td>
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
        <button class="btn-action" @click="showServiceModal = true">+ Xizmat qo‘shish</button>
        <button class="btn-action" :disabled="!canReRegister" @click="showReRegister = true">🔁 Yana yotaman</button>
      </div>

      <!-- Yangi xizmat qo'shish modal -->
      <div v-if="showServiceModal" class="modal-overlay" @click.self="showServiceModal = false">
        <div class="modal">
          <h3>Yangi xizmat qo‘shish</h3>
          <input v-model="newService.nomi" placeholder="Xizmat nomi" />
          <input type="number" v-model.number="newService.narxi" placeholder="Narxi" />
          <label><input type="checkbox" v-model="newService.tolangan" /> To‘langan</label>
          <div class="modal-actions">
            <button class="btn-primary" @click="addService">Qo‘shish</button>
            <button class="btn-secondary" @click="showServiceModal = false">Bekor qilish</button>
          </div>
        </div>
      </div>

      <!-- Yana yotaman (re-register) modal -->
      <div v-if="showReRegister" class="modal-overlay" @click.self="showReRegister = false">
        <div class="modal">
          <h3>Yangi yotish maʼlumotlarini kiriting</h3>

          <label>
            Kirish sanasi:
            <input type="date" v-model="reRegisterData.kirish_sanasi" />
          </label>

          <label>
            Chiqish sanasi:
            <input type="date" v-model="reRegisterData.chiqish_sanasi" />
          </label>

          <label>
            Xona tanlash:
            <select v-model="reRegisterData.xona_id">
              <option disabled value="">Xona tanlang</option>
              <option v-for="x in availableRooms" :key="x.id" :value="x.id">{{ x.xona }}</option>
            </select>
          </label>

          <label>
            Xizmatlar (Ctrl / Cmd + klik bilan bir nechta tanlash mumkin):
            <select v-model="reRegisterData.xizmatlar" multiple>
              <option v-for="s in allServices" :key="s.id" :value="s.id">{{ s.nomi }}</option>
            </select>
          </label>

          <div class="modal-actions">
            <button class="btn-primary" @click="submitReRegister">✅ Tasdiqlash</button>
            <button class="btn-secondary" @click="showReRegister = false">❌ Bekor qilish</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Orqaga tugma -->
    <router-link :to="`/${role}/bemorlar`" class="btn-back">↩ Orqaga</router-link>
  </div>

  <div v-else class="loading-container">
    <p>⏳ Yuklanmoqda...</p>
  </div>
</template>


<script>
import api from '@/api';

export default {
  data() {
    return {
      canReRegister: false,
      showServiceModal: false,
      showReRegister: false,
      loading: true,
      error: null,
      patient: null,
      stays: [],
      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],
      allServices: [],
      availableRooms: [],
      activeTab: 'xizmatlar',
      role: localStorage.getItem('role') || 'mini',
      newService: {
        nomi: '',
        narxi: 0,
        tolangan: false,
      },
      reRegisterData: {
        kirish_sanasi: '',
        chiqish_sanasi: '',
        xona_id: '',
        xizmatlar: [],
      },
    };
  },

  computed: {
    latestStay() {
      if (!this.stays.length) return null;
      return this.stays.reduce((a, b) =>
        new Date(a.kirish_sanasi) > new Date(b.kirish_sanasi) ? a : b
      );
    },
    filteredData() {
      if (this.activeTab === 'xizmatlar') return this.xizmatlar;
      if (this.activeTab === 'kasalliklar') return this.kasalliklar;
      if (this.activeTab === 'natijalar') return this.natijalar;
      return [];
    },
    total() {
      return this.xizmatlar.reduce((sum, x) => sum + (x.narxi || 0), 0);
    },
    totalPaid() {
      return this.xizmatlar.filter(x => x.tolangan).reduce((sum, x) => sum + (x.narxi || 0), 0);
    },
    totalUnpaid() {
      return this.total - this.totalPaid;
    }
  },

  methods: {
    hisoblaYosh(tugulgan_sana) {
      if (!tugulgan_sana) return '-';
      const today = new Date();
      const birthDate = new Date(tugulgan_sana);
      let yosh = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        yosh--;
      }
      return yosh;
    },
    formatDate(d) {
      return d ? new Date(d).toLocaleDateString('uz-UZ') : '-';
    },
    formatPrice(p) {
      return p ? `${p.toLocaleString()} soʻm` : '0 soʻm';
    },
    getDaysBetween(start, end) {
      if (!start || !end) return 0;
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2 - d1;
      return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
    },
    getServiceNameById(id) {
      return this.allServices.find(s => s.id === id)?.nomi || "Nomaʼlum xizmat";
    },

    async fetchPatient() {
      this.loading = true;
      const id = this.$route.params.id;

      try {
        // Bemor asosiy ma'lumotlari
        const { data: patient } = await api.get(`/public/api/v1/clients/${id}`);
        this.patient = patient;
        this.kasalliklar = patient.kasalliklar || [];
        this.natijalar = patient.natijalar || [];

        // Davolanishlarni olish
        const { data: stays } = await api.get(`/public/api/v1/davolanish?client_id=${id}`);
        this.stays = stays;

        // Xonalar va xizmatlarni olish
        const [roomsRes, servicesRes] = await Promise.all([
          api.get('/public/api/v1/room'),
          api.get('/public/api/v1/services'),
        ]);
        this.availableRooms = roomsRes.data;
        this.allServices = servicesRes.data;

        // Eng so‘nggi davolanish
        if (this.latestStay) {
          const { id: davolanish_id, xona_id, kirish_sanasi, chiqish_sanasi } = this.latestStay;

          // Ushbu davolanishga tegishli xizmatlarni olish
          const { data: serviceData } = await api.get(`/public/api/v1/client-services?davolanish_id=${davolanish_id}`);

          this.xizmatlar = serviceData.map(x => ({
            id: x.id,
            service_id: x.service_id,
            nomi: this.getServiceNameById(x.service_id),
            narxi: x.price,
            sana: x.start_date,
            tolangan: !!x.tolangan,
          }));

          // Xona narxini olish uchun xona turi
          let xonaNarxi = 0;
          const xona = this.availableRooms.find(x => x.id === xona_id);
          if (xona && xona.room_type_id) {
            const { data: roomType } = await api.get(`/public/api/v1/room_types/${xona.room_type_id}`);
            xonaNarxi = parseFloat(roomType.Narxi) || 0;
          }

          // Kunlar soni
          const days = this.getDaysBetween(kirish_sanasi, chiqish_sanasi);

          // Xona uchun xizmatni ro‘yxat boshiga qo‘shish
          this.xizmatlar.unshift({
            id: 'xona-auto',
            nomi: `Xona: ${xona?.xona || 'nomaʼlum'}`,
            narxi: xonaNarxi * days,
            sana: kirish_sanasi,
            tolangan: false
          });

          // Can re-register shartlarini tekshirish (chiqish sanasi o‘tmagan bo‘lsa)
          const today = new Date();
          this.canReRegister = chiqish_sanasi ? (new Date(chiqish_sanasi) > today) : false;
        }
      } catch (err) {
        console.error("Xatolik:", err);
        this.error = "Maʼlumotlarni yuklashda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },

    addService() {
      if (!this.newService.nomi || this.newService.narxi <= 0) {
        alert("Iltimos, xizmat nomi va narxini kiriting!");
        return;
      }
      this.xizmatlar.push({
        id: `temp-${Date.now()}`,
        service_id: null,
        nomi: this.newService.nomi,
        narxi: this.newService.narxi,
        sana: new Date().toISOString(),
        tolangan: this.newService.tolangan,
      });
      this.showServiceModal = false;
      this.newService = { nomi: '', narxi: 0, tolangan: false };
    },

    async submitReRegister() {
      if (!this.reRegisterData.kirish_sanasi || !this.reRegisterData.chiqish_sanasi || !this.reRegisterData.xona_id) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
      }

      try {
        const clientId = this.$route.params.id;

        // Davolanish yaratish
        const { data: newDavolanish } = await api.post('/public/api/v1/davolanish', {
          client_id: clientId,
          kirish_sanasi: this.reRegisterData.kirish_sanasi,
          chiqish_sanasi: this.reRegisterData.chiqish_sanasi,
          xona_id: this.reRegisterData.xona_id,
          create_user_id: localStorage.getItem('user_id'),
          create_user_name: localStorage.getItem('user_name'),
        });

        // Yangi davolanishga xizmatlar qo'shish
        if (this.reRegisterData.xizmatlar.length) {
          for (const serviceId of this.reRegisterData.xizmatlar) {
            const service = this.allServices.find(s => s.id === serviceId);
            if (!service) continue;

            await api.post('/public/api/v1/client-services', {
              client_id: clientId,
              davolanish_id: newDavolanish.id,
              service_id: service.id,
              price: service.Narxi || service.narxi || 0,
              start_date: this.reRegisterData.kirish_sanasi,
              user_id: localStorage.getItem('user_id'),
              user_name: localStorage.getItem('user_name'),
              tolangan: false,
            });
          }
        }

        alert("Yangi yotish muvaffaqiyatli qo'shildi!");
        this.showReRegister = false;

        // Bemor ma'lumotlarini yangilash
        await this.fetchPatient();

      } catch (error) {
        console.error("Re-registerda xatolik:", error);
        alert("Yangi yotish qo'shishda xatolik yuz berdi!");
      }
    }
  },

  mounted() {
    this.fetchPatient();
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
