<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- User info -->
    <div class="user-info" v-if="isUserRegistered && userName">
      <p><strong>F.I.Sh:</strong> {{ fullName }}</p>
      <p><strong>Yoshi:</strong> {{ age }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
      <p><strong>Ro'yxatdan o'tgan foydalanuvchi:</strong> {{ userName }}</p>
    </div>

    <div v-else class="user-info">
      <p><strong>F.I.Sh:</strong> {{ fullName || "Ma'lumot yo'q" }}</p>
      <p><strong>Yoshi:</strong> {{ age || "Ma'lumot yo'q" }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
      <p style="color: #d9534f; font-weight: bold;">Foydalanuvchi ro'yxatdan o'tmagan</p>
    </div>

    <!-- Filterlar (Xona qidirish) -->
    <div class="filter-row">
      <input type="text" v-model="roomFilterNumber" placeholder="Xona raqami (masalan: 205)" />
      <input type="text" v-model="roomFilterName" placeholder="Xona turi (masalan: LUX)" />
      <input type="number" v-model.number="roomFilterSigim" placeholder="Sig'imi (masalan: 2)" />
      <button @click="clearFilters" class="clear-filter-btn">Filtrlarni tozalash</button>
    </div>

    <!-- Xonalar ro'yxati (jadval) -->
    <div v-if="!selectedRoom" class="room-list">
      <h3>Mavjud xonalar:</h3>
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Xona turi</th>
            <th>Xona raqami</th>
            <th>Sig'imi</th>
            <th>Narxi (so'm)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="room in filteredRooms"
            :key="room.id"
            @click="selectRoom(room)"
            class="room-row"
          >
            <td>{{ room.room_type }}</td>
            <td>{{ room.xona }}</td>
            <td>{{ room.sigim }}</td>
            <td>{{ room.price.toLocaleString('ru-RU') }}</td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td colspan="4" class="no-rooms">Xonalar topilmadi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tanlangan xona -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>Tanlangan xona</h3>
      <p>{{ selectedRoom.display }}</p>

      <p>
        Narxi:
        <span
          v-if="isUserRegistered && priceEditClickCount.room >= 5"
          class="editable-price"
        >
          <input
            type="number"
            v-model.number="selectedRoom.price"
            @input="savePriceChange('room')"
          />
          so'm
        </span>
        <span
          v-else-if="isUserRegistered"
          @click="incrementPriceClick('room')"
          class="clickable-price"
          title="Narxni o'zgartirish uchun ustiga 5 marta bosing"
          >{{ selectedRoom.price.toLocaleString('ru-RU') }} so'm</span
        >
        <span v-else>{{ selectedRoom.price.toLocaleString('ru-RU') }} so'm</span>
      </p>

      <button @click="cancelSelection" class="cancel-btn">❌ Bekor qilish</button>

      <!-- Majburiy xizmatlar -->
      <div class="services-section" v-if="mandatoryServices.length">
        <h3>Majburiy xizmatlar</h3>
        <div
          v-for="(service, i) in mandatoryServices"
          :key="'mandatory-'+i"
          class="service-item"
        >
          <input type="checkbox" v-model="service.selected" disabled />
          {{ service.name }} —
          <span
            v-if="isUserRegistered && priceEditClickCount['mandatory-'+i] >= 5"
            class="editable-price"
          >
            <input
              type="number"
              v-model.number="service.price"
              @input="savePriceChange('mandatory-'+i)"
            />
            so'm
          </span>
          <span
            v-else-if="isUserRegistered"
            @click="incrementPriceClick('mandatory-'+i)"
            class="clickable-price"
            title="Narxni o'zgartirish uchun ustiga 5 marta bosing"
          >
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
          <span v-else>{{ service.price.toLocaleString('ru-RU') }} so'm</span>
        </div>
      </div>

      <!-- Qo'shimcha xizmatlar -->
      <div class="services-section">
        <h3>Qo'shimcha xizmatlar</h3>
        <div
          v-for="(service, i) in additionalServices"
          :key="'additional-'+i"
          class="service-item"
        >
          <input type="checkbox" v-model="service.selected" />
          {{ service.name }} —
          <span
            v-if="isUserRegistered && priceEditClickCount['additional-'+i] >= 5"
            class="editable-price"
          >
            <input
              type="number"
              v-model.number="service.price"
              @input="savePriceChange('additional-'+i)"
            />
            so'm
          </span>
          <span
            v-else-if="isUserRegistered"
            @click="incrementPriceClick('additional-'+i)"
            class="clickable-price"
            title="Narxni o'zgartirish uchun ustiga 5 marta bosing"
          >
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
          <span v-else>{{ service.price.toLocaleString('ru-RU') }} so'm</span>
        </div>
      </div>
    </div>

    <!-- Kelish va ketish sanalari -->
    <div class="date-row">
      <div class="form-group">
        <label>Kelgan sana</label>
        <input
          type="date"
          :min="today"
          :readonly="!allowEditArrivalDate"
          :class="{ readonly: !allowEditArrivalDate }"
          v-model="arrivalDate"
          @change="calculateLeaveDate"
          @click="increaseClickCount"
        />
        <small v-if="!allowEditArrivalDate" style="color: #666;">
          (Bugungi kundan oldingi sanalarni tanlash mumkin emas)
        </small>
      </div>
      <div class="form-group">
        <label>Necha kun?</label>
        <input type="number" v-model.number="stayDays" min="1" @input="calculateLeaveDate" />
      </div>
      <div class="form-group">
        <label>Ketgan sana</label>
        <input type="date" :value="leaveDate || '0000-00-00'" readonly />
      </div>
    </div>

    <!-- Jami -->
    <div class="total-sum">
      Jami summa: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
    </div>

    <button class="submit-btn" @click="submitBooking">Bron qilish</button>
  </div>
</template>

<script>
import axios from "axios";

const STORAGE_KEY = "ro_yxat_form"; // foydalanuvchi ma'lumotlari
const PRICES_STORAGE_KEY = "user_custom_prices";

export default {
  name: "Takliflar",
  data() {
    const todayDate = new Date();
    const today = todayDate.toISOString().slice(0, 10);

    return {
      fullName: "",
      birthYear: null,
      age: null,
      gender: "",
      userName: "",

      today,
      arrivalDate: today,
      stayDays: 7,
      leaveDate: "",
      selectedRoom: null,
      rooms: [],
      mandatoryServices: [],
      additionalServices: [
        { name: "Massaj", price: 50000, selected: false },
        { name: "Fizioterapiya", price: 60000, selected: false },
        { name: "Vitamin terapiya", price: 55000, selected: false }
      ],
      roomFilterName: "",
      roomFilterNumber: "",
      roomFilterSigim: null,

      priceEditClickCount: {},

      allowEditPrice: false,
      allowEditArrivalDate: false
    };
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(r => {
        const byName = this.roomFilterName
          ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase())
          : true;
        const byNumber = this.roomFilterNumber ? r.xona.includes(this.roomFilterNumber) : true;
        const bySigim = this.roomFilterSigim
          ? String(r.sigim) === String(this.roomFilterSigim)
          : true;
        return byName && byNumber && bySigim;
      });
    },
    totalSum() {
      const roomPrice = this.selectedRoom ? this.selectedRoom.price : 0;
      const mandatory = this.mandatoryServices.reduce(
        (sum, s) => sum + (s.selected ? s.price : 0),
        0
      );
      const additional = this.additionalServices.reduce(
        (sum, s) => sum + (s.selected ? s.price : 0),
        0
      );
      return roomPrice + mandatory + additional;
    },
    isUserRegistered() {
      return !!localStorage.getItem(STORAGE_KEY);
    }
  },
  methods: {
    formatDate(date) {
      return date.toISOString().slice(0, 10);
    },
    calculateLeaveDate() {
      if (!this.arrivalDate || !this.stayDays) return;
      const start = new Date(this.arrivalDate);
      start.setDate(start.getDate() + this.stayDays);
      this.leaveDate = this.formatDate(start);
    },
    handleRoomChange() {
      if (this.selectedRoom) {
        this.mandatoryServices = [
          { name: "Dori muolajasi", price: 45000, selected: true },
          { name: "Psixolog", price: 40000, selected: true }
        ];

        this.loadCustomPrices();
      } else {
        this.mandatoryServices = [];
      }
    },
    selectRoom(room) {
      this.selectedRoom = { ...room };
      this.priceEditClickCount = {};
      this.allowEditPrice = false;
      this.allowEditArrivalDate = false;
      this.handleRoomChange();
    },
    incrementPriceClick(key) {
      if (!this.priceEditClickCount[key]) this.$set(this.priceEditClickCount, key, 0);
      this.priceEditClickCount[key]++;
    },
    savePriceChange(key) {
      if (!this.isUserRegistered) return;

      let storedPrices = JSON.parse(localStorage.getItem(PRICES_STORAGE_KEY) || "{}");

      if (key === "room") {
        storedPrices.room = this.selectedRoom.price;
      } else if (key.startsWith("mandatory-")) {
        const index = parseInt(key.split("-")[1], 10);
        if (this.mandatoryServices[index]) {
          storedPrices[key] = this.mandatoryServices[index].price;
        }
      } else if (key.startsWith("additional-")) {
        const index = parseInt(key.split("-")[1], 10);
        if (this.additionalServices[index]) {
          storedPrices[key] = this.additionalServices[index].price;
        }
      }

      localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(storedPrices));
    },
    loadCustomPrices() {
      const storedPrices = JSON.parse(localStorage.getItem(PRICES_STORAGE_KEY) || "{}");

      if (storedPrices.room !== undefined && this.selectedRoom) {
        this.selectedRoom.price = storedPrices.room;
      }

      this.mandatoryServices.forEach((service, i) => {
        const key = "mandatory-" + i;
        if (storedPrices[key] !== undefined) {
          service.price = storedPrices[key];
        }
      });

      this.additionalServices.forEach((service, i) => {
        const key = "additional-" + i;
        if (storedPrices[key] !== undefined) {
          service.price = storedPrices[key];
        }
      });
    },
    cancelSelection() {
      this.selectedRoom = null;
      this.mandatoryServices = [];
      this.priceEditClickCount = {};
      this.allowEditPrice = false;
      this.allowEditArrivalDate = false;
    },
    clearFilters() {
      this.roomFilterName = "";
      this.roomFilterNumber = "";
      this.roomFilterSigim = null;
    },
    async loadRooms() {
      try {
        const { data } = await axios.get("https://shifo-pro.uz/api/v1/room");
        this.rooms = data.map(item => ({
          id: item.id,
          xona: item.xona,
          sigim: item.sigim || item.capacity || 1,
          room_type: item.room_type.name,
          display: `${item.room_type.name} (xona №${item.xona}, sig'imi ${item.sigim || item.capacity || 1})`,
          price: parseFloat(item.room_type.Narxi || 0)
        }));
      } catch (err) {
        console.error("Xonalar yuklash xatosi:", err);
      }
    },
    submitBooking() {
      if (!this.arrivalDate || !this.stayDays || !this.selectedRoom) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }
      // User data from localStorage
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const username = userData ? userData.username : "Noma'lum";

      const booking = {
        fullName: this.fullName,
        age: this.age,
        gender: this.gender,
        arrivalDate: this.arrivalDate,
        leaveDate: this.leaveDate,
        room: this.selectedRoom,
        mandatoryServices: this.mandatoryServices,
        additionalServices: this.additionalServices.filter(s => s.selected),
        totalSum: this.totalSum,
        registeredBy: username // bu yerda xodim username qo'shildi
      };

      // Router bilan keyingi sahifaga booking obyekti jo'natiladi
      this.$router.push({
        name: "TaklifDetelis",
        query: { data: encodeURIComponent(JSON.stringify(booking)) }
      });
    },
    increaseClickCount() {
      this.allowEditArrivalDate = true;
    }
  },
  async mounted() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (userData) {
      this.fullName = `${userData.familiya} ${userData.ism} ${userData.sharif}`;
      this.birthYear = userData.tugulgan_sana.slice(0, 4);
      this.gender = userData.jins || "";
      this.age = new Date().getFullYear() - this.birthYear;
      this.userName = userData.username || "";
    }
    this.calculateLeaveDate();
    await this.loadRooms();
  }
};
</script>

<style scoped>
/* Styling your component */
.taklif-container {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", sans-serif;
}
.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}
.clear-filter-btn {
  background-color: #ccc;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.clear-filter-btn:hover {
  background-color: #aaa;
}
.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.rooms-table th,
.rooms-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.rooms-table th {
  background-color: #f0f8ff;
  font-weight: 600;
}
.room-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.room-row:hover {
  background-color: #e6f2ff;
}
.no-rooms {
  text-align: center;
  color: #666;
  padding: 10px 0;
}
.selected-room {
  background: #f1fff1;
  padding: 10px;
  border: 1px solid #8bc34a;
  border-radius: 6px;
  margin-bottom: 15px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
.submit-btn {
  background: #3cb371;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}
.submit-btn:hover {
  background: #32a165;
}
input[type="number"] {
  width: 100px;
  margin-left: 8px;
}
input.readonly {
  background-color: #eee;
  cursor: not-allowed;
}
.services-section h3 {
  margin-bottom: 10px;
}
.service-item {
  margin-bottom: 8px;
  user-select: none;
}
.cancel-btn {
  background: #ff5c5c;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background-color 0.2s;
}
.cancel-btn:hover {
  background: #d64545;
}
.clickable-price {
  cursor: pointer;
  user-select: none;
  color: #007bff;
}
.clickable-price:hover {
  text-decoration: underline;
}
.editable-price input {
  width: 100px;
}
.date-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
}
</style>
