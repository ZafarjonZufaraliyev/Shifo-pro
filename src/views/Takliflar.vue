<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Ro'yxatdan olingan ma'lumotlar -->
    <div class="user-info">
      <p><strong>Familiya, Ism, Sharif:</strong> {{ fullName }}</p>
      <p><strong>Yoshi:</strong> {{ age }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
    </div>

    <!-- Kelgan sana va Ketgan sana bir qatorda -->
    <div class="date-row">
      <div class="form-group">
        <label>Kelgan sana</label>
        <input type="date" v-model="arrivalDate" />
      </div>
      <div class="form-group">
        <label>Ketgan sana</label>
        <input type="date" v-model="leaveDate" />
      </div>
    </div>

    <!-- Xona bron qilish va jami summa -->
    <div class="room-booking-row">
      <div class="form-group room-booking">
        <label>Xona bron qilish</label>
        <select v-model="selectedRoom">
          <option disabled value="">Xona tanlang</option>
          <option v-for="room in rooms" :key="room.id" :value="room">
            {{ room.name }} — {{ room.price }} so'm
          </option>
        </select>
      </div>
      <div class="total-sum">
        Jami summa: <strong>{{ totalSum }} so'm</strong>
      </div>
    </div>

    <!-- Xizmatlar, faqat tugmani bosganda ko'rinadi -->
    <div class="services-section">
      <h3>
        Xizmatlar
        <button class="toggle-services-btn" @click="toggleServices">
          {{ showServices ? "Yashirish" : "Ko'rsatish" }}
        </button>
      </h3>

      <div v-if="showServices" class="offers">
        <div v-for="(service, index) in services" :key="index" class="offer-item">
          <input type="checkbox" v-model="service.selected" />
          <span>{{ service.name }} — {{ service.price }} so'm</span>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h3>Tarix</h3>
      <p>Bu yerda xizmatlar tarixi ko‘rsatiladi (keyin ishlanadi)</p>
    </div>

    <div class="results-section">
      <h3>Natijalar</h3>
      <p>Bu yerda natijalar bo‘limi bo‘ladi (keyin ishlanadi)</p>
    </div>

    <!-- Yuborish tugmasi -->
    <button class="submit-btn" @click="submitBooking">Bron qilish</button>
  </div>
</template>

<script>
import "@/assets/css/taklif.css"
export default {
  name: "TaklifPage",
  data() {
    return {
      fullName: "",
      birthYear: null, // tug‘ilgan yil
      age: null,
      gender: "",
      arrivalDate: "",
      leaveDate: "",
      selectedRoom: null,
      showServices: false,
      rooms: [
        { id: 1, name: "1-xona", price: 100000 },
        { id: 2, name: "2-xona", price: 150000 },
        { id: 3, name: "VIP xona", price: 250000 }
      ],
      services: [
        { name: "Massaj", price: 50000, selected: false },
        { name: "Fizioterapiya", price: 60000, selected: false },
        { name: "Dori muolajasi", price: 45000, selected: false },
        { name: "Psixolog bilan suhbat", price: 40000, selected: false },
        { name: "Vitamin terapiyasi", price: 55000, selected: false }
      ]
    };
  },
  computed: {
    totalSum() {
      let servicesSum = this.services
        .filter(s => s.selected)
        .reduce((sum, s) => sum + s.price, 0);
      let roomPrice = this.selectedRoom ? this.selectedRoom.price : 0;
      return servicesSum + roomPrice;
    }
  },
  mounted() {
    // LocalStorage dan ro'yxatdan olingan ma'lumotlarni olish (agar bor bo'lsa)
    const storedForm = JSON.parse(localStorage.getItem("ro_yxat_form"));
    if (storedForm) {
      this.fullName = `${storedForm.familya} ${storedForm.ism} ${storedForm.otasi}`;
      this.birthYear = storedForm.tugilganYil || null; // tug‘ilgan yilni saqlang ro'yxatdan o‘tishda
      this.gender = storedForm.jins || "";

      // Yoshni hisoblash - hozirgi yil - tug‘ilgan yil
      if (this.birthYear) {
        const currentYear = new Date().getFullYear();
        this.age = currentYear - this.birthYear;
      }
    }
  },
  methods: {
    submitBooking() {
      if (!this.arrivalDate || !this.leaveDate || !this.selectedRoom) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }

      const bookingData = {
        fullName: this.fullName,
        age: this.age,
        gender: this.gender,
        arrivalDate: this.arrivalDate,
        leaveDate: this.leaveDate,
        room: this.selectedRoom,
        services: this.services.filter(s => s.selected),
        totalSum: this.totalSum
      };

      console.log("Bron qilish uchun ma'lumot:", bookingData);
      alert("Xona muvaffaqiyatli bron qilindi!");
    },
    toggleServices() {
      this.showServices = !this.showServices;
    }
  }
};
</script>

<style scoped>

</style>
