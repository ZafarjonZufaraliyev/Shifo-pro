<template>
  <div class="patient-card" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <!-- Bemor ma'lumotlari -->
    <div class="info-grid">
      <div class="info-item"><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div class="info-item"><strong>Ism:</strong> {{ patient.ism }}</div>
      <div class="info-item"><strong>Yoshi:</strong> {{ patient.yosh || hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div class="info-item"><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼmalum' }}</div>
      <div class="info-item"><strong>Kelgan vaqti:</strong> {{ formatDate(patient.kelgan_vaqti) }}</div>
      <div class="info-item"><strong>Ketadigan vaqti:</strong> {{ formatDate(patient.ketgan_vaqti) }}</div>
    </div>

    <!-- Tablar -->
    <div class="tab-section">
      <div class="tab-header">
        <div :class="['tab-title', activeTab === 'xizmatlar' && 'active']" @click="activeTab = 'xizmatlar'">Xizmatlar</div>
        <div :class="['tab-title', activeTab === 'kasalliklar' && 'active']" @click="activeTab = 'kasalliklar'">Kasalliklar tarixi</div>
        <div :class="['tab-title', activeTab === 'natijalar' && 'active']" @click="activeTab = 'natijalar'">Natijalar</div>
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
            <td v-if="activeTab === 'xizmatlar'">{{ formatPrice(item.narxi) }}</td>
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
      <div v-if="showServiceModal" class="modal-overlay">
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
      <div v-if="showReRegister" class="modal-overlay">
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
              <option v-for="x in availableRooms" :key="x.id" :value="x.id">
                {{ x.nom }}
              </option>
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

    <router-link to="/super/bemorlar" class="btn-back">↩ Orqaga</router-link>
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
      loading: true,
      patient: null,
      activeTab: 'xizmatlar',

      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],

      showServiceModal: false,
      showReRegister: false,

      newService: { nomi: '', narxi: null, tolangan: false, sana: new Date().toISOString().split('T')[0] },

      // Re-register uchun ma'lumotlar
      reRegisterData: {
        kirish_sanasi: '',
        chiqish_sanasi: '',
        xona_id: '',
        xizmatlar: []
      },

      // Xonalar va xizmatlar ro'yxati
      availableRooms: [],
      allServices: []
    };
  },
  computed: {
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
    },
    canReRegister() {
      if (!this.patient?.ketgan_vaqti) return false;
      return new Date(this.patient.ketgan_vaqti) < new Date();
    }
  },
  methods: {
    async fetchPatient() {
      try {
        const id = this.$route.params.id;
        const res = await api.get(`/public/api/v1/clients/${id}`);
        this.patient = res.data;

        this.xizmatlar = res.data.xizmatlar || [];
        this.kasalliklar = res.data.kasalliklar || [];
        this.natijalar = res.data.natijalar || [];

        this.availableRooms = await this.fetchRooms();
        this.allServices = await this.fetchAllServices();

      } catch (err) {
        console.error("API xatosi:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchRooms() {
      try {
        const res = await api.get('/public/api/v1/rooms');
        return res.data || [];
      } catch (err) {
        console.error("Xonalar ro'yxatini olishda xato:", err);
        return [];
      }
    },

    async fetchAllServices() {
      try {
        const res = await api.get('/public/api/v1/services');
        return res.data || [];
      } catch (err) {
        console.error("Xizmatlar ro'yxatini olishda xato:", err);
        return [];
      }
    },

    hisoblaYosh(tugulgan) {
      if (!tugulgan) return '';
      const tugilganSana = new Date(tugulgan);
      const hozir = new Date();
      return hozir.getFullYear() - tugilganSana.getFullYear();
    },

    formatDate(dateStr) {
      if (!dateStr) return 'Nomaʼmalum';
      return new Date(dateStr).toLocaleDateString();
    },

    formatPrice(val) {
      return val ? `${val.toLocaleString()} so'm` : '-';
    },

    addService() {
      if (!this.newService.nomi || this.newService.narxi === null) {
        alert('Iltimos, xizmat nomi va narxini kiriting.');
        return;
      }
      this.xizmatlar.push({ ...this.newService });
      this.showServiceModal = false;
      this.newService = { nomi: '', narxi: null, tolangan: false, sana: new Date().toISOString().split('T')[0] };
    },

    async submitReRegister() {
      // Validation
      if (!this.reRegisterData.kirish_sanasi || !this.reRegisterData.chiqish_sanasi || !this.reRegisterData.xona_id) {
        alert('Iltimos, barcha maydonlarni toʻldiring.');
        return;
      }

      if (new Date(this.reRegisterData.kirish_sanasi) >= new Date(this.reRegisterData.chiqish_sanasi)) {
        alert('Chiqish sanasi kirish sanasidan keyin bo‘lishi kerak.');
        return;
      }

      try {
        const payload = {
          kirish_sanasi: this.reRegisterData.kirish_sanasi,
          chiqish_sanasi: this.reRegisterData.chiqish_sanasi,
          xona_id: this.reRegisterData.xona_id,
          xizmatlar: this.reRegisterData.xizmatlar // id lar array
        };

        await api.post(`/public/api/v1/clients/${this.patient.id}/stays`, payload);

        alert('Qayta yotish muvaffaqiyatli saqlandi!');
        this.showReRegister = false;

        // Yangi ma'lumotlarni yangilash uchun fetch qilish mumkin
        await this.fetchPatient();

        // Re-register formani tozalash
        this.reRegisterData = { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] };

      } catch (err) {
        console.error('Qayta yotish xatosi:', err);
        alert('Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.');
      }
    }
  },
  mounted() {
    this.fetchPatient();
  }
};
</script>

<style scoped>
/* Umumiy konteynerlar */
.patient-card {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding:  20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
@media (max-width: 768px) {
 .patient-card {
  max-width: 1200px;
  margin: 20px;
  }}

/* Ma'lumotlar grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
  gap: 12px 20px;
  margin-bottom: 25px;
}

.info-item {
  background: #f9f9f9;
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 600;
}

/* Tablar */
.tab-section {
  margin-top: 10px;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 15px;
}

.tab-title {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  color: #777;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-title.active {
  color: #2a9d8f;
  border-color: #2a9d8f;
  font-weight: 700;
}

/* Jadval */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
}

.data-table thead {
  background-color: #f0f4f8;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

/* Badge */
.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
}

.badge.paid {
  background-color: #2a9d8f;
  color: #fff;
}

.badge.unpaid {
  background-color: #e76f51;
  color: #fff;
}

/* Financial summary */
.financial-summary p {
  font-weight: 600;
  margin: 5px 0;
  font-size: 15px;
}

/* Buttons */
.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 15px;
}

.btn-action {
  background-color: #2a9d8f;
  color: white;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-action:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.btn-action:hover:not(:disabled) {
  background-color: #21867a;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.48);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 10px;
  overflow-y: auto;
}

/* Modal box */
.modal {
  background: white;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  padding: 25px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  animation: fadeInScale 0.25s ease forwards;
  font-family: inherit;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal header */
.modal h3 {
  margin-bottom: 20px;
  color: #264653;
  font-weight: 700;
  font-size: 1.3rem;
  text-align: center;
}

/* Modal form inputs */
.modal label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
  font-size: 14px;
}

.modal input[type="text"],
.modal input[type="number"],
.modal input[type="date"],
.modal select {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 18px;
  border-radius: 6px;
  border: 1.5px solid #ccc;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.modal input[type="text"]:focus,
.modal input[type="number"]:focus,
.modal input[type="date"]:focus,
.modal select:focus {
  outline: none;
  border-color: #2a9d8f;
  box-shadow: 0 0 6px #2a9d8faa;
}

/* Checkbox label */
.modal label > input[type="checkbox"] {
  margin-right: 6px;
  transform: scale(1.1);
  vertical-align: middle;
}

/* Modal buttons */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.btn-primary {
  background-color: #2a9d8f;
  color: white;
  padding: 10px 22px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #21867a;
}

.btn-secondary {
  background-color: #e76f51;
  color: white;
  padding: 10px 22px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #c85a3f;
}

/* Orqaga tugma */
.btn-back {
  display: inline-block;
  margin-top: 25px;
  color: #2a9d8f;
  font-weight: 600;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s ease;
}

.btn-back:hover {
  color: #1e6a62;
}

/* Yuklanmoqda */
.loading-container {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 30px 0;
  font-weight: 600;
}

</style>
