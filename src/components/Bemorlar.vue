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
    <div class="date-range-filter">
      <label>
        Boshlanish sanasi:
        <input type="date" v-model="startDate" />
      </label>
      <label>
        Tugash sanasi:
        <input type="date" v-model="endDate" />
      </label>
      <button @click="onFilterClick">Filtrlash</button>
    </div>

    <!-- Jami bemorlar soni -->
    <p class="total-count">
      <strong>Jami bemorlar soni:</strong> {{ patients.length }}
    </p>

    <!-- Yuklanish spinneri -->
    <div v-if="loading" class="loading-container" role="status" aria-live="polite">
      <div class="spinner"></div>
    </div>

    <!-- Sanalar bo'yicha guruhlangan ro'yxat -->
    <div v-else-if="startDate && endDate" class="grouped-patients">
      <div
        v-for="(patientsList, date) in groupedPatients"
        :key="date"
        class="daily-patients-block"
      >
        <h3>{{ date }} ({{ patientsList.length }} ta bemor)</h3>
        <ul>
          <li v-if="patientsList.length === 0" class="no-patients">
            Hech kim kelmagan
          </li>
          <li v-for="patient in patientsList" :key="patient.id">
            {{ patient.client.ism }} {{ patient.client.familiya }},
            {{ calculateAge(patient.client.tugulgan_sana) }} yosh,
            {{ patient.client.jinsi }},
            Ketdi: {{ formatDateTime(patient.ketish_sanasi) || '—' }}
            <button
              v-if="patient.status === '1'"
              @click="markAsLeft(patient)"
              class="btn-ketdi"
              aria-label="Bemor ketdi deb belgilash"
            >
              Ketdi
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Card ko‘rinish (sanalar oralig‘i berilmagan bo‘lsa) -->
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
            <p><strong>Keldi:</strong> {{ formatDateTime(patient.kelish_sanasi) || '—' }}</p>
            <p>
              <strong>Ketdi:</strong> {{ formatDateTime(patient.ketish_sanasi) || '—' }}
              <button
                v-if="patient.status === '1'"
                @click="markAsLeft(patient)"
                class="btn-ketdi"
                aria-label="Bemor ketdi deb belgilash"
              >
                Ketdi
              </button>
            </p>
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
  components: { PatientTable },

  data() {
    return {
      isCardView: true,
      search: "",
      startDate: "",
      endDate: "",
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

        const res = await api.get("/api/v1/davolanish", { params });
        const data = res.data.data || [];

        const today = dayjs().format("YYYY-MM-DD");
        const active = data.filter(
          (item) => item.status === "1" && (!item.ketish_sanasi || item.ketish_sanasi >= today)
        );

        this.patients = active;
        this.lastPage = res.data.last_page || 1;
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
        (today.month() === birth.month && today.date() < birth.date())
      ) {
        age--;
      }
      return age;
    },

    onFilterClick() {
      this.currentPage = 1;
      this.fetchPatients();
    },

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

    formatDateTime(datetimeStr) {
      if (!datetimeStr) return null;
      return dayjs(datetimeStr).format("YYYY-MM-DD HH:mm");
    },

    async markAsLeft(patient) {
      try {
        this.loading = true;
        await api.put(`/api/v1/davolanish/${patient.id}`, { status: "0" });
        await this.fetchPatients();
        alert(`${patient.client.ism} ${patient.client.familiya} ketdi deb belgilandi.`);
      } catch (error) {
        console.error("Statusni o'zgartirishda xatolik:", error);
        alert("Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
      } finally {
        this.loading = false;
      }
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
  max-width: 980px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  margin-bottom: 15px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  max-width: 320px;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.search-box img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 1rem;
  background-color: transparent;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.view-toggle button {
  font-size: 1.2rem;
  padding: 6px 12px;
  border-radius: 5px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.view-toggle button.active,
.view-toggle button:hover {
  background-color: #007bff;
  color: white;
}

.date-range-filter {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 15px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.date-range-filter label {
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range-filter input[type="date"] {
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #aaa;
  font-size: 1rem;
}

.date-range-filter button {
  padding: 6px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.date-range-filter button:hover {
  background-color: #0056b3;
}

.total-count {
  margin-top: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grouped-patients {
  margin-top: 25px;
}

.daily-patients-block {
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.daily-patients-block h3 {
  margin-bottom: 10px;
  color: #34495e;
}

.daily-patients-block ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.daily-patients-block li {
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.no-patients {
  color: #999;
  font-style: italic;
}

.patient1-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.05);
  transition: box-shadow 0.2s ease;
}

.patient1-card:hover {
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.12);
}

.card__header h3 {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.card__header span {
  font-size: 0.9rem;
  color: #777;
}

.card__body p {
  margin: 6px 0;
  font-size: 0.95rem;
}

.btn-ketdi {
  margin-left: 10px;
  padding: 3px 9px;
  font-size: 0.85rem;
  background-color: #dc3545;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-ketdi:hover {
  background-color: #b02a37;
}

.cards-wrapper {
  margin-top: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
  gap: 15px;
}

/* Sahifalash CSS */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 6px;
  user-select: none;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  font-weight: 600;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-btn.active {
  background-color: #007bff;
  color: white;
  cursor: default;
  pointer-events: none;
}

.nav-btn {
  font-weight: bold;
}
</style>
