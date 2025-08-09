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
            {{ patient.client.jinsi }} -
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
      <div class="cards-grid" role="list" :style="{ gridTemplateColumns: 'repeat(4, 1fr)' }">
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
      perPage: 5, // 5 ta element per page
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
  padding: 2rem 3rem;
  background: #f7fafc;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  min-height: 100vh;
  user-select: none;
}

.header-section .page-title {
  font-size: 2.6rem;
  font-weight: 800;
  margin-bottom: 2rem;
  letter-spacing: 0.08em;
  color: #1e40af; /* ko‘kroq */
}

.top-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.search-box {
  flex-grow: 1;
  max-width: 400px;
  position: relative;
}

.search-box img {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  width: 24px;
  opacity: 0.7;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 44px;
  font-size: 1.3rem;
  border: 2.5px solid #cbd5e1;
  border-radius: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.1);
}

.search-box input::placeholder {
  font-size: 1.2rem;
  color: #64748b;
}

.search-box input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
  background: #fff;
}

.view-toggle {
  display: flex;
  gap: 0.8rem;
}

.view-toggle button {
  background: #e0e7ff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.9rem;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
  box-shadow: 0 2px 6px rgb(71 85 105 / 0.2);
}

.view-toggle button:hover {
  background: #c7d2fe;
  color: #1e40af;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgb(30 64 175 / 0.5);
}

.view-toggle button.active {
  background: #1e40af;
  color: white;
  box-shadow: 0 0 16px rgba(30, 64, 175, 0.8);
}

.date-range-filter {
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.date-range-filter label {
  font-weight: 700;
  font-size: 1.1rem;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 170px;
}

.date-range-filter input[type="date"] {
  padding: 0.6rem 0.8rem;
  font-size: 1.2rem;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
}

.date-range-filter input[type="date"]:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 12px rgba(30, 64, 175, 0.35);
}

.date-range-filter button {
  background: #1e40af;
  color: white;
  border: none;
  padding: 0.75rem 1.8rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 6px 14px rgb(30 64 175 / 0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.date-range-filter button:hover {
  background: #4338ca;
  box-shadow: 0 8px 20px rgb(67 56 202 / 0.65);
}

.total-count {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  user-select: text;
}

.loading-container {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

.spinner {
  border: 7px solid #e0e7ff;
  border-top: 7px solid #1e40af;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grouped-patients {
  margin-top: 1.5rem;
  color: #334155;
  font-size: 1.1rem;
  font-weight: 600;
}

.daily-patients-block {
  margin-bottom: 2.5rem;
  background: white;
  border-radius: 16px;
  padding: 1.8rem 2rem;
  box-shadow: 0 3px 15px rgb(0 0 0 / 0.08);
  user-select: text;
}

.daily-patients-block h3 {
  margin-bottom: 1rem;
  color: #1e3a8a;
  font-weight: 800;
  font-size: 1.6rem;
  border-bottom: 3px solid #1e40af;
  padding-bottom: 0.5rem;
  user-select: text;
}

.daily-patients-block ul {
  list-style: inside disc;
  line-height: 1.8;
  padding-left: 1.2rem;
}

.no-patients {
  font-style: italic;
  color: #64748b;
}

.cards-wrapper {
  margin-top: 1.5rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
}

.patient1-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgb(30 64 175 / 0.15);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  user-select: text;
}

.patient1-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 14px 36px rgb(30 64 175 / 0.35);
}

.card-link {
  color: inherit;
  text-decoration: none;
  flex-grow: 1;
}

.card__header {
  margin-bottom: 1rem;
}

.card__header h3 {
  font-weight: 800;
  font-size: 1.6rem;
  color: #1e40af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: text;
}

.card__header span {
  font-weight: 700;
  color: #475569;
  font-size: 1.1rem;
}

.card__body p {
  margin: 0.7rem 0;
  font-size: 1.1rem;
  color: #334155;
  line-height: 1.5;
}

.btn-ketdi {
  background-color: #dc2626;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  margin-left: 1rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgb(220 38 38 / 0.6);
  user-select: none;
  align-self: center;
}

.btn-ketdi:hover {
  background-color: #b91c1c;
  box-shadow: 0 6px 16px rgb(185 28 28 / 0.8);
}

.pagination-wrapper {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  user-select: none;
}

.page-btn {
  background-color: #e0e7ff;
  border: 2px solid #c7d2fe;
  color: #1e40af;
  padding: 0.65rem 1.3rem;
  cursor: pointer;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.15rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgb(30 64 175 / 0.3);
}

.page-btn:hover:not(:disabled) {
  background-color: #1e3a8a;
  border-color: #1e3a8a;
  color: white;
  box-shadow: 0 6px 18px rgb(30 64 175 / 0.8);
}

.page-btn.active {
  background-color: #1e40af;
  border-color: #1e40af;
  color: white;
  box-shadow: 0 8px 22px rgb(30 64 175 / 1);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.nav-btn {
  font-weight: 800;
  font-size: 1.4rem;
  padding: 0.4rem 1.2rem;
}


</style>
