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

    <!-- Rolga qarab dinamik orqaga tugma yo'li -->
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
      loading: true,
      patient: null,
      activeTab: 'xizmatlar',

      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],

      showServiceModal: false,
      showReRegister: false,

      newService: { nomi: '', narxi: null, tolangan: false, sana: new Date().toISOString().split('T')[0] },

      reRegisterData: {
        kirish_sanasi: '',
        chiqish_sanasi: '',
        xona_id: '',
        xizmatlar: []
      },

      availableRooms: [],
      allServices: [],

      role: localStorage.getItem('role') || 'mini', // ROLE ni localStorage dan olamiz, default 'mini'
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
      let yosh = hozir.getFullYear() - tugilganSana.getFullYear();
      // agar tug'ilgan kun hali kelmagan bo'lsa yoshni 1 ga kamaytiramiz
      const monthDiff = hozir.getMonth() - tugilganSana.getMonth();
      const dayDiff = hozir.getDate() - tugilganSana.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) yosh--;
      return yosh;
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

        // Yangi ma'lumotlarni yangilash
        await this.fetchPatient();

        // Formani tozalash
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

<style>
  .patient-card {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  transition: box-shadow 0.3s ease;
}

.patient-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .patient-card {
    margin: 20px 15px;
    padding: 15px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px 20px;
  margin-bottom: 25px;
}

.info-item {
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  font-weight: 600;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.05);
  user-select: none;
  color: #2c3e50;
}

.tab-section {
  margin-top: 20px;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 15px;
  user-select: none;
}

.tab-title {
  padding: 10px 25px;
  cursor: pointer;
  font-weight: 600;
  color: #777;
  border-bottom: 3px solid transparent;
  transition: color 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}

.tab-title:hover {
  color: #2a9d8f;
}

.tab-title.active {
  color: #2a9d8f;
  border-color: #2a9d8f;
  font-weight: 700;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 14px;
  color: #444;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 10px 15px;
  text-align: left;
  vertical-align: middle;
  transition: background-color 0.2s ease;
}

.data-table thead {
  background-color: #f0f4f8;
  font-weight: 700;
  color: #2a9d8f;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.data-table tbody tr:hover {
  background-color: #eaf6f5;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
  text-align: center;
  min-width: 70px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.badge.paid {
  background-color: #2a9d8f;
  color: #fff;
}

.badge.unpaid {
  background-color: #e76f51;
  color: #fff;
}

.financial-summary p {
  font-weight: 600;
  margin: 6px 0;
  font-size: 15px;
  color: #34495e;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-action {
  background-color: #2a9d8f;
  color: white;
  padding: 12px 26px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  box-shadow: 0 2px 6px rgba(42,157,143,0.5);
}

.btn-action:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-action:not(:disabled):hover {
  background-color: #21867a;
  box-shadow: 0 4px 12px rgba(33,134,122,0.6);
}

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
  padding: 15px;
  overflow-y: auto;
}

.modal {
  background: #fff;
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
  padding: 30px 35px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  animation: fadeInScale 0.25s ease forwards;
  font-family: inherit;
  color: #2c3e50;
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

.modal h3 {
  margin-bottom: 25px;
  color: #264653;
  font-weight: 700;
  font-size: 1.5rem;
  text-align: center;
  user-select: none;
}

.modal label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #444;
  font-size: 15px;
}

.modal input[type="text"],
.modal input[type="number"],
.modal input[type="date"],
.modal select {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1.8px solid #ccc;
  font-size: 15px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.modal input[type="text"]:focus,
.modal input[type="number"]:focus,
.modal input[type="date"]:focus,
.modal select:focus {
  outline: none;
  border-color: #2a9d8f;
  box-shadow: 0 0 8px rgba(42,157,143,0.4);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn-primary {
  flex: 1;
  background-color: #2a9d8f;
  color: #fff;
  padding: 12px 20px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.btn-primary:hover {
  background-color: #21867a;
}

.btn-secondary {
  flex: 1;
  background-color: #e76f51;
  color: #fff;
  padding: 12px 20px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.btn-secondary:hover {
  background-color: #ce5739;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #555;
  font-weight: 600;
}

/* Responsive for smaller devices */
@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .tab-header {
    flex-wrap: wrap;
  }
  .tab-title {
    padding: 8px 15px;
    font-size: 14px;
  }
  .btn-action {
    flex: 1 1 100%;
    text-align: center;
  }
  .modal {
    padding: 20px 20px;
  }
  .modal-actions {
    flex-direction: column;
  }
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}

</style>