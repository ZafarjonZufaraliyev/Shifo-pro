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
          aria-label="Bemorlarni qidirish"
        />
      </div>

      <div class="view-toggle" role="group" aria-label="Ko‘rinish turini tanlash">
        <button
          :class="{ active: isCardView }"
          @click="isCardView = true"
          title="Card Ko‘rinish"
          aria-pressed="isCardView"
        >
          📇
        </button>
        <button
          :class="{ active: !isCardView }"
          @click="isCardView = false"
          title="Jadval Ko‘rinish"
          aria-pressed="!isCardView"
        >
          📋
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container" role="status" aria-live="polite">
      <div class="spinner"></div>
    </div>

    <!-- Card ko'rinish -->
    <div v-else-if="isCardView" class="cards-wrapper">
      <div class="cards-grid" role="list">
        <div
          v-for="patient in patients"
          :key="patient.id"
          class="patient1-card"
          role="listitem"
        >
          <router-link
            :to="`/${role}/BemorCard/${patient.client.id}`"
            class="card-link"
          >
            <div class="card__header">
              <h3>{{ patient.client.ism }} {{ patient.client.familiya }}</h3>
              <span>
                {{ calculateAge(patient.client.tugulgan_sana) }} yosh | {{ patient.client.jinsi }}
              </span>
            </div>
          </router-link>
          <div class="card__body">
            <p><strong>📞 Telefon:</strong> {{ patient.client.tel1 || '—' }}</p>
            <p><strong>Keldi:</strong> {{ patient.kelish_sanasi || '—' }}</p>
            <p><strong>Ketdi:</strong> {{ patient.ketish_sanasi || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav
        v-if="lastPage > 1"
        class="pagination-wrapper"
        role="navigation"
        aria-label="Bemorlar sahifalari"
      >
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="page-btn nav-btn"
          aria-label="Oldingi sahifa"
        >
          &lt;
        </button>

        <button
          v-for="page in pagesToShow"
          :key="page"
          :class="['page-btn', { active: currentPage === page }]"
          @click="changePage(page)"
          :aria-current="currentPage === page ? 'page' : null"
        >
          {{ page }}
        </button>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= lastPage"
          class="page-btn nav-btn"
          aria-label="Keyingi sahifa"
        >
          &gt;
        </button>
      </nav>
    </div>

    <!-- Jadval ko'rinish -->
    <div v-else>
      <PatientTable :patients="patients" />
    </div>
  </div>
</template>

<script>
import PatientTable from "@/components/PatientTable.vue";
import api from "@/api";
import dayjs from "dayjs";
import debounce from "lodash.debounce";

export default {
  components: {
    PatientTable,
  },
  data() {
    return {
      isCardView: true,
      search: "",
      patients: [],
      loading: false,
      currentPage: 1,
      lastPage: 1,
      perPage: 12,
      role: localStorage.getItem("role") || "mini",
    };
  },
  watch: {
    search: {
      handler: debounce(function () {
        this.currentPage = 1;
        this.fetchPatients();
      }, 500),
      immediate: true,
    },
  },
  methods: {
    async fetchPatients() {
      this.loading = true;
      try {
        // 1. Davolanish (active) ro'yxatini olish
        const davolanishRes = await api.get("/api/v1/davolanish", {
          params: {
            search: this.search,
            page: this.currentPage,
            per_page: this.perPage,
          },
        });
        const davolanishData = davolanishRes.data.data || [];

        // 2. Faqat status=1 va ketish sanasi kelajak yoki bo'sh bo'lganlarni filtrlaymiz
        const today = dayjs().format("YYYY-MM-DD");
        const activeDavolanish = davolanishData.filter(
          (item) => item.status === "1" && (!item.ketish_sanasi || item.ketish_sanasi >= today)
        );

        // 3. Faqat ushbu davolanishdagi bemorlarni saqlaymiz
        this.patients = activeDavolanish;

        this.lastPage = davolanishRes.data.last_page || 1;
      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchPatients();
    },
    calculateAge(birthdate) {
      if (!birthdate) return "—";
      const birth = dayjs(birthdate);
      const today = dayjs();
      let age = today.year() - birth.year();
      if (
        today.month() < birth.month() ||
        (today.month() === birth.month() && today.date() < birth.date())
      ) {
        age--;
      }
      return age;
    },
  },
  mounted() {
    this.fetchPatients();
  },
  computed: {
    pagesToShow() {
      const maxVisiblePages = 7;
      const total = this.lastPage;
      const current = this.currentPage;

      let start = Math.max(1, current - Math.floor(maxVisiblePages / 2));
      let end = start + maxVisiblePages - 1;

      if (end > total) {
        end = total;
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
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
  grid-template-columns: repeat(4, 1fr); /* 4 ustun */
  grid-template-rows: repeat(3, auto); /* 3 qator */
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
