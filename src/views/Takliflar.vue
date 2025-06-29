<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- F.I.Sh, Yoshi, Jinsi -->
    <div class="user-info">
      <p><strong>F.I.Sh:</strong> {{ fullName }}</p>
      <p><strong>Yoshi:</strong> {{ age }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
    </div>

    <!-- Kelgan va ketgan sana -->
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

    <!-- Xona tanlash -->
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

    <!-- Xizmatlar -->
    <div class="services-section">
      <h3>
        Xizmatlar
        <button @click="toggleServices">{{ showServices ? "Yashirish" : "Ko'rsatish" }}</button>
      </h3>
      <div v-if="showServices">
        <div v-for="(service, i) in services" :key="i">
          <input type="checkbox" v-model="service.selected" />
          {{ service.name }} — {{ service.price }} so'm
        </div>
      </div>
    </div>


    <button class="submit-btn" @click="submitBooking">Bron qilish</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fullName: "",
      birthYear: null,
      age: null,
      gender: "",
      arrivalDate: "",
      leaveDate: "",
      selectedRoom: null,
      showServices: false,
      showHistory: false,
      showResults: false,
      rooms: [
        { id: 1, name: "1-xona", price: 100000 },
        { id: 2, name: "2-xona", price: 150000 },
        { id: 3, name: "VIP xona", price: 250000 }
      ],
      services: [
        { name: "Massaj", price: 50000, selected: false },
        { name: "Fizioterapiya", price: 60000, selected: false },
        { name: "Dori muolajasi", price: 45000, selected: false },
        { name: "Psixolog", price: 40000, selected: false },
        { name: "Vitamin terapiya", price: 55000, selected: false }
      ]
    };
  },
  computed: {
    totalSum() {
      let roomPrice = this.selectedRoom ? this.selectedRoom.price : 0;
      let serviceTotal = this.services.filter(s => s.selected).reduce((a, b) => a + b.price, 0);
      return roomPrice + serviceTotal;
    }
  },
  mounted() {
    const form = JSON.parse(localStorage.getItem("ro_yxat_form"));
    if (form) {
      this.fullName = `${form.familya} ${form.ism} ${form.otasi}`;
      this.birthYear = form.tugilganYil;
      this.gender = form.jins;
      this.age = new Date().getFullYear() - this.birthYear;
    }
  },
  methods: {
    toggleServices() {
      this.showServices = !this.showServices;
    },
    submitBooking() {
      if (!this.arrivalDate || !this.leaveDate || !this.selectedRoom) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }
      const booking = {
        fullName: this.fullName,
        age: this.age,
        gender: this.gender,
        arrivalDate: this.arrivalDate,
        leaveDate: this.leaveDate,
        room: this.selectedRoom,
        services: this.services.filter(s => s.selected),
        totalSum: this.totalSum
      };
      this.$router.push({
        name: "TaklifDetelis",
        query: { data: encodeURIComponent(JSON.stringify(booking)) }
      });
    }
  }
};
</script>

<style scoped>
.taklif-container {
  max-width: 1200px;
  padding: 20px;
  margin: 20px ;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
  color: #1f2937;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #0f172a;
}

.user-info p {
  font-size: 16px;
  margin-bottom: 6px;
}

.date-row,
.room-booking-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 25px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #334155;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  font-size: 15px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: border 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3b82f6;
  background-color: #eef6ff;
  outline: none;
}

.total-sum {
  font-size: 17px;
  font-weight: bold;
  color: #047857;
  align-self: center;
}

.services-section {
  margin-top: 30px;
}

.services-section h3 {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.services-section button {
  background-color: transparent;
  border: none;
  font-size: 14px;
  color: #3b82f6;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 8px;
}

.services-section div {
  margin-top: 10px;
}

.services-section input[type="checkbox"] {
  margin-right: 8px;
}

.section-box {
  margin-top: 40px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
}

.section-header {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.section-header span {
  font-size: 24px;
  color: #64748b;
}

.section-body {
  padding-top: 10px;
  color: #334155;
  font-size: 16px;
  line-height: 1.6;
}

.section-body ul {
  list-style-type: "🔸 ";
  padding-left: 24px;
}

.section-body li {
  margin-bottom: 8px;
}

.submit-btn {
  margin-top: 30px;
  background-color: #10b981;
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: block;
  margin-left: auto;
}

.submit-btn:hover {
  background-color: #059669;
}

@media (max-width: 768px) {
  .date-row,
  .room-booking-row {
    flex-direction: column;
  }

  .form-group {
    width: 100%;
  }

  .total-sum {
    text-align: left;
    margin-top: 10px;
  }

  .submit-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
