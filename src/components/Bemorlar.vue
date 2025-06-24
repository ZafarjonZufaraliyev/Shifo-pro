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

    <!-- CARD KO‘RINISHI -->
    <div v-if="isCardView" class="cards">
      <PatientCard
        v-for="patient in filteredPatients"
        :key="patient.id"
        :patient="patient"
      />
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
    };
  },
  computed: {
    filteredPatients() {
      return this.patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  mounted() {
    api.get('/api/v1/clients')
      .then(res => {
        this.patients = res.data;
        console.log("Bemorlar:", this.patients);
      })
      .catch(err => {
        console.error("API xatolik:", err);
      });
  },
};
</script>

<style scoped>

</style>
