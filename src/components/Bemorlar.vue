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
            <p><strong>Keldi:</strong> {{ patient.arrivalDate || '—' }}</p>
            <p><strong>Ketdi:</strong> {{ patient.departureDate || '—' }}</p>
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
  components: { PatientTable },
  data() {
    return {
      isCardView: true,
      search: "",
      patients: [],
      loading: true,
      activePage: 0,
      maxVisiblePages: 7,
      role: localStorage.getItem("role") || "mini",
    };
  },
  computed: {
    filteredPatients() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.patients;
      return this.patients.filter((p) => {
        const fullName = `${p.familiya} ${p.ism}`.toLowerCase();
        return fullName.includes(q);
      });
    },
    paginatedPatients() {
      const perPage = 6;
      const chunks = [];
      for (let i = 0; i < this.filteredPatients.length; i += perPage) {
        chunks.push(this.filteredPatients.slice(i + 0, i + perPage));
      }
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
    }
  },
  watch: {
    paginatedPatients(newVal) {
      if (this.activePage > newVal.length - 1) {
        this.activePage = newVal.length - 1;
      }
      if (this.activePage < 0) {
        this.activePage = 0;
      }
    }
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
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }
  },
  async mounted() {
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
  padding: 20px;
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  background: #fefefe;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  border-radius: 12px;
  box-sizing: border-box;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #264653;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-button {
  background: linear-gradient(135deg, #2a9d8f 0%, #38b2ac 100%);
  color: white;
  padding: 12px 22px;
  font-size: 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(42, 157, 143, 0.3);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.add-button:hover {
  background: linear-gradient(135deg, #21867a 0%, #2c9a91 100%);
  box-shadow: 0 8px 20px rgba(33, 134, 122, 0.5);
}

/* Top controls */
.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f7fafc;
  padding: 10px 18px;
  border-radius: 12px;
  width: 320px;
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.05);
  transition: box-shadow 0.3s ease;
}

.search-box:hover,
.search-box:focus-within {
  box-shadow: 0 0 10px rgba(42, 157, 143, 0.5);
}

.search-box img {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  pointer-events: none;
}

.search-box input {
  border: none;
  background: transparent;
  margin-left: 12px;
  outline: none;
  width: 100%;
  font-size: 16px;
  color: #264653;
  font-weight: 600;
}

.view-toggle button {
  background: #e0e0e0;
  border: none;
  padding: 10px 16px;
  margin-left: 8px;
  border-radius: 12px;
  font-size: 22px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

.view-toggle button.active {
  background: #2a9d8f;
  color: white;
  box-shadow: 0 6px 14px rgba(42, 157, 143, 0.8);
}

.view-toggle button:hover:not(.active) {
  background: #c0c0c0;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.spinner {
  border: 6px solid #e6e6e6;
  border-top: 6px solid #2a9d8f;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Swiper cards container */
.cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Grid kartalar: 3 ustun, 3 qator (maks 9 ta ko‘rsatish) */
.cards-swiper {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 ustun */
  grid-template-rows: repeat(3, auto);  /* 3 qator */
  gap: 18px;
  overflow-x: hidden;
  padding-bottom: 10px;

  /* Scrollbar dizayni */
  scrollbar-width: thin;
  scrollbar-color: #2a9d8f #ddd;
}

/* Scrollbar Chrome, Edge, Safari uchun */
.cards-swiper::-webkit-scrollbar {
  height: 8px;
}

.cards-swiper::-webkit-scrollbar-track {
  background: #ddd;
  border-radius: 8px;
}

.cards-swiper::-webkit-scrollbar-thumb {
  background-color: #2a9d8f;
  border-radius: 8px;
}

/* Har bir karta */
.patient1-card {
  width: 100%; 
  max-width:350px;/* Grid ustun kengligini to‘liq egallaydi */
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(42, 157, 143, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.patient-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(42, 157, 143, 0.3);
}

.card-link {
  color: inherit;
  text-decoration: none;
}

.card__header h3 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #264653;
  font-weight: 700;
}

.card__header span {
  font-size: 15px;
  font-weight: 600;
  color: #556b7b;
}

.card__body {
  margin-top: 16px;
  font-size: 15px;
  color: #444;
  line-height: 1.4;
}

.card__body p {
  margin: 8px 0;
  font-weight: 600;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  user-select: none;
  flex-wrap: wrap;
  margin-top: 12px;
}

.page-btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px solid #2a9d8f;
  background: white;
  color: #2a9d8f;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  min-width: 44px;
  text-align: center;
}

.page-btn.active,
.page-btn:hover:not(:disabled) {
  background-color: #2a9d8f;
  color: white;
  box-shadow: 0 6px 16px rgba(42, 157, 143, 0.7);
}

.page-btn:disabled {
  border-color: #a5d6a7;
  color: #a5d6a7;
  cursor: not-allowed;
  box-shadow: none;
}

.nav-btn {
  font-weight: 900;
  font-size: 22px;
  padding: 8px 14px;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .patients-container {
    margin-left: 0;
    padding: 16px 12px;
  }

  .cards-swiper {
    grid-template-columns: repeat(2, 1fr); /* 2 ustunga o‘zgaradi */
    grid-template-rows: auto;
    gap: 12px;
  }

  .patient-card {
    padding: 16px;
  }

  .page-btn {
    padding: 8px 12px;
    font-size: 14px;
    min-width: 36px;
  }
}

@media (max-width: 480px) {
  .cards-swiper {
    grid-template-columns: 1fr; /* 1 ustunga o‘zgaradi */
  }
}

</style>

