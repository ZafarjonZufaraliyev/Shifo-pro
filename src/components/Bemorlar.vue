<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
      <router-link to="/RoyxatgaOlish">
        <button class="add-button">+ Qo'shish</button>
      </router-link>
    </div>

    <div class="top-controls">
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input type="search" placeholder="Ism yoki familiya bo‘yicha qidirish..." v-model="search" />
      </div>

      <div class="view-toggle">
        <button :class="{ active: isCardView }" @click="isCardView = true" title="Card Ko‘rinish">
          📇
        </button>
        <button :class="{ active: !isCardView }" @click="isCardView = false" title="Jadval Ko‘rinish">
          📋
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="isCardView" class="cards">
      <Swiper
        :slides-per-view="1"
        :pagination="{ clickable: true }"
        :space-between="30"
        navigation
        class="mySwiper"
      >
        <SwiperSlide v-for="chunk in paginatedPatients" :key="chunk[0].id">
          <div class="card-page">
            <div v-for="patient in chunk" :key="patient.id" class="patient-card">
              <router-link :to="`/BemorCard/${patient.id}`">
                <div class="card__header">
                  <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
                  <span>{{ patient.age }} yosh | {{ patient.gender }}</span>
                </div>
              </router-link>
              <div class="card__body">
                <p><strong>📞 Telefon:</strong> {{ patient.phone || '—' }}</p>
                <p><strong>🗕 Keldi:</strong> {{ patient.weight || '—' }}</p>
                <p><strong>📤 Ketdi:</strong> {{ patient.weight || '—' }}</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <div v-else>
      <PatientTable :patients="filteredPatients" />
    </div>
  </div>
</template>

<script>
import PatientTable from '@/components/PatientTable.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default {
  components: {
    PatientTable,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      isCardView: true,
      search: '',
      patients: [],
      loading: true,
    };
  },
  computed: {
    filteredPatients() {
      return this.patients.filter(p => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(this.search.trim().toLowerCase());
      });
    },
    paginatedPatients() {
      const chunks = [];
      const perPage = 10;
      for (let i = 0; i < this.filteredPatients.length; i += perPage) {
        chunks.push(this.filteredPatients.slice(i, i + perPage));
      }
      return chunks;
    },
  },
  async mounted() {
    try {
      const res = await fetch('https://dummyjson.com/users');
      const data = await res.json();
      this.patients = data.users;
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
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.add-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 16px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #43a047;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f1f1;
  padding: 8px 12px;
  border-radius: 8px;
  width: 300px;
}

.search-box input {
  border: none;
  background: transparent;
  margin-left: 8px;
  outline: none;
  width: 100%;
}

.view-toggle button {
  background: #e0e0e0;
  border: none;
  padding: 8px 12px;
  margin-left: 8px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.view-toggle button.active {
  background: #4caf50;
  color: white;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card-page {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.patient-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;
}

.patient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card__header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.card__header span {
  font-size: 14px;
  color: #757575;
}

.card__body {
  margin-top: 10px;
  font-size: 14px;
  color: #424242;
}

.card__body p {
  margin: 4px 0;
}
</style>
