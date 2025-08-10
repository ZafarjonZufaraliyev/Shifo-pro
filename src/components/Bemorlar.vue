<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
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
    </div>

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

    <p class="total-count">
      <strong>Jami bemorlar soni:</strong> {{ totalPatientsCount }}
    </p>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="isCardView" class="cards-wrapper">
      <div class="cards-grid" :style="{ gridTemplateColumns: 'repeat(4, 1fr)' }">
        <div
          v-for="patient in patients"
          :key="patient.id"
          class="patient1-card"
          :class="{ 'today-leaving': isLeavingToday(patient.ketish_sanasi) }"
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
  v-if="patient.status === '1' && isLeavingToday(patient.ketish_sanasi)"
  @click="markAsLeft(patient)"
  class="btn-ketdi btn-today"
>
  Ketdi
</button>

            </p>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="pageCount > 1">
        <button
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="pagination-btn"
        >
          &lt; Oldingi
        </button>

        <button
          v-for="page in pageCount"
          :key="page"
          @click="goToPage(page)"
          :class="['pagination-btn', { active: page === currentPage }]"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === pageCount"
          @click="goToPage(currentPage + 1)"
          class="pagination-btn"
        >
          Keyingi &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import dayjs from "dayjs";
import debounce from "lodash.debounce";

export default {
  data() {
    return {
      isCardView: true,
      search: "",
      startDate: "",
      endDate: "",
      patients: [],
      totalPatientsCount: 0,
      loading: false,
      role: localStorage.getItem("role") || "mini",
      currentPage: 1,
      itemsPerPage: 20,
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
    startDate() {
      this.currentPage = 1;
      this.fetchPatients();
    },
    endDate() {
      this.currentPage = 1;
      this.fetchPatients();
    },
    currentPage() {
      this.fetchPatients();
    },
  },

  methods: {
    async fetchPatients() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          per_page: this.itemsPerPage,
          search: this.search,
        };
        if (this.startDate) params.kelish_sanasi_from = this.startDate;
        if (this.endDate) params.kelish_sanasi_to = this.endDate;

        const res = await api.get("/api/v1/davolanish", { params });

        let allPatients = res.data.data || [];

        // Ketish sanasi bugungi kunga teng bo'lganlarni oldinga chiqarish
        const today = dayjs().format("YYYY-MM-DD");
        const todayLeaving = allPatients.filter(p =>
          p.ketish_sanasi && dayjs(p.ketish_sanasi).format("YYYY-MM-DD") === today
        );
        const others = allPatients.filter(
          p => !p.ketish_sanasi || dayjs(p.ketish_sanasi).format("YYYY-MM-DD") !== today
        );

        this.patients = [...todayLeaving, ...others];
        this.totalPatientsCount = res.data.total || 0;

      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    isLeavingToday(date) {
      if (!date) return false;
      return dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
    },

    calculateAge(birthdate) {
      if (!birthdate) return "—";
      const birth = dayjs(birthdate);
      const today = dayjs();
      let age = today.year() - birth.year();
      if (today.month() < birth.month() || (today.month() === birth.month() && today.date() < birth.date())) {
        age--;
      }
      return age;
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
      } catch (error) {
        console.error("Statusni o'zgartirishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page;
        window.scrollTo(0, 0);
      }
    },
  },

  computed: {
    pageCount() {
      return Math.ceil(this.totalPatientsCount / this.itemsPerPage);
    },
  },

  mounted() {
    this.fetchPatients();
  },
};
</script>



<style scoped>
.today-leaving {
  border: 5px solid red;
}
.btn-today {
  background-color: red;
  color: white;
}
.patients-container {
  width:100%;
  margin:20px auto;
  max-width:1200px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
  color: #222;
}

/* Header va sarlavha */
.header-section {
  margin-bottom: 15px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #007bff;
  user-select: none;
}

/* Yuqori boshqaruvlar */
.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

/* Qidiruv qutisi */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
  flex-grow: 1;
  max-width: 400px;
}

.search-box img {
  width: 20px;
  height: 20px;
  filter: grayscale(80%) brightness(60%);
}

.search-box input {
  border: none;
  outline: none;
  margin-left: 8px;
  font-size: 15px;
  width: 100%;
  background: transparent;
  color: #333;
  transition: box-shadow 0.3s ease;
}

.search-box input::placeholder {
  color: #999;
}

.search-box input:focus {
  box-shadow: 0 0 5px #007bff;
  border-radius: 4px;
}

/* Ko‘rinish toggle tugmalari */
.view-toggle {
  display: flex;
  gap: 8px;
}

.view-toggle button {
  background: #e9ecef;
  border: 1.5px solid #ced4da;
  border-radius: 6px;
  font-size: 22px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s, border-color 0.25s, color 0.25s;
  user-select: none;
}

.view-toggle button:hover:not(.active) {
  background-color: #d1e7ff;
}

.view-toggle button.active {
  background-color: #007bff;
  border-color: #0056b3;
  color: white;
  box-shadow: 0 0 8px #0056b3aa;
}

/* Sana oralig‘i filtri */
.date-range-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.date-range-filter label {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range-filter input[type="date"] {
  padding: 6px 10px;
  border: 1.5px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.25s ease;
}

.date-range-filter input[type="date"]:focus {
  border-color: #007bff;
  outline: none;
}

.date-range-filter button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 18px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}

.date-range-filter button:hover {
  background-color: #0056b3;
}

/* Jami bemorlar soni */
.total-count {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  user-select: none;
}

/* Yuklanish spinner */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.spinner {
  border: 5px solid #e0e0e0;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Card ko‘rinish */
.cards-wrapper {
  margin-top: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.patient1-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgb(0 0 0 / 0.07);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
  user-select: none;
}

.patient1-card:hover {
  box-shadow: 0 12px 20px rgb(0 0 0 / 0.15);
  transform: translateY(-4px);
}

.card-link {
  text-decoration: none;
  color: inherit;
  user-select: none;
}

.card__header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #007bff;
}

.card__header span {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.card__body p {
  margin: 7px 0;
  font-size: 14px;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card__body strong {
  color: #222;
}

/* "Ketdi" tugmasi */
.btn-ketdi {
  background-color: #28a745;
  border: none;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.25s ease;
  user-select: none;
  margin-left: 12px;
}

.btn-ketdi:hover {
  background-color: #1e7e34;
}

/* Pagination */
.pagination {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  user-select: none;
}

.pagination-btn {
  border: 1.8px solid #007bff;
  background-color: white;
  color: #007bff;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  transition: background-color 0.3s ease, color 0.3s ease;
  min-width: 48px;
  text-align: center;
  user-select: none;
}

.pagination-btn:disabled {
  border-color: #cfd4da;
  color: #cfd4da;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.pagination-btn.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0 0 10px #007bffaa;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
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

@media (max-width: 600px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  .page-title {
    font-size: 22px;
  }
  .btn-ketdi {
    padding: 3px 7px;
    font-size: 11px;
  }
  .pagination-btn {
    padding: 6px 10px;
    font-size: 13px;
    min-width: 40px;
  }
}

</style>
