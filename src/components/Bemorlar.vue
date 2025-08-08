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
        // faqat status=1 va ketish sanasi hali o'tmagan yoki bo'sh bo'lgan bemorlar
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
      console.log(datetimeStr); // bu yerda qiymatni ko'ring

      return dayjs(datetimeStr).format("YYYY-MM-DD HH:mm");
    },

    async markAsLeft(patient) {
      try {
        this.loading = true;
        await api.put(`/api/v1/davolanish/${patient.id}`, {
          status: "0",
        });
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
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  width:100%;
  font-family: Arial, sans-serif;
}

.header-section {
  margin-bottom: 15px;
}

.page-title {
  font-weight: bold;
  font-size: 24px;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box input {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.view-toggle button {
  padding: 6px 10px;
  margin-left: 5px;
  cursor: pointer;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 18px;
}

.view-toggle button.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.date-range-filter label {
  font-weight: 600;
}

.btn-ketdi {
  margin-left: 10px;
  padding: 3px 8px;
  background-color: #f44336;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
}

.btn-ketdi:hover {
  background-color: #d32f2f;
}

.cards-wrapper {
  margin-top: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.patient1-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 0 6px rgba(0,0,0,0.1);
}

.card__header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.card__header span {
  color: #666;
  font-size: 0.9rem;
}

.card__body p {
  margin: 6px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #aaa;
  cursor: pointer;
  background-color: white;
}

.page-btn.active {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
  font-weight: bold;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-container {
  text-align: center;
  margin-top: 20px;
}

.spinner {
  border: 4px solid #eee;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin: auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
