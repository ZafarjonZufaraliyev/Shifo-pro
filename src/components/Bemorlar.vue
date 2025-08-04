<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
      <router-link :to="`/${role}/RegisterPage`">
        <button class="add-button">+ Qo'shish</button>
      </router-link>
    </div>

    <div class="top-controls">
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input
          type="search"
          placeholder="Ism yoki familiya bo‘yicha qidirish..."
          v-model="search"
        />
      </div>

      <div class="view-toggle">
        <button
          :class="{ active: isCardView }"
          @click="isCardView = true"
          title="Card Ko‘rinish"
        >
          📇
        </button>
        <button
          :class="{ active: !isCardView }"
          @click="isCardView = false"
          title="Jadval Ko‘rinish"
        >
          📋
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="isCardView" class="cards-wrapper">
      <!-- 3 qator x 4 ustun gridda -->
      <div class="cards-grid">
        <div
          v-for="patient in paginatedPatients[activePage]"
          :key="patient.id"
          class="patient1-card"
        >
          <router-link
            :to="`/${role}/BemorCard/${patient.id}`"
            class="card-link"
          >
            <div class="card__header">
              <h3>{{ patient.familiya }} {{ patient.ism }}</h3>
              <span>{{ calculateAge(patient.tugulgan_sana) }} yosh | {{ patient.gender }}</span>
            </div>
          </router-link>
          <div class="card__body">
            <p><strong>📞 Telefon:</strong> {{ patient.tel1 || '—' }}</p>
            <p><strong>Keldi:</strong> {{ getKelishSanasi(patient.id) }}</p>
            <p><strong>Ketdi:</strong> {{ getKetishSanasi(patient.id) }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination pastda -->
      <div class="pagination-wrapper" v-if="paginatedPatients.length > 1">
        <button
          @click="prevPage"
          :disabled="activePage === 0"
          class="page-btn nav-btn"
          aria-label="Oldingi sahifa"
        >
          &lt;
        </button>

        <button
          v-for="(page, index) in pageNumbersToShow"
          :key="index"
          :class="['page-btn', { active: activePage === page }]"
          @click="goToPage(page)"
          :aria-current="activePage === page ? 'page' : null"
        >
          {{ page + 1 }}
        </button>

        <button
          @click="nextPage"
          :disabled="activePage === paginatedPatients.length - 1"
          class="page-btn nav-btn"
          aria-label="Keyingi sahifa"
        >
          &gt;
        </button>
      </div>
    </div>

    <div v-else>
      <PatientTable :patients="filteredPatients" />
    </div>
  </div>
</template>

<script>
import PatientTable from "@/components/PatientTable.vue";
import api from "@/api";

export default {
  components: { PatientTable },
  data() {
    return {
      isCardView: true,
      search: "",
      patients: [],
      davolanish: [],
      loading: true,
      activePage: 0,
      maxVisiblePages: 7,
      role: localStorage.getItem("role") || "mini", // rolni localStorage dan olish, agar yo'q bo'lsa "mini" default
    };
  },
  computed: {
    filteredPatients() {
      const query = this.search.trim().toLowerCase();
      if (!query) return this.patients;
      return this.patients.filter((p) =>
        `${p.familiya} ${p.ism}`.toLowerCase().includes(query)
      );
    },
    paginatedPatients() {
      const perPage = 12;
      const result = [];
      for (let i = 0; i < this.filteredPatients.length; i += perPage) {
        result.push(this.filteredPatients.slice(i, i + perPage));
      }
      return result;
    },
    pageNumbersToShow() {
      const total = this.paginatedPatients.length;
      const current = this.activePage;
      const max = this.maxVisiblePages;

      let start = Math.max(0, current - Math.floor(max / 2));
      let end = start + max - 1;

      if (end >= total) {
        end = total - 1;
        start = Math.max(0, end - max + 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    },
  },
  watch: {
    paginatedPatients(newVal) {
      if (this.activePage > newVal.length - 1) this.activePage = newVal.length - 1;
      if (this.activePage < 0) this.activePage = 0;
    },
  },
  methods: {
    goToPage(page) {
      this.activePage = page;
    },
    prevPage() {
      if (this.activePage > 0) this.activePage--;
    },
    nextPage() {
      if (this.activePage < this.paginatedPatients.length - 1) this.activePage++;
    },
    calculateAge(birthdate) {
      if (!birthdate) return "—";
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    },
    getKetishSanasi(clientId) {
      const davo = this.davolanish.find((item) => item.client_id == clientId);
      return davo ? davo.ketish_sanasi : "—";
    },
    getKelishSanasi(clientId) {
      const davo = this.davolanish.find((item) => item.client_id == clientId);
      return davo ? davo.kelish_sanasi : "—";
    },
  },
  async mounted() {
    this.loading = true;
    try {
      const davoRes = await api.get("/api/v1/davolanish");
      const allDavo = davoRes.data.data || davoRes.data || [];
      const activeDavo = allDavo.filter((item) => item.status == 1);

      this.davolanish = activeDavo;

      const activeClientIds = activeDavo.map((item) => String(item.client_id));

      const clientRes = await api.get("/api/v1/clients");
      const allClients = clientRes.data.data || clientRes.data || [];

      this.patients = allClients.filter((p) =>
        activeClientIds.includes(String(p.id))
      );
    } catch (err) {
      console.error("❌ Ma'lumot olishda xatolik:", err);
    } finally {
      this.loading = false;
    }
  },
};
</script>




<style scoped>
.patients-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.add-button {
  background-color: #357abd;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.add-button:hover {
  background-color: #285a8f;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 5px 10px;
  width: 300px;
}

.search-box img {
  width: 18px;
  margin-right: 8px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
}

.view-toggle button {
  font-size: 1.3rem;
  background: none;
  border: none;
  margin-left: 10px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.view-toggle button.active {
  opacity: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #357abd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Kartalar uchun grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 20px 20px;
  margin-top: 15px;
}

.patient1-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
  padding: 15px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.patient1-card:hover {
  box-shadow: 0 3px 14px rgb(53 122 189 / 0.5);
}

.card__header h3 {
  margin: 0 0 5px 0;
  font-weight: 600;
  font-size: 1.2rem;
}

.card__header span {
  font-size: 0.9rem;
  color: #555;
}

.card__body p {
  margin: 5px 0;
  font-size: 0.95rem;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 30px;
  text-align: center;
  user-select: none;
}

.page-btn {
  margin: 0 5px;
  padding: 8px 14px;
  border: 1px solid #357abd;
  background-color: white;
  color: #357abd;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.page-btn:hover:not(:disabled) {
  background-color: #357abd;
  color: white;
}
.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-btn.active {
  background-color: #357abd;
  color: white;
  cursor: default;
}

.nav-btn {
  font-size: 1.2rem;
  font-weight: 700;
  padding: 8px 12px;
}
</style>
