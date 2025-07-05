<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Foydalanuvchi haqida -->
    <div class="user-info" v-if="userName">
      <p><strong>F.I.Sh:</strong> {{ fullName }}</p>
      <p><strong>Yoshi:</strong> {{ age }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
      <p><strong>Ro'yxatdan o'tgan foydalanuvchi:</strong> {{ userName }}</p>
    </div>
    <div class="user-info" v-else>
      <p><strong>F.I.Sh:</strong> {{ fullName || "Ma'lumot yo'q" }}</p>
      <p><strong>Yoshi:</strong> {{ age || "Ma'lumot yo'q" }}</p>
      <p><strong>Jinsi:</strong> {{ gender || "Ko'rsatilmagan" }}</p>
      <p class="warning">Foydalanuvchi ro'yxatdan o'tmagan</p>
    </div>

    <!-- Filtrlar -->
    <div class="filter-row">
      <input v-model="roomFilterNumber" placeholder="Xona raqami (masalan: 205)" />
      <input v-model="roomFilterName" placeholder="Xona turi (masalan: LUX)" />
      <input type="number" v-model.number="roomFilterSigim" placeholder="Sig'imi (masalan: 2)" />
      <button class="clear-filter-btn" @click="clearFilters">Filtrlarni tozalash</button>
    </div>

    <!-- Xonalar jadvali -->
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
          <tr v-for="room in filteredRooms" :key="room.id" class="room-row" @click="selectRoom(room)">
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
        <span v-if="userName && (priceEditClickCount.room || 0) >= 5" class="editable-price">
          <input type="number" v-model.number="selectedRoom.price" @input="savePriceChange('room')" /> so'm
        </span>
        <span v-else-if="userName" @click="incrementPriceClick('room')" class="clickable-price"
          >
          {{ selectedRoom.price.toLocaleString('ru-RU') }} so'm
        </span>
        <span v-else>{{ selectedRoom.price.toLocaleString('ru-RU') }} so'm</span>
      </p>

      <button class="cancel-btn" @click="cancelSelection">❌ Bekor qilish</button>

      <div class="services-section" v-if="mandatoryServices.length">
        <h3>Majburiy xizmatlar</h3>
        <div v-for="(service, i) in mandatoryServices" :key="'mandatory-' + i" class="service-item">
          <input type="checkbox" v-model="service.selected" disabled />
          {{ service.name }} —
          <span v-if="userName && (priceEditClickCount['mandatory-' + i] || 0) >= 5" class="editable-price">
            <input type="number" v-model.number="service.price" @input="savePriceChange('mandatory-' + i)" /> so'm
          </span>
          <span v-else-if="userName" @click.stop="incrementPriceClick('mandatory-' + i)" class="clickable-price"
            title="5 marta bosganda narx o'zgarishi mumkin">
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
          <span v-else>
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
        </div>
      </div>

      <!-- Qo‘shimcha xizmatlar -->
      <div class="services-section">
        <h3>Qo‘shimcha xizmatlar</h3>
        <div v-for="(service, i) in additionalServices" :key="'additional-' + i" class="service-item">
          <input type="checkbox" v-model="service.selected" />
          {{ service.name }} —
          <span v-if="userName && (priceEditClickCount['additional-' + i] || 0) >= 5" class="editable-price">
            <input type="number" v-model.number="service.price" @input="savePriceChange('additional-' + i)" /> so'm
          </span>
          <span v-else-if="userName" @click.stop="incrementPriceClick('additional-' + i)" class="clickable-price"
            title="5 marta bosganda narx o'zgarishi mumkin">
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
          <span v-else>
            {{ service.price.toLocaleString('ru-RU') }} so'm
          </span>
        </div>
      </div>

      <!-- Kelish va ketish sanalari -->
      <div class="date-row">
        <div class="form-group">
          <label>Kelgan sana</label>
          <input type="date" :min="today" :readonly="!allowEditArrivalDate" :class="{ readonly: !allowEditArrivalDate }"
            v-model="arrivalDate" @change="calculateLeaveDate" @click="onArrivalDateClick" />
          <small v-if="!allowEditArrivalDate" style="color: #666;">
            (Tahrirlash uchun 5 marta ustiga bosing)
          </small>
        </div>
        <div class="form-group">
          <label>Necha kun?</label>
          <input type="number" v-model.number="stayDays" min="1" @input="calculateLeaveDate" />
        </div>
        <div class="form-group">
          <label>Ketgan sana</label>
          <input type="date" :value="leaveDate" readonly />
        </div>
      </div>

      <!-- Jami -->
      <div class="total-sum">
        Jami summa: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
      </div>

      <button class="submit-btn" @click="submitBooking">📥 Bron qilish</button>
    </div>
    </div>
</template>

<script>
import api from "@/api";

const STORAGE_KEY = "ro_yxat_form";
const PRICES_STORAGE_PREFIX = "user_custom_prices_";

export default {
  name: "Takliflar",
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today,
      arrivalDate: today,
      stayDays: 7,
      leaveDate: "",
      fullName: "",
      birthYear: null,
      age: null,
      gender: "",
      userName: "",
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
      allowEditArrivalDate: false,
      arrivalDateClickCounter: 0
    };
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(r => {
        const byName = this.roomFilterName
          ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase())
          : true;
        const byNumber = this.roomFilterNumber ? r.xona.includes(this.roomFilterNumber) : true;
        const bySigim = this.roomFilterSigim ? String(r.sigim) === String(this.roomFilterSigim) : true;
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
    currentUserKey() {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return user?.username || "guest";
    }
  },
  methods: {
     incrementPriceClick(key) {
    // Agar oldin mavjud bo'lmasa 0 qilib boshlaymiz, keyin +1 qilamiz
    this.$set(this.priceEditClickCount, key, (this.priceEditClickCount[key] || 0) + 1);
  },
  savePriceChange(key) {
    if (!this.userName) return;
    const storeKey = PRICES_STORAGE_PREFIX + this.currentUserKey;
    const prices = JSON.parse(localStorage.getItem(storeKey) || "{}");
    if (key === "room") {
      prices.room = this.selectedRoom.price;
    } else if (key.startsWith("mandatory-")) {
      prices[key] = this.mandatoryServices[+key.split("-")[1]].price;
    } else if (key.startsWith("additional-")) {
      prices[key] = this.additionalServices[+key.split("-")[1]].price;
    }
    localStorage.setItem(storeKey, JSON.stringify(prices));
  },
    calculateLeaveDate() {
      const start = new Date(this.arrivalDate);
      start.setDate(start.getDate() + this.stayDays);
      this.leaveDate = start.toISOString().slice(0, 10);
    },
    selectRoom(room) {
      if (room.busy) {
        alert("Bu xona band!");
        return;
      }
      this.selectedRoom = { ...room };
      this.mandatoryServices = [
        { name: "Dori muolajasi", price: 45000, selected: true },
        { name: "Psixolog", price: 40000, selected: true }
      ];
      this.priceEditClickCount = {};
      this.loadCustomPrices();
    },
    cancelSelection() {
      this.selectedRoom = null;
      this.mandatoryServices = [];
      this.allowEditArrivalDate = false;
      this.arrivalDateClickCounter = 0;
    },
    incrementPriceClick(key) {
      this.$set(this.priceEditClickCount, key, (this.priceEditClickCount[key] || 0) + 1);
    },
    savePriceChange(key) {
      if (!this.userName) return;
      const storeKey = PRICES_STORAGE_PREFIX + this.currentUserKey;
      const prices = JSON.parse(localStorage.getItem(storeKey) || "{}");
      if (key === "room") prices.room = this.selectedRoom.price;
      else if (key.startsWith("mandatory-"))
        prices[key] = this.mandatoryServices[+key.split("-")[1]].price;
      else if (key.startsWith("additional-"))
        prices[key] = this.additionalServices[+key.split("-")[1]].price;
      localStorage.setItem(storeKey, JSON.stringify(prices));
    },
    loadCustomPrices() {
      const storeKey = PRICES_STORAGE_PREFIX + this.currentUserKey;
      const prices = JSON.parse(localStorage.getItem(storeKey) || "{}");
      if (prices.room && this.selectedRoom) this.selectedRoom.price = prices.room;
      this.mandatoryServices.forEach((s, i) => {
        if (prices[`mandatory-${i}`]) s.price = prices[`mandatory-${i}`];
      });
      this.additionalServices.forEach((s, i) => {
        if (prices[`additional-${i}`]) s.price = prices[`additional-${i}`];
      });
    },
    clearFilters() {
      this.roomFilterName = "";
      this.roomFilterNumber = "";
      this.roomFilterSigim = null;
    },
    async loadRooms() {
      try {
        const [roomRes, davolanishRes] = await Promise.all([
          api.get("/api/v1/room"),
          api.get("/api/v1/davolanish")
        ]);
        const busyRoomIds = davolanishRes.data.map(item => item.xona_id);
        this.rooms = roomRes.data.map(item => ({
          id: item.id,
          xona: item.xona,
          sigim: item.sigim || item.capacity || 1,
          room_type: item.room_type.name,
          display: `${item.room_type.name} (xona №${item.xona}, sig'imi ${item.sigim || item.capacity || 1})`,
          price: parseFloat(item.room_type.Narxi || 0),
          busy: busyRoomIds.includes(item.id)
        }));
      } catch (e) {
        console.error("Xonalarni yuklashda xatolik:", e);
      }
    },
    onArrivalDateClick() {
      this.arrivalDateClickCounter++;
      if (this.arrivalDateClickCounter >= 5) {
        this.allowEditArrivalDate = true;
      }
    },
    async submitBooking() {
      if (!this.userName) {
        alert("Ro'yxatdan o'tmagan foydalanuvchi uchun bron qilish mumkin emas!");
        return;
      }
      if (!this.selectedRoom) {
        alert("Iltimos, xona tanlang!");
        return;
      }
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!userData) {
        alert("Foydalanuvchi ma'lumotlari topilmadi!");
        return;
      }
      const now = new Date().toISOString();
      const booking = {
        client_id: userData.id,
        kelish_sanasi: this.arrivalDate,
        ketish_sanasi: this.leaveDate,
        xona_id: this.selectedRoom.id,
        create_user_id: userData.id,
        create_user_name: userData.username,
        created_at: now,
        updated_at: now
      };
      try {
        await api.post("/api/v1/davolanish", booking);
        this.$router.push({
          name: "TaklifDetelis",
          query: {
            data: encodeURIComponent(
              JSON.stringify({
                fullName: this.fullName,
                age: this.age,
                gender: this.gender,
                arrivalDate: this.arrivalDate,
                leaveDate: this.leaveDate,
                room: this.selectedRoom,
                mandatoryServices: this.mandatoryServices,
                additionalServices: this.additionalServices.filter(s => s.selected),
                totalSum: this.totalSum,
                registeredBy: userData.username
              })
            )
          }
        });
      } catch (e) {
        alert("Bron qilishda xatolik yuz berdi.");
        console.error(e);
      }
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (user) {
      this.fullName = `${user.familiya} ${user.ism} ${user.sharif}`;
      this.birthYear = user.tugulgan_sana?.slice(0, 4);
      this.gender = user.jins;
      this.age = this.birthYear ? new Date().getFullYear() - parseInt(this.birthYear) : null;
      this.userName = user.username;
    }
    this.calculateLeaveDate();
    await this.loadRooms();
  }
};
</script>

<style scoped>
.taklif-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  background: #f9f9fb;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", sans-serif;
  color: #333;
}

.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 25px;
  text-align: center;
  color: #1f2937;
}

.user-info {
  background: #e0f2fe;
  border-left: 6px solid #3b82f6;
  padding: 16px 20px;
  margin-bottom: 25px;
  border-radius: 10px;
  font-size: 16px;
}

.warning {
  color: red;
  font-weight: bold;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-row input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.clear-filter-btn {
  padding: 10px 15px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.clear-filter-btn:hover {
  background: #2563eb;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.rooms-table th,
.rooms-table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.room-row:hover {
  background-color: #e0f7fa;
  cursor: pointer;
}

.no-rooms {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 10px;
}

.selected-room {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.services-section {
  margin-top: 25px;
  padding: 15px;
  background-color: #eef6ff;
  border-radius: 10px;
  border: 1px solid #b6d0ff;
}

.service-item {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.clickable-price {
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.editable-price input {
  width: 120px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.cancel-btn {
  background: #ef4444;
  color: white;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
}

.cancel-btn:hover {
  background: #dc2626;
}

.date-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form-group input.readonly {
  background: #f3f4f6;
  cursor: not-allowed;
}

.total-sum {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: right;
}

.submit-btn {
  background: #2563eb;
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: block;
  margin-left: auto;
}

.submit-btn:hover {
  background: #1e40af;
}
</style>
