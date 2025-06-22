<template>
  <div class="patients-container">
    <h2 class="bemorlar__titel">Bemorlar</h2>
   <div class="bemorlar__header">
     <div class="sorch">
      <input type="search" name="" id=""><img src="../assets/image/sorch.svg" alt="">
      <img  src="../assets/image/card.svg" alt="">
    </div>
    <div class="bemor__add">
      Qo'shish
    </div>
   </div>
    <div class="cards">
      <div v-for="patient in 40" :key="patient.id" class="card">
       
        <div class="card__header"> <h3>Sherg'oziyev Xurshid</h3> <span>20 yosh|erkak</span> </div>
        <p><strong>Telefon:</strong> +998931230000</p>
        <p><strong>Keldi:</strong> 2025-06-01</p>
        <p><strong>Ketdi:</strong> 2025-06-05</p>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/bemorlar.css"
export default {
  data() {
    return {
      patients: []
    }
  },
  mounted() {
    // Bu yerda real API chaqiruv qilinadi, hozir mock data bilan ishlaymiz
    this.patients = [
      { id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567', arrivalDate: '2025-06-01', departureDate: '2025-06-10' },
      { id: 2, firstName: 'Gulbahor', lastName: 'Toshpulatova', phone: '+998909876543', arrivalDate: '2025-06-05', departureDate: '2025-06-15' },
      { id: 3, firstName: 'Oybek', lastName: 'Karimov', phone: '+998912345678', arrivalDate: '2025-06-07', departureDate: '2025-06-12' },
      { id: 4, firstName: 'Nilufar', lastName: 'Rahimova', phone: '+998901122334', arrivalDate: '2025-06-03', departureDate: '2025-06-09' },
      { id: 5, firstName: 'Davron', lastName: 'Sobirov', phone: '+998933445566', arrivalDate: '2025-06-02', departureDate: '2025-06-08' },
      { id: 6, firstName: 'Saida', lastName: 'Jumanazarova', phone: '+998978654321', arrivalDate: '2025-06-04', departureDate: '2025-06-14' },
      // Xohlagancha qo'shishing mumkin
    ]
  },
  methods: {
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateStr).toLocaleDateString('uz-UZ', options)
    }
  }
}
</script>

<style scoped>

</style>
