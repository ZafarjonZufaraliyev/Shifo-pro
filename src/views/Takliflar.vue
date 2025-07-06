<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Foydalanuvchi haqida ma'lumot -->
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
          <tr
            v-for="room in filteredRooms"
            :key="room.id"
            :class="['room-row', { busy: room.busy }]"
            :title="room.busy ? 'Bu xona band' : 'Tanlash uchun bosing'"
            @click="!room.busy && selectRoom(room)"
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

    <!-- Majburiy xizmatlar -->
    <div v-if="mandatoryServices.length && selectedRoom" class="services-section">
      <h3>Majburiy xizmatlar</h3>
      <div v-for="(service, i) in mandatoryServices" :key="'mandatory-' + i" class="service-item">
        <input type="checkbox" v-model="service.selected" disabled />
        {{ service.name }} — {{ service.price.toLocaleString('ru-RU') }} so'm
      </div>
    </div>

    <!-- Qo‘shimcha xizmatlar -->
    <div v-if="selectedRoom" class="services-section">
      <h3>Qo‘shimcha xizmatlar</h3>
      <div v-for="(service, i) in additionalServices" :key="'additional-' + i" class="service-item">
        <input type="checkbox" v-model="service.selected" />
        {{ service.name }} — {{ service.price.toLocaleString('ru-RU') }} so'm
      </div>
    </div>

    <!-- Tanlangan xona tafsilotlari -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>Tanlangan xona</h3>
      <p>{{ selectedRoom.display }}</p>
      <p>Narxi: {{ selectedRoom.price.toLocaleString('ru-RU') }} so'm</p>

      <!-- Kelish sanasi va ketish sanasi -->
      <div class="date-row">
        <div class="form-group">
          <label>Kelgan sana</label>
          <input type="date" :min="today" v-model="arrivalDate" @change="calculateLeaveDate" />
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

      <!-- Jami summa -->
      <div class="total-sum">
        Jami summa: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong>
      </div>

      <!-- Tugmalar -->
      <button class="submit-btn" @click="submitBooking">📥 Bron qilish</button>
      <button class="cancel-btn" @click="cancelSelection">❌ Bekor qilish</button>
    </div>
  </div>
</template>

<script>
import api from "@/api";

const STORAGE_KEY = "ro_yxat_form";

export default {
  name: "Takliflar",
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today,
      fullName: "",
      birthYear: null,
      age: null,
      gender: "",
      userName: "",
      selectedRoom: null,
      rooms: [], // ← DIQQAT: bu nom `filteredRooms` bilan mos
      roomFilterName: "",
      roomFilterNumber: "",
      roomFilterSigim: null,
      arrivalDate: today,
      stayDays: 7,
      leaveDate: "",
      mandatoryServices: [],
      additionalServices: [],
    };
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter((r) => {
        const byName = this.roomFilterName
          ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase())
          : true;
        const byNumber = this.roomFilterNumber
          ? r.xona.toLowerCase().includes(this.roomFilterNumber.toLowerCase())
          : true;
        const bySigim = this.roomFilterSigim
          ? String(r.sigim) === String(this.roomFilterSigim)
          : true;
        return byName && byNumber && bySigim;
      });
    },
    totalSum() {
      if (!this.selectedRoom) return 0;
      const roomSum = this.selectedRoom.price * this.stayDays;
      const mandatorySum = this.mandatoryServices.reduce((sum, s) => sum + s.price, 0);
      const additionalSum = this.additionalServices.reduce(
        (sum, s) => (s.selected ? sum + s.price : sum),
        0
      );
      return roomSum + mandatorySum + additionalSum;
    },
  },
  methods: {
    clearFilters() {
      this.roomFilterName = "";
      this.roomFilterNumber = "";
      this.roomFilterSigim = null;
    },
    selectRoom(room) {
      this.selectedRoom = { ...room };
      this.arrivalDate = this.today;
      this.stayDays = 7;
      this.calculateLeaveDate();
      this.loadServices();
    },
    cancelSelection() {
      this.selectedRoom = null;
      this.arrivalDate = this.today;
      this.stayDays = 7;
      this.leaveDate = "";
      this.mandatoryServices = [];
      this.additionalServices = [];
    },
    calculateLeaveDate() {
      if (!this.arrivalDate || !this.stayDays) {
        this.leaveDate = "";
        return;
      }
      const start = new Date(this.arrivalDate);
      start.setDate(start.getDate() + this.stayDays);
      this.leaveDate = start.toISOString().slice(0, 10);
    },
    async loadRooms() {
      try {
        const today = new Date().toISOString().slice(0, 10);

        const [roomRes, davolanishRes, bronsRes] = await Promise.all([
          api.get("/api/v1/room"),
          api.get("/api/v1/davolanish"),
          api.get("/api/v1/bron"),
        ]);

        const busyFromDavolanish = davolanishRes.data.map((item) => Number(item.xona_id));
        const busyFromBrons = bronsRes.data
          .filter((item) => item.status === "faol" && item.end >= today)
          .map((item) => Number(item.xona_id));

        const allBusyRoomIds = [...new Set([...busyFromDavolanish, ...busyFromBrons])];

        this.rooms = roomRes.data.map((item) => {
          const sigim = item.sigim || item.capacity || 1;
          const type = item.room_type?.name || "Nomaʼlum";
          return {
            id: item.id,
            xona: item.xona,
            sigim,
            room_type: type,
            display: `${type} (xona №${item.xona}, sig'imi ${sigim})`,
            price: parseFloat(item.room_type?.Narxi || 0),
            busy: allBusyRoomIds.includes(Number(item.id)),
          };
        });
      } catch (err) {
        console.error("Xonalarni yuklashda xatolik:", err.response?.data || err.message);
      }
    },
    async loadServices() {
      try {
        const res = await api.get("/api/v1/services");
        this.mandatoryServices = res.data
          .filter((s) => s.required)
          .map((s) => ({ ...s, selected: true, price: parseFloat(s.price) }));
        this.additionalServices = res.data
          .filter((s) => !s.required)
          .map((s) => ({ ...s, selected: false, price: parseFloat(s.price) }));
      } catch (err) {
        console.error("Xizmatlarni yuklashda xatolik:", err.response?.data || err.message);
      }
    },
    async submitBooking() {
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!userData) return alert("Foydalanuvchi aniqlanmadi!");
      if (!this.selectedRoom) return alert("Iltimos, xona tanlang!");
      if (!this.arrivalDate || !this.leaveDate) return alert("Sanalar to‘liq emas!");

      const serviceIds = [
        ...this.mandatoryServices.map((s) => s.id),
        ...this.additionalServices.filter((s) => s.selected).map((s) => s.id),
      ];

      const now = new Date().toISOString();

      const booking = {
        client_id: userData.id,
        xona_id: this.selectedRoom.id,
        start: this.arrivalDate,
        end: this.leaveDate,
        xizmatlar: serviceIds,
        create_user_id: userData.id,
        create_user_name: userData.username,
        created_at: now,
        updated_at: now,
      };

      try {
        await api.post("/api/v1/davolanish", booking);
        alert("Bron muvaffaqiyatli qilindi!");
        this.cancelSelection();
        await this.loadRooms();
      } catch (err) {
        console.error("Bron qilishda xatolik:", err.response?.data || err.message);
        alert("Bron qilishda xatolik yuz berdi.");
      }
    },
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (user) {
      this.fullName = `${user.familiya} ${user.ism} ${user.sharif || ""}`.trim();
      this.birthYear = user.tugulgan_sana?.slice(0, 4);
      this.gender = user.jins;
      this.age = this.birthYear ? new Date().getFullYear() - +this.birthYear : null;
      this.userName = user.username;
    }

    this.calculateLeaveDate();
    await this.loadRooms();
  },
};
</script>



<style scoped>
.taklif-container {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", sans-serif;
  color: #1f2937;
}

.title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  margin-bottom: 30px;
}

.user-info {
  background: #e0f2fe;
  border-left: 6px solid #3b82f6;
  padding: 16px 24px;
  margin-bottom: 30px;
  border-radius: 12px;
  font-size: 16px;
}

.warning {
  color: #dc2626;
  font-weight: bold;
  margin-top: 10px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-row input {
  flex: 1 1 200px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 15px;
}

.clear-filter-btn {
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filter-btn:hover {
  background: #1e40af;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.rooms-table th,
.rooms-table td {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  text-align: left;
  font-size: 15px;
}

.room-row {
  transition: background 0.2s ease;
  cursor: pointer;
}

.room-row:hover:not(.busy) {
  background: #eff6ff;
}

.room-row.busy {
  background: #ffe4e6 !important;
  color: #991b1b !important;
  border: 1px solid #f87171 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  font-style: italic;
}

.no-rooms {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 12px;
}

.selected-room {
  background: #f0fdf4;
  border-left: 6px solid #10b981;
  padding: 24px;
  border-radius: 16px;
  margin-top: 30px;
}

.date-row {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.form-group {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 15px;
}

.total-sum {
  font-size: 20px;
  font-weight: 700;
  text-align: right;
  margin-top: 10px;
  color: #1e40af;
}

.submit-btn {
  background: #22c55e;
  color: white;
  font-weight: 700;
  font-size: 16px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  margin-top: 20px;
  float: right;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #16a34a;
}

.cancel-btn {
  background: #f87171;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #dc2626;
}

.services-section {
  margin: 30px 0 20px 0;
  background: #eff6ff;
  padding: 16px 20px;
  border-radius: 12px;
}

.services-section h3 {
  margin-bottom: 12px;
  color: #1e40af;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  .date-row {
    flex-direction: column;
  }
  .submit-btn {
    width: 100%;
    float: none;
  }
}
</style>
