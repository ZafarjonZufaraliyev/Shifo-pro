<template>
  <div class="patients-container">
    <h2 class="bemorlar__titel">Bemorlar Ro'yxati</h2>

    <div class="bemorlar__header">
      <div class="sorch">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input type="search" placeholder="Qidirish..." v-model="search" />
      </div>
      <router-link to="/RoyxatgaOlish">
        <div class="bemor__add">
          <h2>Qo'shish</h2>
        </div>
      </router-link>
    </div>

    <div class="view-toggle">
      <button @click="isCardView = true">Card Ko'rinish</button>
      <button @click="isCardView = false">Jadval Ko'rinish</button>
    </div>

    <!-- Yuklanmoqda -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- CARD KO‘RINISHI -->
    <div v-else-if="isCardView" class="cards">
      <div v-for="patient in filteredPatients" :key="patient.id" :patient="patient">


        <div class="patient-card">
          <router-link :to="`/BemorCard/${patient.id}`">
            <div class="card__header">
              <h3>{{ patient.familiya }} {{ patient.ism }}</h3>
              <span>{{ patient.age }} yosh | {{ patient.gender }}</span>
            </div>
          </router-link>

          <div class="card__body">
            <p><strong>📞 Telefon:</strong> {{ patient.tel1 || '—' }}</p>
            <p><strong>📅 Keldi:</strong> {{ patient.keldi || '—' }}</p>
            <p><strong>📤 Ketdi:</strong> {{ patient.ketdi || '—' }}</p>
          </div>
        </div>

      </div>

    </div>

    <!-- JADVAL KO‘RINISHI -->
    <div v-else>
      <PatientTable :patients="filteredPatients" />
    </div>
  </div>
</template>

<script>
import PatientCard from '@/components/PatientCard.vue';
import PatientTable from '@/components/PatientTable.vue';
import api from '@/api';
import "@/assets/css/bemorlar.css";

export default {
  components: {
    PatientCard,
    PatientTable,
  },
  data() {
    return {
      isCardView: true,
      search: '',
      patients: [],
      loading: true, // 👈 Qo‘shildi
    };
  },
  computed: {
    filteredPatients() {
      return this.patients.filter(p => {
        const fullName = `${p.familiya} ${p.ism}`.toLowerCase();
        return fullName.includes(this.search.trim().toLowerCase());
      });
    },
  },
  async mounted() {
    try {
      const res = await api.get('/api/v1/clients');
      this.patients = res.data;
      console.log("Bemorlar:", this.patients);
    } catch (err) {
      console.error("API xatolik:", err);
    } finally {
      this.loading = false; // 👈 Ma'lumot keldi, yuklanish tugadi
    }
  },
};
</script>

<style scoped>
/* Yuklanmoqda spinner */
</style>
