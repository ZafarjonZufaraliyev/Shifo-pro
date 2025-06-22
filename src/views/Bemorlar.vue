<template>
  <div class="patients-container">
    <h2 class="bemorlar__titel">Bemorlar</h2>

    <div class="bemorlar__header">
      <div class="sorch">
        <input type="search" v-model="searchQuery" placeholder="Qidirish..." />
        <img src="../assets/image/sorch.svg" alt="Search" />
        <!-- Toggle view tugmasi: kartochkalar <-> jadval -->
        <img id="card" src="../assets/image/card.svg" alt="Toggle view" @click="toggleView" style="cursor: pointer;"
          title="Jadvalga o‘tish / Kartochkalarga qaytish" />
      </div>
      <div class="bemor__add"> <router-link to="/RoyxatgaOlish">Qo'shish</router-link></div>
    </div>

    <!-- Kartochkalar ko'rinishi -->
    <div v-if="!isTableView" class="cards">
      <div v-for="patient in filteredPatients" :key="patient.id" class="card">
        <div class="card__header">
          <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
          <span>20 yosh | erkak</span> <!-- yoki haqiqiy yoshni hisoblash mumkin -->
        </div>
        <p><strong>Telefon:</strong> {{ patient.phone }}</p>
        <p><strong>Keldi:</strong> {{ formatDate(patient.arrivalDate) }}</p>
        <p><strong>Ketdi:</strong> {{ formatDate(patient.departureDate) }}</p>
      </div>
    </div>

    <!-- Jadval ko'rinishi -->
    <table v-else class="patients-table">
      <thead>
        <tr>
          <th>Ism Familiya</th>
          <th>Telefon</th>
          <th>Keldi</th>
          <th>Ketdi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in filteredPatients" :key="patient.id">
          <td>{{ patient.firstName }} {{ patient.lastName }}</td>
          <td>{{ patient.phone }}</td>
          <td>{{ formatDate(patient.arrivalDate) }}</td>
          <td>{{ formatDate(patient.departureDate) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import "@/assets/css/bemorlar.css"
export default {
  data() {
    return {
      isTableView: false, // Jadval yoki kartochka ko'rinishi
      searchQuery: '',
      patients: [
        { id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567', arrivalDate: '2025-06-01', departureDate: '2025-06-10' },
        { id: 2, firstName: 'Gulbahor', lastName: 'Toshpulatova', phone: '+998909876543', arrivalDate: '2025-06-05', departureDate: '2025-06-15' },
        { id: 3, firstName: 'Oybek', lastName: 'Karimov', phone: '+998912345678', arrivalDate: '2025-06-07', departureDate: '2025-06-12' },
        { id: 4, firstName: 'Nilufar', lastName: 'Rahimova', phone: '+998901122334', arrivalDate: '2025-06-03', departureDate: '2025-06-09' },
        { id: 5, firstName: 'Davron', lastName: 'Sobirov', phone: '+998933445566', arrivalDate: '2025-06-02', departureDate: '2025-06-08' },
        { id: 6, firstName: 'Saida', lastName: 'Jumanazarova', phone: '+998978654321', arrivalDate: '2025-06-04', departureDate: '2025-06-14' },
        { id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567', arrivalDate: '2025-06-01', departureDate: '2025-06-10' },
        { id: 2, firstName: 'Gulbahor', lastName: 'Toshpulatova', phone: '+998909876543', arrivalDate: '2025-06-05', departureDate: '2025-06-15' },
        { id: 3, firstName: 'Oybek', lastName: 'Karimov', phone: '+998912345678', arrivalDate: '2025-06-07', departureDate: '2025-06-12' },
        { id: 4, firstName: 'Nilufar', lastName: 'Rahimova', phone: '+998901122334', arrivalDate: '2025-06-03', departureDate: '2025-06-09' },
        { id: 5, firstName: 'Davron', lastName: 'Sobirov', phone: '+998933445566', arrivalDate: '2025-06-02', departureDate: '2025-06-08' },
        { id: 6, firstName: 'Saida', lastName: 'Jumanazarova', phone: '+998978654321', arrivalDate: '2025-06-04', departureDate: '2025-06-14' },

        { id: 7, firstName: 'Bekzod', lastName: 'Islomov', phone: '+998912345679', arrivalDate: '2025-06-10', departureDate: '2025-06-20' },
        { id: 8, firstName: 'Dildora', lastName: 'Abdullaeva', phone: '+998909876544', arrivalDate: '2025-06-11', departureDate: '2025-06-21' },
        { id: 9, firstName: 'Jasur', lastName: 'Karimov', phone: '+998901234568', arrivalDate: '2025-06-12', departureDate: '2025-06-22' },
        { id: 10, firstName: 'Malika', lastName: 'Rahimova', phone: '+998901122335', arrivalDate: '2025-06-13', departureDate: '2025-06-23' },
        { id: 11, firstName: 'Nodira', lastName: 'Sobirova', phone: '+998933445567', arrivalDate: '2025-06-14', departureDate: '2025-06-24' },
        { id: 12, firstName: 'Rustam', lastName: 'Jumanazarov', phone: '+998978654322', arrivalDate: '2025-06-15', departureDate: '2025-06-25' },
        { id: 13, firstName: 'Sardor', lastName: 'Valiyev', phone: '+998901234570', arrivalDate: '2025-06-16', departureDate: '2025-06-26' },
        { id: 14, firstName: 'Shahlo', lastName: 'Toshpulatova', phone: '+998909876545', arrivalDate: '2025-06-17', departureDate: '2025-06-27' },
        { id: 15, firstName: 'Timur', lastName: 'Karimov', phone: '+998912345671', arrivalDate: '2025-06-18', departureDate: '2025-06-28' },
        { id: 16, firstName: 'Umida', lastName: 'Rahimova', phone: '+998901122336', arrivalDate: '2025-06-19', departureDate: '2025-06-29' },
        { id: 17, firstName: 'Vasila', lastName: 'Sobirova', phone: '+998933445568', arrivalDate: '2025-06-20', departureDate: '2025-06-30' },
        { id: 18, firstName: 'Yodgor', lastName: 'Jumanazarov', phone: '+998978654323', arrivalDate: '2025-06-21', departureDate: '2025-07-01' },
        { id: 19, firstName: 'Zaynab', lastName: 'Valiyeva', phone: '+998901234571', arrivalDate: '2025-06-22', departureDate: '2025-07-02' },
        { id: 20, firstName: 'Zohid', lastName: 'Toshpulatov', phone: '+998909876546', arrivalDate: '2025-06-23', departureDate: '2025-07-03' },
        { id: 21, firstName: 'Aziza', lastName: 'Karimova', phone: '+998912345672', arrivalDate: '2025-06-24', departureDate: '2025-07-04' },
        { id: 22, firstName: 'Bobur', lastName: 'Rahimov', phone: '+998901122337', arrivalDate: '2025-06-25', departureDate: '2025-07-05' },
        { id: 23, firstName: 'Dilshod', lastName: 'Sobirov', phone: '+998933445569', arrivalDate: '2025-06-26', departureDate: '2025-07-06' },
        { id: 24, firstName: 'Elmira', lastName: 'Jumanazarova', phone: '+998978654324', arrivalDate: '2025-06-27', departureDate: '2025-07-07' },
        { id: 25, firstName: 'Farruh', lastName: 'Valiyev', phone: '+998901234572', arrivalDate: '2025-06-28', departureDate: '2025-07-08' }
      ]
    }
  },
  computed: {
    filteredPatients() {
      if (!this.searchQuery) return this.patients;
      const q = this.searchQuery.toLowerCase();
      return this.patients.filter(
        p =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }
  },
  methods: {
    toggleView() {
      this.isTableView = !this.isTableView;
    },
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('uz-UZ', options);
    },
  }
}
</script>

<style scoped>
/* --- Sizning mavjud CSS qo‘shiladi (bu yerga siz yozgan hamma CSS keladi) --- */

/* Jadval uslublari */


/* --- Kartochkalar va qolgan CSS kodlaringiz shu yerda bo‘lishi mumkin --- */

/* Siz yozgan .patients-container, .card, .bemorlar__titel, .bemor__add, .sorch va boshqa klasslar */
</style>
