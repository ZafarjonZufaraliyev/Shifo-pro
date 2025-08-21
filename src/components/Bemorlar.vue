<template>
  <div class="patients-container">
    <!-- Sarlavha -->
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
    </div>

    <!-- Qidiruvlar -->
    <div class="top-controls">
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input type="search" placeholder="Ism yoki familiya bo‘yicha qidirish..." v-model="search"
          aria-label="Ism familiya qidirish" />
      </div>

      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Xona qidiruv" />
        <input type="search" placeholder="Xona raqami bo‘yicha qidirish..." v-model="roomSearch"
          aria-label="Xona raqami qidirish" />
      </div>
    </div>

    <!-- Sana filter -->
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
      <button @click="fetchAllExpiredPatients" class="btn-red">
        Faqat Ketishi Keraklar
      </button>
    </div>

    <!-- Jami son -->
    <p class="total-count">
      <strong>Jami bemorlar soni:</strong> {{ totalPatientsCount }}
    </p>

    <!-- Loader -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Jadval -->
    <table v-else class="patients-table">
      <thead>
        <tr>
          <th>F.I.Sh</th>
          <th>Yosh | Jinsi</th>
          <th>Telefon</th>
          <th>Keldi</th>
          <th>Ketdi</th>
          <th>Xonasi</th>
          <th>Harakatlar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in filteredPatients" :key="patient.id"
          :class="{ 'today-leaving': isLeavingToday(patient.ketish_sanasi) }">
          <td>
            <router-link :to="`/${role}/BemorCard/${patient.client.id}`">
              {{ patient.client.ism }} {{ patient.client.familiya }}
            </router-link>
          </td>
          <td>
            {{ calculateAge(patient.client.tugulgan_sana) }} yosh |
            {{ patient.client.jinsi }}
          </td>
          <td>{{ patient.client.tel1 || "—" }}</td>
          <td>{{ formatDateTime(patient.kelish_sanasi) || "—" }}</td>
          <td>{{ formatDateTime(patient.ketish_sanasi) || "—" }}</td>
          <td>{{ patient.room?.xona || "—" }}</td>
          <td>
            <button v-if="patient.status === '1' && isLeavingToday(patient.ketish_sanasi)" @click="markAsLeft(patient)"
              class="btn-ketdi btn-today">
              Ketadi
            </button>
          </td>
        </tr>
      </tbody>
    </table>


  </div>
</template>

<script>
import api from "@/api";
import dayjs from "dayjs";
import debounce from "lodash.debounce";

export default {
  data() {
    return {
      search: "",
      roomSearch: "",
      startDate: "",
      endDate: "",
      patients: [],
      totalPatientsCount: 0,
      loading: false,
      role: localStorage.getItem("role") || "mini",
      currentPage: 1,
      itemsPerPage: 20,
      onlyExpiredMode: false,
    };
  },

  watch: {
    search: {
      handler: debounce(function () {
        if (!this.onlyExpiredMode) {
          this.currentPage = 1;
          this.fetchPatients();
        }
      }, 500),
      immediate: true,
    },
    startDate() {
      if (!this.onlyExpiredMode) {
        this.currentPage = 1;
        this.fetchPatients();
      }
    },
    endDate() {
      if (!this.onlyExpiredMode) {
        this.currentPage = 1;
        this.fetchPatients();
      }
    },
    currentPage() {
      if (!this.onlyExpiredMode) {
        this.fetchPatients();
      }
    },
  },

  methods: {
    isLeavingToday(date) {
      if (!date) return false;
      const ketish = dayjs(date).format("YYYY-MM-DD");
      const today = dayjs().format("YYYY-MM-DD");
      return ketish <= today;
    },

    async fetchPatients() {
      this.loading = true;
      this.onlyExpiredMode = false;
      try {
        const params = {
          page: this.currentPage,
          per_page: this.itemsPerPage,
          search: this.search,
          status: "1",
        };
        if (this.startDate) params.kelish_sanasi_from = this.startDate;
        if (this.endDate) params.kelish_sanasi_to = this.endDate;

        const res = await api.get("/api/v1/davolanish", { params });
        let allPatients = res.data.data || [];

        // faqat status=1 bo‘lganlar
        allPatients = allPatients.filter((p) => p.status === "1");

        const today = dayjs().format("YYYY-MM-DD");
        const expiredOrToday = allPatients.filter(
          (p) => p.ketish_sanasi && dayjs(p.ketish_sanasi).format("YYYY-MM-DD") <= today
        );
        const others = allPatients.filter(
          (p) => !p.ketish_sanasi || dayjs(p.ketish_sanasi).format("YYYY-MM-DD") > today
        );

        this.patients =
          this.currentPage === 1 ? [...expiredOrToday, ...others] : others;
        this.totalPatientsCount = res.data.total || allPatients.length;
      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAllExpiredPatients() {
      this.loading = true;
      this.onlyExpiredMode = true;
      try {
        let allPatients = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await api.get("/api/v1/davolanish", {
            params: {
              page,
              per_page: this.itemsPerPage,
              search: this.search,
              status: "1",
            },
          });

          const data = res.data.data || [];
          allPatients.push(...data);

          if (data.length < this.itemsPerPage) {
            hasMore = false;
          } else {
            page++;
          }
        }

        const today = dayjs().format("YYYY-MM-DD");
        this.patients = allPatients.filter(
          (p) =>
            p.status === "1" &&
            p.ketish_sanasi &&
            dayjs(p.ketish_sanasi).format("YYYY-MM-DD") <= today
        );
        this.totalPatientsCount = this.patients.length;
      } catch (error) {
        console.error("Xatolik:", error);
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
        (today.month() === birth.month && today.date() < birth.date())
      ) {
        age--;
      }
      return age;
    },

    formatDateTime(datetimeStr) {
      if (!datetimeStr) return "—";
      return dayjs(datetimeStr).format("YYYY-MM-DD HH:mm");
    },

    async markAsLeft(patient) {
      try {
        this.loading = true;
        const payload = {
          ...patient,
          status: "0",
          updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };
        await api.put(`/api/v1/davolanish/${patient.id}`, payload);
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

    onFilterClick() {
      this.currentPage = 1;
      this.fetchPatients();
    },
  },

  computed: {
    pageCount() {
      return Math.ceil(this.totalPatientsCount / this.itemsPerPage);
    },

    // 🔹 Ism, familiya va xona raqami bo‘yicha qidiruv
    filteredPatients() {
      return this.patients.filter((p) => {
        const fullName = `${p.client.ism} ${p.client.familiya}`.toLowerCase();
        const matchesName =
          !this.search || fullName.includes(this.search.toLowerCase());

        const matchesRoom =
          !this.roomSearch ||
          (p.room?.xona &&
            String(p.room.xona).toLowerCase().includes(this.roomSearch.toLowerCase()));

        return matchesName && matchesRoom;
      });
    },
  },

  mounted() {
    this.fetchPatients();
  },
};
</script>
<style scoped>
/* 📦 Container */
.patients-container {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* 🩺 Sarlavha */
.header-section {
  margin-bottom: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 🔍 Qidiruvlar */
.top-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 8px;
}

.search-box img {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

/* 📅 Sana filterlari */
.date-range-filter {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.date-range-filter label {
  font-size: 13px;
  color: #444;
  display: flex;
  flex-direction: column;
}

.date-range-filter input[type="date"] {
  margin-top: 3px;
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.date-range-filter button {
  padding: 5px;
  height: 40px;
  background: #4b5563;
  color: #fff;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.date-range-filter button:hover {
  background: #374151;
  padding: 5px;
  height: 40px;
}

.date-range-filter .btn-red {
  background: #b91c1c;
  padding: 5px;
  height: 40px;
}

.date-range-filter .btn-red:hover {

  background: #991b1b;
}

/* 📊 Jami son */
.total-count {
  margin-bottom: 10px;
  font-size: 14px;
  color: #222;
}

/* ⏳ Loader */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.spinner {
  border: 3px solid #eee;
  border-top: 3px solid #555;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 📋 Jadval */
.patients-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.patients-table th,
.patients-table td {
  padding: 10px;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.patients-table th {
  font-weight: 600;
  color: #333;
  background: #f9fafb;
}

.patients-table td {
  color: #444;
}

.patients-table tbody tr:hover {
  background: #fafafa;
}

.today-leaving {
  background: #e56d6d;
}

/* 🟦 Tugmalar jadval ichida */
.btn-ketdi {
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.btn-ketdi:hover {
  background: #15803d;
}

.btn-today {
  background: #dc2626;
}

.btn-today:hover {
  background: #b91c1c;
}

/* 📱 Responsiv */
@media (max-width: 768px) {

  .top-controls,
  .date-range-filter {
    flex-direction: column;
  }

  .search-box,
  .date-range-filter button {
    width: 100%;
  }

  .patients-table th,
  .patients-table td {
    font-size: 12px;
    padding: 8px;
  }
}
</style>