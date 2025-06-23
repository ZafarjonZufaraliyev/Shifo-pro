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
.taklif-container {
  max-width: 1200px; /* max-width o'zgartirildi */
  margin: 40px auto;
  padding: 30px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 25px;
  color: #154a7d;
}

.user-info p {
  font-size: 16px;
  margin: 6px 0;
}

.date-row {
  display: flex;
  gap: 24px;
  margin-bottom: 30px;
}

.date-row .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.room-booking-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.room-booking {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.room-booking select {
  padding: 10px 15px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.room-booking select:focus {
  border-color: #1a6291;
  outline: none;
  box-shadow: 0 0 8px rgba(26, 98, 145, 0.3);
}

.total-sum {
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
  min-width: 180px;
  text-align: right;
  color: #1a6291;
}

.services-section {
  margin-bottom: 30px;
}

.services-section h3 {
  font-weight: 700;
  font-size: 22px;
  color: #154a7d;
  margin-bottom: 15px;
  border-bottom: 2px solid #1a6291;
  padding-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-services-btn {
  background-color: #1a6291;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 4px 12px;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.toggle-services-btn:hover {
  background-color: #124766;
}

.offers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px 30px;
  margin-top: 15px;
}

.offer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.offer-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #1a6291;
}

.offer-item:hover {
  box-shadow: 0 4px 12px rgba(26, 98, 145, 0.3);
  border-color: #1a6291;
}

.history-section,
.results-section {
  background: #f4f7f9;
  padding: 20px 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  font-size: 16px;
  color: #555;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.03);
}

.history-section h3,
.results-section h3 {
  margin-top: 0;
  font-weight: 700;
  color: #154a7d;
  border-bottom: 2px solid #1a6291;
  padding-bottom: 6px;
  margin-bottom: 15px;
}

.submit-btn {
  display: block;
  background-color: #1a6291;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  margin: 0 auto;
  width: 220px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 15px rgba(26, 98, 145, 0.5);
}

.submit-btn:hover {
  background-color: #124766;
  box-shadow: 0 8px 22px rgba(18, 71, 102, 0.7);
}

/* Responsive */
@media (max-width: 600px) {
  .date-row, .room-booking-row {
    flex-direction: column;
  }
  .total-sum {
    text-align: left;
    min-width: auto;
    margin-top: 10px;
  }
  .offers {
    grid-template-columns: 1fr;
  }
  .submit-btn {
    width: 100%;
  }
}
</style>
