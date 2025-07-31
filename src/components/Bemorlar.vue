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
      <div class="cards-swiper" ref="swiperContainer">
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
              <span>{{ calculateAge(patient.birthdate) }} yosh | {{ patient.gender }}</span>
            </div>
          </router-link>
          <div class="card__body">
            <p><strong>📞 Telefon:</strong> {{ patient.tel1 || '—' }}</p>
            <p><strong>Keldi:</strong> {{ getKelishSanasi(patient.id) }}</p>
            <p><strong>Ketdi:</strong> {{ getKetishSanasi(patient.id)   }}</p>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper" v-if="paginatedPatients.length > 1">
        <button
          @click="prevPage"
          :disabled="activePage === 0"
          class="page-btn nav-btn"
        >
          ←
        </button>

        <button
          v-for="(page, index) in pageNumbersToShow"
          :key="index"
          :class="['page-btn', { active: activePage === page }]"
          @click="goToPage(page)"
        >
          {{ page + 1 }}
        </button>

        <button
          @click="nextPage"
          :disabled="activePage === paginatedPatients.length - 1"
          class="page-btn nav-btn"
        >
          →
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
  components: {
    PatientTable,
  },
  data() {
    return {
      isCardView: true,
      search: "",
      patients: [],
      davolanish: [],
      loading: true,
      activePage: 0,
      maxVisiblePages: 7,
      role: localStorage.getItem("role") || "mini",
    };
  },
  computed: {
    filteredPatients() {
      const query = this.search.trim().toLowerCase();
      if (!query) return this.patients;
      return this.patients.filter((patient) => {
        const fullName = `${patient.familiya} ${patient.ism}`.toLowerCase();
        return fullName.includes(query);
      });
    },
    paginatedPatients() {
      const perPage = 6;
      const result = [];
      for (let i = 0; i < this.filteredPatients.length; i += perPage) {
        result.push(this.filteredPatients.slice(i, i + perPage));
      }
      return result;
    },
    pageNumbersToShow() {
      const totalPages = this.paginatedPatients.length;
      const currentPage = this.activePage;
      const maxPages = this.maxVisiblePages;

      let start = Math.max(0, currentPage - Math.floor(maxPages / 2));
      let end = start + maxPages - 1;

      if (end >= totalPages) {
        end = totalPages - 1;
        start = Math.max(0, end - maxPages + 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  watch: {
    paginatedPatients(newVal) {
      if (this.activePage > newVal.length - 1) {
        this.activePage = newVal.length - 1;
      }
      if (this.activePage < 0) {
        this.activePage = 0;
      }
    },
  },
  methods: {
    goToPage(page) {
      this.activePage = page;
      this.scrollToStart();
    },
    prevPage() {
      if (this.activePage > 0) {
        this.activePage--;
        this.scrollToStart();
      }
    },
    nextPage() {
      if (this.activePage < this.paginatedPatients.length - 1) {
        this.activePage++;
        this.scrollToStart();
      }
    },
    scrollToStart() {
      const container = this.$refs.swiperContainer;
      if (container) {
        container.scrollLeft = 0;
      }
    },
    calculateAge(birthdate) {
      if (!birthdate) return "—";
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    },
    getKetishSanasi(clientId) {
      const davo = this.davolanish.find((item) => item.client_id == clientId);
      return davo ? davo.ketish_sanasi : '—';
    },
    getKelishSanasi(clientId) {
      const davo = this.davolanish.find((item) => item.client_id == clientId);
      return davo ? davo.kelish_sanasi : '—';
    }
  },
  async mounted() {
    try {
      const davolanishRes = await api.get("/api/v1/davolanish");
      this.davolanish = davolanishRes.data;
      console.log("Davolanish data:", davolanishRes.data);
    } catch (e) {
      console.error("Davolanish API xatolik:", e);
    }

    try {
      const res = await api.get("/api/v1/clients");
      this.patients = res.data.users || res.data;
    } catch (err) {
      console.error("API xatolik:", err);
    } finally {
      this.loading = false;
    }
  },
};
</script>




<style scoped>
.patients-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.add-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #2980b9;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  width: 60%;
}

.search-box input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 1rem;
}

.view-toggle button {
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  font-size: 1.2rem;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.view-toggle button.active,
.view-toggle button:hover {
  background-color: #3498db;
  color: white;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cards-wrapper {
  overflow-x: auto;
  padding-bottom: 16px;
}

.cards-swiper {
  display: flex;
  gap: 12px;
  scroll-behavior: smooth;
}

.patient1-card {
  flex: 0 0 280px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 14px 18px;
  background-color: #fff;
  box-shadow: 0 0 8px rgb(0 0 0 / 0.05);
  transition: box-shadow 0.3s ease;
}

.patient1-card:hover {
  box-shadow: 0 0 14px rgb(0 0 0 / 0.12);
}

.card-link {
  color: inherit;
  text-decoration: none;
}

.card__header h3 {
  margin: 0 0 6px;
  font-size: 1.3rem;
}

.card__header span {
  font-size: 0.9rem;
  color: #555;
}

.card__body p {
  margin: 6px 0;
  font-size: 0.95rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #3498db;
  background-color: white;
  color: #3498db;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-btn.active {
  background-color: #3498db;
  color: white;
}
</style>
