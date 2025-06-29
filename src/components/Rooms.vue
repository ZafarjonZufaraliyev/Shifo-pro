<template>
  <div class="calendar-container">
    <!-- Filtrlar -->
    <div class="filters">
      <label>📅 Sana oralig'i:</label>
      <input type="date" v-model="startInput" />
      <span>–</span>
      <input type="date" v-model="endInput" />

      <label>🏨 Xona:</label>
      <input type="text" v-model="roomFilter" placeholder="Masalan: Pol LUX" />

      <button @click="applyFilters">Filterlash</button>
    </div>

    <!-- Bron qilish modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Bron qilish</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.display }}</p>

        <label>Mehmon ismi:</label>
        <input v-model="guestName" placeholder="Mehmon ismini kiriting" />

        <label>📞 Telefon 1 (majburiy):</label>
        <input v-model="tel1" type="tel" placeholder="+998901234567" />

        <label>📞 Telefon 2 (ixtiyoriy):</label>
        <input v-model="tel2" type="tel" placeholder="+998901234568" />

        <label>🗓 Kelish sanasi:</label>
        <input type="date" v-model="arrivalDate" />

        <label>🗓 Ketish sanasi:</label>
        <input type="date" v-model="departureDate" />

        <div class="modal-buttons">
          <button @click="confirmBooking">Bron qilish</button>
          <button @click="closeModal" class="cancel-btn">Bekor qilish</button>
        </div>
      </div>
    </div>

    <!-- Bron tafsilot modal (tahrirlash va o'chirish imkoniyati bilan) -->
    <div v-if="showBookingDetail" class="modal-overlay" @click.self="closeBookingDetailModal">
      <div class="modal">
        <h3>Bron tafsilotlari</h3>
        <p><strong>Xona:</strong> {{ selectedBookingRoom?.display }}</p>

        <label>Mehmon ismi:</label>
        <input v-model="selectedBooking.client_name" placeholder="Mehmon ismini kiriting" />

        <label>📞 Telefon 1 (majburiy):</label>
        <input v-model="selectedBooking.tel1" type="tel" placeholder="+998901234567" />

        <label>📞 Telefon 2 (ixtiyoriy):</label>
        <input v-model="selectedBooking.tel2" type="tel" placeholder="+998901234568" />

        <label>🗓 Kelish sanasi:</label>
        <input type="date" v-model="editArrivalDate" />

        <label>🗓 Ketish sanasi:</label>
        <input type="date" v-model="editDepartureDate" />

        <div class="modal-buttons">
          <button @click="saveBookingChanges">Saqlash</button>
          <button @click="deleteBooking" class="delete-btn">O‘chirish</button>
          <button @click="closeBookingDetailModal" class="cancel-btn">Bekor qilish</button>
        </div>
      </div>
    </div>

    <!-- Jadval -->
    <div class="calendar-wrapper">
      <div class="calendar-scroll" v-if="filteredRooms.length">
        <table class="calendar">
          <thead>
            <tr>
              <th class="room-header">Xona</th>
              <th v-for="day in dateRange" :key="day.toISOString()">
                {{ formatFullDate(day) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in filteredRooms" :key="room.id">
              <td class="room-label">{{ room.display }}</td>
              <td
                v-for="day in dateRange"
                :key="day.toISOString()"
                :class="getCellClass(room, day)"
                :title="getBookingTitle(room, day)"
                @click="handleCellClick(room, day)"
              >
                <span v-if="getBooking(room, day)">Bronlangan</span>
                <span v-else class="clickable-cell"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Filtrga mos xona topilmadi.</p>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    const today = new Date();
    return {
      rooms: [],
      bookings: [],

      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
        .toISOString()
        .split("T")[0],
      startDate: today,
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      roomFilter: "",
      today,

      // Bron qilish uchun modal
      showModal: false,
      selectedRoom: null,
      selectedDate: null,
      guestName: "",
      tel1: "",
      tel2: "",
      arrivalDate: "",
      departureDate: "",

      // Bron tafsilotlari va tahrir uchun modal
      showBookingDetail: false,
      selectedBooking: null,
      selectedBookingRoom: null,
      editArrivalDate: "",
      editDepartureDate: "",
    };
  },

  computed: {
    dateRange() {
      const dates = [];
      let curr = new Date(this.startDate);
      while (curr <= this.endDate) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    },
    filteredRooms() {
      const term = this.roomFilter.trim().toLowerCase();
      if (!term) return this.rooms;
      return this.rooms.filter(room =>
        room.display.toLowerCase().includes(term)
      );
    },
  },

  methods: {
    applyFilters() {
      if (!this.startInput || !this.endInput) {
        alert("Iltimos, sanalarni to‘ldiring!");
        return;
      }
      const s = new Date(this.startInput);
      const e = new Date(this.endInput);
      if (e < s) {
        alert("Oxirgi sana boshlang‘ich sanadan kichik bo‘lishi mumkin emas!");
        return;
      }
      this.startDate = s;
      this.endDate = e;
    },

    formatFullDate(date) {
      return date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    },

    getBooking(room, date) {
      return this.bookings.find(b => {
        if (String(b.xona_id) !== String(room.id)) return false;
        const start = new Date(b.start);
        const end = new Date(b.end);
        return date >= start && date < end;
      });
    },

    getBookingTitle(room, date) {
      const b = this.getBooking(room, date);
      return b
        ? `Bron qilingan: ${b.client_name}\n${this.formatDate(b.start)} dan ${this.formatDate(b.end)} gacha\nTelefon: ${b.tel1}`
        : "";
    },

    getCellClass(room, date) {
      const b = this.getBooking(room, date);
      if (!b) return "";
      const d = new Date(date.toDateString());
      const td = new Date(this.today.toDateString());
      if (d.getTime() === td.getTime()) return "current";
      return d > td ? "booked-future" : "booked-past";
    },

    openBookingModal(room, date) {
      this.selectedRoom = room;
      this.selectedDate = date;
      this.guestName = "";
      this.tel1 = "";
      this.tel2 = "";
      this.arrivalDate = date.toISOString().split("T")[0];
      this.departureDate = "";
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async confirmBooking() {
      if (!this.guestName.trim() || !this.tel1.trim() || !this.arrivalDate || !this.departureDate) {
        alert("Barcha majburiy maydonlarni to‘ldiring!");
        return;
      }

      const start = new Date(this.arrivalDate);
      const end = new Date(this.departureDate);

      if (end <= start) {
        alert("Ketish sanasi kelish sanasidan keyin bo‘lishi kerak!");
        return;
      }

      // Sanalar kesishishini tekshirish
      const overlap = this.bookings.some(b => {
        if (String(b.xona_id) !== String(this.selectedRoom.id)) return false;
        const bs = new Date(b.start);
        const be = new Date(b.end);
        return start < be && end > bs;
      });

      if (overlap) {
        alert("Bu sana oralig‘ida xona band!");
        return;
      }

      try {
        const response = await api.post("/api/v1/bron", {
          xona_id: this.selectedRoom.id,
          client_name: this.guestName,
          tel1: this.tel1,
          tel2: this.tel2,
          start: this.arrivalDate,
          end: this.departureDate,
          status: "faol",
          create_user_id: 1,
          create_user_name: "admin"
        });

        this.bookings.push(response.data);
        alert("Bron muvaffaqiyatli saqlandi!");
        this.closeModal();
      } catch (error) {
        console.error("Bronni saqlashda xato:", error);
        alert("Serverda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      }
    },

    handleCellClick(room, date) {
      const b = this.getBooking(room, date);
      if (b) {
        this.selectedBooking = { ...b }; // Nusxasini olish (o‘zgartirish uchun)
        this.selectedBookingRoom = room;
        this.editArrivalDate = b.start.split("T")[0];
        this.editDepartureDate = b.end.split("T")[0];
        this.showBookingDetail = true;
      } else {
        this.openBookingModal(room, date);
      }
    },

    closeBookingDetailModal() {
      this.showBookingDetail = false;
      this.selectedBooking = null;
      this.selectedBookingRoom = null;
      this.editArrivalDate = "";
      this.editDepartureDate = "";
    },

    async saveBookingChanges() {
      if (
        !this.selectedBooking.client_name.trim() ||
        !this.selectedBooking.tel1.trim() ||
        !this.editArrivalDate ||
        !this.editDepartureDate
      ) {
        alert("Barcha majburiy maydonlarni to‘ldiring!");
        return;
      }

      const start = new Date(this.editArrivalDate);
      const end = new Date(this.editDepartureDate);
      if (end <= start) {
        alert("Ketish sanasi kelish sanasidan keyin bo‘lishi kerak!");
        return;
      }

      // Sanalar kesishishini tekshirish (boshqa bronlarga nisbatan)
      const overlap = this.bookings.some(b => {
        if (b.id === this.selectedBooking.id) return false; // O'z bronini hisoblamaymiz
        if (String(b.xona_id) !== String(this.selectedBookingRoom.id)) return false;
        const bs = new Date(b.start);
        const be = new Date(b.end);
        return start < be && end > bs;
      });
      if (overlap) {
        alert("Bu sana oralig‘ida xona band!");
        return;
      }

      try {
        // Backendga o'zgartirishlarni yuborish
        await api.put(`/api/v1/bron/${this.selectedBooking.id}`, {
          client_name: this.selectedBooking.client_name,
          tel1: this.selectedBooking.tel1,
          tel2: this.selectedBooking.tel2,
          start: this.editArrivalDate,
          end: this.editDepartureDate,
        });

        // Local ma'lumotlarni yangilash
        const idx = this.bookings.findIndex(b => b.id === this.selectedBooking.id);
        if (idx !== -1) {
          this.bookings.splice(idx, 1, {
            ...this.selectedBooking,
            start: this.editArrivalDate,
            end: this.editDepartureDate,
          });
        }

        alert("Bron tafsilotlari yangilandi!");
        this.closeBookingDetailModal();
      } catch (error) {
        console.error("Bronni yangilashda xato:", error);
        alert("Serverda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      }
    },

    async deleteBooking() {
      if (!confirm("Bronni o‘chirishni istaysizmi?")) return;

      try {
        await api.delete(`/api/v1/bron/${this.selectedBooking.id}`);

        // Local massivdan o'chirish
        this.bookings = this.bookings.filter(b => b.id !== this.selectedBooking.id);

        alert("Bron o‘chirildi!");
        this.closeBookingDetailModal();
      } catch (error) {
        console.error("Bronni o‘chirishda xato:", error);
        alert("Serverda xatolik yuz berdi. Qaytadan urinib ko‘ring.");
      }
    }
  },

  async mounted() {
    try {
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map(item => ({
        id: item.id,
        display: `${item.room_type.name} – xona ${item.xona}, qavat ${item.qavat}`,
        price: parseFloat(item.room_type.Narxi)
      }));
    } catch (err) {
      console.error("Xonalarni yuklashda xatolik:", err);
    }

    try {
      const { data } = await api.get("/api/v1/bron"); // to'g'ri endpoint bronlar uchun
      this.bookings = data.data || data;
    } catch (err) {
      console.error("Booking ma’lumotlarini yuklashda xatolik:", err);
    }
  }
};
</script>



<style scoped>
/* --- Asosiy konteyner --- */
.calendar-container {
  margin: 20px 20px 20px 290px;
  padding: 20px;
  max-width: 1200px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  background: #f9fbfd;
}

/* --- Filtrlar (label, input, button) --- */
.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filters label {
  font-weight: 600;
  user-select: none;
  color: #324f9a;
}

.filters input[type="date"],
.filters input[type="text"] {
  padding: 6px 10px;
  border: 2px solid #a3b0ff;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  width: 160px;
}

.filters input[type="date"]:focus,
.filters input[type="text"]:focus {
  outline: none;
  border-color: #5879ff;
  box-shadow: 0 0 10px #5879ffaa;
}

.filters button {
  padding: 8px 18px;
  background: linear-gradient(45deg, #536dfe, #89a7ff);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s ease;
  user-select: none;
}

.filters button:hover {
  background: linear-gradient(45deg, #4059e7, #4a6ee8);
}

/* --- Jadvalni o'rab oluvchi divlar --- */
.calendar-wrapper {
  overflow-x: auto;
  width: 100%;
  background: linear-gradient(to bottom, #f0f4f8, #dfe9f3);
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.calendar-scroll {
  overflow-x: auto;
  width: 100%;
  padding-bottom: 10px;
}

/* --- Asosiy jadval --- */
.calendar {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.95rem;
  background: #ffffffcc;
  backdrop-filter: blur(6px);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
  min-width: 900px; /* jadval kengligi kichik ekranda scroll bo'lsin */
}

/* --- Jadval boshligi (ustunlar) --- */
.calendar thead th {
  background: linear-gradient(45deg, #2c3e50, #34495e);
  color: #fff;
  padding: 0.75rem;
  font-weight: 700;
  text-align: center;
  border-bottom: 2px solid #ccc;
  white-space: nowrap;
}

/* --- Chapdagi xona nomlari ustuni --- */
.room-header,
.room-label {
  background-color: #2c3e50;
  color: #fff;
  font-weight: 600;
  padding: 0.65rem 1rem;
  position: sticky;
  left: 0;
  white-space: nowrap;
  z-index: 2;
  border-right: 2px solid #ccc;
}

/* --- Jadval katakchalari (yacheykalar) --- */
.calendar td {
  border: 1px solid #ddd;
  padding: 0.6rem;
  text-align: center;
  color:#000;
  transition: background-color 0.2s ease-in-out;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  user-select: none;
}

.calendar td:hover {
  background-color: rgba(52, 73, 94, 0.12);
}

/* --- Bo‘sh katakcha uchun kichik doira --- */
.clickable-cell {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: #2c3e50aa;
  border-radius: 50%;
  margin: auto;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.clickable-cell:hover {
  transform: scale(1.3);
  background-color: #2c3e50;
}

/* --- Bugungi kunni ko'rsatish uchun sinf --- */
.current {
  background: radial-gradient(circle, #cce0ff, #99ccff);
  color: #003366;
  font-weight: bold;
  border: 2px dashed #3399ff;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 8px 2px #3399ff88;
  }
  50% {
    box-shadow: 0 0 14px 4px #3399ffcc;
  }
}

/* --- Kelajakdagi band (rezervatsiya) --- */
.booked-future {
  background: linear-gradient(45deg, #8decb4, #4caf50);
  color: #013d20;
  font-weight: bold;
  border-left: 4px solid #256d34;
}

/* --- O‘tgan band (rezervatsiya) --- */
.booked-past {
  background: linear-gradient(45deg, #ffc6c6, #f37a7a);
  color: #831818;
  font-weight: bold;
  border-left: 4px solid #b31312;
}

/* --- Modal overlay --- */
.modal-overlay {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  background: rgba(44, 62, 80, 0.85);
  backdrop-filter: blur(7px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 12000;
  opacity: 0;
  animation: fadeInOverlay 0.35s forwards;
  padding: 20px;
  box-sizing: border-box;
}

@keyframes fadeInOverlay {
  to {
    opacity: 1;
  }
}

/* --- Modal oynasi --- */
.modal {
  background: linear-gradient(135deg, #f5f8ff, #dce6ff);
  border-radius: 18px;
  padding: 2rem 2.5rem;
  max-width: 460px;
  width: 100%;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 0 0 3px #a9baff;
  border: 3px solid transparent;
  transform-origin: center center;
  animation: scaleInModal 0.35s ease forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  position: relative;
}

@keyframes scaleInModal {
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.modal:hover {
  border-color: #5879ff;
}

/* --- Modal sarlavhasi --- */
.modal h3 {
  font-weight: 800;
  font-size: 1.8rem;
  color: #324f9a;
  margin-bottom: 1.3rem;
  text-align: center;
  text-shadow: 1px 1px 3px #c0d0ff;
  user-select: none;
}

/* --- Modal label va inputlar --- */
.modal label {
  display: block;
  font-weight: 700;
  margin-top: 1.2rem;
  color: #2c3e50;
  user-select: none;
}

.modal input[type="text"],
.modal input[type="tel"],
.modal input[type="date"] {
  width: 100%;
  padding: 0.55rem 1rem;
  margin-top: 0.3rem;
  font-size: 1rem;
  border-radius: 12px;
  border: 2px solid #bcc9ff;
  background: #f8faff;
  box-shadow: inset 1px 1px 5px #d7e1ff;
  color: #1a273a;
  transition: border-color 0.3s ease;
}

.modal input[type="text"]:focus,
.modal input[type="tel"]:focus,
.modal input[type="date"]:focus {
  outline: none;
  border-color: #5879ff;
  box-shadow: 0 0 10px #5879ffaa;
}

/* --- Modal tugmalar konteyneri --- */
.modal-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

/* --- Asosiy modal tugma --- */
.modal-buttons button {
  flex: 1;
  padding: 0.9rem 0;
  font-weight: 900;
  font-size: 1.1rem;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  color: white;
  background: linear-gradient(45deg, #536dfe, #89a7ff);
  box-shadow: 0 7px 14px #7a8affcc;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.modal-buttons button:hover {
  background: linear-gradient(45deg, #3c54d9, #678cff);
  box-shadow: 0 9px 22px #4a62e7cc;
}

/* --- Bekor qilish tugmasi --- */
.cancel-btn {
  background: linear-gradient(45deg, #f95d5d, #ff9e9e);
  box-shadow: 0 7px 14px #f96464cc;
  color: #fff;
  font-weight: 700;
}

.cancel-btn:hover {
  background: linear-gradient(45deg, #d84242, #ff7575);
  box-shadow: 0 9px 22px #d8424244;
}

/* --- Modal yopish tugmasi (agar kerak bo'lsa) --- */
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #66788a;
  transition: color 0.25s ease;
  user-select: none;
}

.close-btn:hover {
  color: #324f9a;
}

/* --- Responsive moslashuv uchun --- */
@media (max-width: 992px) {
  .calendar-container {
    margin: 20px 15px 20px 200px;
    padding: 15px;
    max-width: 100%;
  }
  .calendar {
    min-width: 700px;
    font-size: 0.9rem;
  }
  .filters input[type="date"],
  .filters input[type="text"] {
    width: 140px;
  }
  .filters button {
    padding: 7px 16px;
    font-size: 1rem;
  }
  .modal {
    max-width: 400px;
    padding: 1.8rem 2rem;
  }
  .modal h3 {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .calendar-container {
    margin: 20px 10px;
    padding: 10px;
  }
  .calendar {
    min-width: 600px;
    font-size: 0.85rem;
  }
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .filters input[type="date"],
  .filters input[type="text"] {
    width: 100%;
  }
  .filters button {
    width: 100%;
    padding: 8px 0;
    font-size: 1rem;
  }
  .modal {
    max-width: 100%;
    padding: 1.5rem 1.8rem;
  }
  .modal input[type="text"],
  .modal input[type="tel"],
  .modal input[type="date"] {
    font-size: 0.9rem;
  }
  .modal-buttons button {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    margin: 15px 10px;
    padding: 8px;
  }
  .calendar {
    min-width: 500px;
    font-size: 0.8rem;
  }
  .filters {
    gap: 8px;
  }
  .filters input[type="date"],
  .filters input[type="text"] {
    font-size: 0.85rem;
  }
  .filters button {
    font-size: 0.9rem;
    padding: 6px 0;
  }
  .modal h3 {
    font-size: 1.4rem;
  }
  .modal input[type="text"],
  .modal input[type="tel"],
  .modal input[type="date"] {
    font-size: 0.85rem;
  }
  .modal-buttons button {
    font-size: 0.9rem;
  }
}

</style>
