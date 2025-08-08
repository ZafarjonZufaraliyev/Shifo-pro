<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
    </div>

    <div class="top-controls">
      <!-- Qidiruv -->
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input
          type="search"
          placeholder="Ism yoki familiya bo‘yicha qidirish..."
          v-model="search"
          aria-label="Bemorlarni qidirish"
        />
      </div>

      <!-- Ko'rinish toggle -->
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

    <!-- Sana oralig‘i filtri -->
    <div
      class="date-range-filter"
      style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 15px;"
    >
      <label style="margin-right: 15px;">
        Boshlanish sanasi:
        <input type="date" v-model="startDate" />
      </label>
      <label style="margin-right: 15px;">
        Tugash sanasi:
        <input type="date" v-model="endDate" />
      </label>
      <button @click="onFilterClick" style="padding: 6px 12px;">Filtrlash</button>
    </div>

    <!-- Jami bemorlar soni -->
    <p style="margin-top: 10px;">
      <strong>Jami bemorlar soni:</strong> {{ patients.length }}
    </p>

    <!-- Yuklanish spinneri -->
    <div v-if="loading" class="loading-container" role="status" aria-live="polite">
      <div class="spinner"></div>
    </div>

    <!-- Sanalar bo'yicha guruhlangan ro'yxat -->
    <div v-else-if="startDate && endDate">
      <div
        v-for="(patientsList, date) in groupedPatients"
        :key="date"
        class="daily-patients-block"
        style="margin-bottom: 25px;"
      >
        <h3>{{ date }} ({{ patientsList.length }} ta bemor)</h3>
        <ul>
          <li v-if="patientsList.length === 0" style="color: #999;">
            Hech kim kelmagan
          </li>
          <li v-for="patient in patientsList" :key="patient.id">
            {{ patient.client.ism }} {{ patient.client.familiya }},
            {{ calculateAge(patient.client.tugulgan_sana) }} yosh,
            {{ patient.client.jinsi }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Card ko‘rinish (sanalar oralig‘i berilmagan bo‘lsa) -->
    <div v-else-if="isCardView">
      <div class="cards-wrapper">
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

        <!-- Sahifalash -->
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
    </div>

    <!-- Jadval ko‘rinish -->
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
      startDate: "", // Boshlanish sanasi
      endDate: "", // Tugash sanasi
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
        const params = {
          search: this.search,
          page: this.currentPage,
          per_page: this.perPage,
        };

        if (this.startDate) params.kelish_sanasi_from = this.startDate;
        if (this.endDate) params.kelish_sanasi_to = this.endDate;

        const davolanishRes = await api.get("/api/v1/davolanish", { params });
        const davolanishData = davolanishRes.data.data || [];

        const today = dayjs().format("YYYY-MM-DD");
        const activeDavolanish = davolanishData.filter(
          (item) => item.status === "1" && (!item.ketish_sanasi || item.ketish_sanasi >= today)
        );

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

    onFilterClick() {
      this.currentPage = 1;
      this.fetchPatients();
    },

    // Sana oralig‘ini yaratish
    getDateRange(startDate, endDate) {
      const dates = [];
      let current = dayjs(startDate);
      const last = dayjs(endDate);
      while (current.isBefore(last) || current.isSame(last, "day")) {
        dates.push(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }
      return dates;
    },

    // Bemorlarni kelish sanasiga ko‘ra guruhlash
    groupPatientsByDate() {
      const grouped = {};
      const dates = this.getDateRange(this.startDate, this.endDate);
      dates.forEach((date) => {
        grouped[date] = [];
      });

      this.patients.forEach((patient) => {
        const keldi = patient.kelish_sanasi;
        if (keldi && grouped[keldi]) {
          grouped[keldi].push(patient);
        }
      });

      return grouped;
    },
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

    // Sanalar bo‘yicha guruhlangan bemorlar
    groupedPatients() {
      if (!this.startDate || !this.endDate) return {};
      return this.groupPatientsByDate();
    },
  },
  mounted() {
    this.fetchPatients();
  },
};
</script>
<style scoped>
.patients-container {
  width:100%;
  max-width: 1200px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background: #f9f9f9;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.05);
}

.header-section {
  text-align: center;
  margin-bottom: 15px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
  max-width: 350px;
}

.search-box img {
  width: 20px;
  height: 20px;
  opacity: 0.6;
}

.search-box input[type="search"] {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-box input[type="search"]:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px #3498dbaa;
}

.view-toggle button {
  background: #e0e0e0;
  border: none;
  border-radius: 6px;
  font-size: 22px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.view-toggle button.active,
.view-toggle button:hover {
  background: #3498db;
  color: white;
}

.date-range-filter label {
  font-weight: 600;
  font-size: 14px;
  color: #444;
}

.date-range-filter input[type="date"] {
  margin-left: 8px;
  padding: 6px 10px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.date-range-filter input[type="date"]:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px #3498dbaa;
}

.date-range-filter button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 7px 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.date-range-filter button:hover {
  background-color: #2980b9;
}

p {
  font-size: 15px;
  margin: 12px 0 20px 0;
  font-weight: 600;
  color: #2c3e50;
}

/* Loading spinner */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #ddd;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Daily patients block */
.daily-patients-block h3 {
  font-size: 20px;
  font-weight: 700;
  color: #34495e;
  margin-bottom: 6px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 4px;
}

.daily-patients-block ul {
  list-style-type: disc;
  padding-left: 20px;
  color: #555;
  font-size: 15px;
}

.daily-patients-block ul li {
  margin-bottom: 6px;
}

/* Cards grid */
.cards-wrapper {
  margin-top: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.patient1-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgb(0 0 0 / 0.1);
  padding: 16px;
  transition: box-shadow 0.3s;
}

.patient1-card:hover {
  box-shadow: 0 6px 12px rgb(0 0 0 / 0.15);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.card__header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 700;
}

.card__header span {
  font-size: 14px;
  color: #666;
}

.card__body p {
  margin: 6px 0;
  font-size: 14px;
  color: #444;
  font-weight: 500;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 8px;
  flex-wrap: wrap;
}

.page-btn {
  background: #e0e0e0;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
}

.page-btn.active {
  background-color: #2980b9;
  color: white;
  cursor: default;
}

.page-btn:disabled {
  background-color: #bbb;
  cursor: not-allowed;
  color: #eee;
}

.nav-btn {
  font-weight: 700;
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .top-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .view-toggle {
    justify-content: flex-start;
  }
}
</style>
