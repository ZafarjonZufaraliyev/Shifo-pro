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
      <strong>Jami bemorlar soni:</strong> {{ totalPatientsCount }}
    </p>

    <!-- Yuklanish spinneri -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Card ko‘rinish -->
    <div v-else-if="isCardView" class="cards-wrapper">
      <div class="cards-grid" :style="{ gridTemplateColumns: 'repeat(4, 1fr)' }">
        <div
          v-for="patient in patients"
          :key="patient.id"
          class="patient1-card"
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
              >
                Ketdi
              </button>
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
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

    <!-- Jadval ko‘rinish -->
    <div v-else>
      <PatientTable :patients="patients" />
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
      patients: [],          // Faqat hozirgi sahifadagi yozuvlar
      totalPatientsCount: 0, // Jami bemorlar soni
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

        // API javobidan hozirgi sahifa yozuvlari
        this.patients = res.data.data || [];
        // Jami yozuvlar soni (backenddan keladi)
        this.totalPatientsCount = res.data.total || 0;

        console.log("Bemorlar (sahifa):", this.patients);
        console.log("Jami bemorlar soni:", this.totalPatientsCount);
      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        this.loading = false;
      }
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

    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page;
        window.scrollTo(0, 0);
        console.log(`Sahifa: ${page} ga o‘tildi`);
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
.patients-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header-section {
  margin-bottom: 10px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
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
}

.search-box input {
  margin-left: 5px;
  padding: 5px 10px;
  font-size: 14px;
}

.view-toggle button {
  background: none;
  border: none;
  font-size: 20px;
  margin-left: 5px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 5px;
}

.view-toggle button.active {
  background-color: #007bff;
  color: white;
}

.date-range-filter {
  margin-bottom: 15px;
}

.date-range-filter label {
  margin-right: 10px;
  font-size: 14px;
}

.date-range-filter input[type="date"] {
  margin-left: 5px;
  padding: 3px 6px;
}

.date-range-filter button {
  padding: 5px 10px;
  cursor: pointer;
}

.total-count {
  margin-bottom: 10px;
  font-weight: bold;
}

.loading-container {
  text-align: center;
  padding: 20px;
}

.spinner {
  border: 4px solid #ccc;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cards-wrapper {
  margin-top: 15px;
}

.cards-grid {
  display: grid;
  gap: 15px;
}

.patient1-card {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.card__header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.card__header span {
  font-size: 14px;
  color: #555;
}

.card__body p {
  margin: 5px 0;
  font-size: 14px;
}

.btn-ketdi {
  margin-left: 10px;
  background-color: #28a745;
  border: none;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination-btn {
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
}

.pagination-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #007bff;
  color: white;
}
</style>
