<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
      <router-link to="/RoyxatgaOlish">
        <button class="add-button">+ Qo'shish</button>
      </router-link>
    </div>

    <div class="top-controls">
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input type="search" placeholder="Ism yoki familiya bo‘yicha qidirish..." v-model="search" />
      </div>

      <div class="view-toggle">
        <button :class="{ active: isCardView }" @click="isCardView = true" title="Card Ko‘rinish">
          📇
        </button>
        <button :class="{ active: !isCardView }" @click="isCardView = false" title="Jadval Ko‘rinish">
          📋
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="isCardView" class="cards">
      <div class="card-page">
        <div v-for="patient in paginatedPatients[activePage]" :key="patient.id" class="patient-card">
          <router-link :to="`/BemorCard/${patient.id}`">
            <div class="card__header">
              <h3>{{ patient.familiya }} {{ patient.ism }}</h3>
              <span>{{ patient.age }} yosh | {{ patient.gender }}</span>
            </div>
          </router-link>
          <div class="card__body">
            <p><strong>📞 Telefon:</strong> {{ patient.tel1 || '—' }}</p>
            <p><strong>Keldi:</strong> {{ patient.weight || '—' }}</p>
            <p><strong>Ketdi:</strong> {{ patient.weight || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Sahifa raqamlari -->
      <div class="pagination" v-if="paginatedPatients.length > 1">
        <button :disabled="activePage === 0" @click="activePage--" class="page-btn">
          &lt;
        </button>

        <button v-for="(page, index) in pageNumbersToShow" :key="index"
          :class="['page-btn', { active: activePage === page }]" @click="activePage = page">
          {{ page + 1 }}
        </button>

        <button :disabled="activePage === paginatedPatients.length - 1" @click="activePage++" class="page-btn">
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
import api from "@/api"
export default {
  components: {
    PatientTable,
  },
  data() {
    return {
      isCardView: true,
      search: "",
      patients: [],
      loading: true,
      activePage: 0,
      maxVisiblePages: 7, // maksimal ko'rsatiladigan sahifa raqamlari soni
    };
  },
  computed: {
    filteredPatients() {
      return this.patients.filter((p) => {
        const fullName = `${p.familiya} ${p.ism}`.toLowerCase(); // TO‘G‘RI: familiya va ism
        return fullName.includes(this.search.trim().toLowerCase());
      });
    },
    paginatedPatients() {
      const chunks = [];
      const perPage = 10;
      for (let i = 0; i < this.filteredPatients.length; i += perPage) {
        chunks.push(this.filteredPatients.slice(i, i + perPage));
      }
      // activePage chegaradan chiqmasin:
      if (this.activePage > chunks.length - 1) this.activePage = chunks.length - 1;
      if (this.activePage < 0) this.activePage = 0;
      return chunks;
    },
    pageNumbersToShow() {
      const total = this.paginatedPatients.length;
      const current = this.activePage;
      const maxPages = this.maxVisiblePages;

      let start = Math.max(0, current - Math.floor(maxPages / 2));
      let end = start + maxPages - 1;

      if (end >= total) {
        end = total - 1;
        start = Math.max(0, end - maxPages + 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },

  async mounted() {
    try {
      const res = await api.get("/public/api/v1/clients"); // faqat endpoint, baseURL api.js da berilgan
      this.patients = res.data.users || res.data; // backendga qarab o'zgartiring
    } catch (err) {
      console.error("API xatolik:", err);
    } finally {
      this.loading = false;
    }
  }

};
</script>

<style scoped>
.patients-container {
  padding: 20px;
  max-width: 1200px;
  margin-left: 270px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.add-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 16px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #43a047;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f1f1;
  padding: 8px 12px;
  border-radius: 8px;
  width: 300px;
}

.search-box input {
  border: none;
  background: transparent;
  margin-left: 8px;
  outline: none;
  width: 100%;
}

.view-toggle button {
  background: #e0e0e0;
  border: none;
  padding: 8px 12px;
  margin-left: 8px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.view-toggle button.active {
  background: #4caf50;
  color: white;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
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

.card-page {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.patient-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.patient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card__header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  text-decoration: none;
}

.card__header span {
  font-size: 14px;
  color: #757575;
}

.card__body {
  margin-top: 10px;
  font-size: 14px;
  color: #424242;
}

.card__body p {
  margin: 4px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  user-select: none;
}

.page-btn {
  padding: 8px 14px;
  border: 1.5px solid #4caf50;
  background-color: white;
  color: #4caf50;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #4caf50;
  color: white;
}

.page-btn:disabled {
  border-color: #a5d6a7;
  color: #a5d6a7;
  cursor: not-allowed;
}

.page-btn.active {
  background-color: #4caf50;
  color: white;
  cursor: default;
}

@media (max-width: 768px) {
  .patients-container {
    margin-left: 0;
    padding: 20px;
  }
}
</style>
