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

      <label>🏢 Qavat:</label>
      <select v-model="floorFilter">
        <option value="">Barchasi</option>
        <option v-for="f in uniqueFloors" :key="f" :value="f">{{ f }}-qavat</option>
      </select>

      <button @click="applyFilters">Filterlash</button>
    </div>

    <!-- Jadval -->
    <div class="calendar-wrapper" v-if="filteredRooms.length">
      <div class="calendar-scroll">
        <table class="calendar">
          <thead>
            <tr>
              <th class="room-header">Xona</th>
              <th v-for="day in dateRange" :key="day.toISOString()" :title="formatFullDate(day)">
                {{ formatShortDate(day) }}
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
                @click="handleCellClick(room, day)"
                :title="getBookingTitle(room, day)"
              >
                <span v-if="getBooking(room, day)">Bronlangan</span>
                <span v-else class="clickable-cell"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-else>Filtrga mos xona topilmadi.</p>

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

    <!-- Bron tafsilot modal -->
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
  </div>
</template>

  
<script>
import api from "@/api"; // API uchun axios yoki o'z api faylingizni import qiling

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
      floorFilter: "",
      today,

      // Modal uchun data
      showModal: false,
      selectedRoom: null,
      selectedDate: null,
      guestName: "",
      tel1: "",
      tel2: "",
      arrivalDate: "",
      departureDate: "",

      showBookingDetail: false,
      selectedBooking: null,
      selectedBookingRoom: null,
      editArrivalDate: "",
      editDepartureDate: ""
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
    uniqueFloors() {
      const set = new Set(this.rooms.map(r => r.qavat));
      return Array.from(set).sort((a, b) => a - b);
    },
    filteredRooms() {
      const roomTerm = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter(room => {
        const matchRoom = room.display.toLowerCase().includes(roomTerm);
        const matchFloor = this.floorFilter ? String(room.qavat) === String(this.floorFilter) : true;
        return matchRoom && matchFloor;
      });
    }
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
        month: "long",
        year: "numeric"
      });
    },
    formatShortDate(date) {
      return date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short"
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
        ? `Bron qilingan: ${b.client_name}\n${this.formatFullDate(new Date(b.start))} dan ${this.formatFullDate(new Date(b.end))} gacha\nTelefon: ${b.tel1}`
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
      if (
        !this.guestName.trim() ||
        !this.tel1.trim() ||
        !this.arrivalDate ||
        !this.departureDate
      ) {
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
        this.selectedBooking = { ...b };
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

      const overlap = this.bookings.some(b => {
        if (b.id === this.selectedBooking.id) return false;
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
        await api.put(`/api/v1/bron/${this.selectedBooking.id}`, {
          client_name: this.selectedBooking.client_name,
          tel1: this.selectedBooking.tel1,
          tel2: this.selectedBooking.tel2,
          start: this.editArrivalDate,
          end: this.editDepartureDate
        });
        const idx = this.bookings.findIndex(b => b.id === this.selectedBooking.id);
        if (idx !== -1) {
          this.bookings.splice(idx, 1, {
            ...this.selectedBooking,
            start: this.editArrivalDate,
            end: this.editDepartureDate
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
        price: parseFloat(item.room_type.Narxi),
        qavat: item.qavat
      }));
    } catch (err) {
      console.error("Xonalarni yuklashda xatolik:", err);
    }

    try {
      const { data } = await api.get("/api/v1/bron");
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
  background-color: #fff;
  color: #222;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* --- Filtrlar --- */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
}

.filters label {
  font-weight: 600;
  color: #555;
  user-select: none;
  white-space: nowrap;
}

.filters input[type="date"],
.filters input[type="text"],
.filters select {
  padding: 8px 12px;
  border: 1.8px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease;
  color: #222;
}

.filters input[type="date"]:focus,
.filters input[type="text"]:focus,
.filters select:focus {
  border-color: #5a4def;
  outline: none;
  box-shadow: 0 0 6px #8f8dfd88;
}

.filters button {
  background-color: #5a4def;
  color: white;
  font-weight: 700;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  min-width: 130px;
}

.filters button:hover {
  background-color: #4838c8;
}

/* --- Jadval konteyneri --- */
.calendar-wrapper {
  overflow-x: auto;
  background: #fafafa;
  border-radius: 14px;
  box-shadow: 0 10px 22px rgba(90, 77, 239, 0.1);
  padding: 10px 0;
}

/* --- Jadval --- */
.calendar {
  border-collapse: separate;
  border-spacing: 0 8px;
  min-width: 900px;
  width: 100%;
  font-size: 0.9rem;
  color: #444;
}

/* --- Jadval boshligi --- */
.calendar thead th {
  background-color: #5a4def;
  color: #fff;
  padding: 12px 14px;
  font-weight: 700;
  text-align: center;
  border-radius: 10px 10px 0 0;
  user-select: none;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

/* --- Chapdagi xona nomlari ustuni --- */
.room-header,
.room-label {
  background-color: #d8d9ff;
  color: #4838c8;
  font-weight: 700;
  padding: 14px 18px;
  position: sticky;
  left: 0;
  border-radius: 12px 0 0 12px;
  box-shadow: 3px 0 6px -2px rgba(72, 56, 200, 0.3);
  user-select: none;
  white-space: nowrap;
}

/* --- Jadval katakchalari --- */
.calendar td {
  text-align: center;
  padding: 10px 0;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* --- Bo'sh katakcha uchun kichik doira --- */
.clickable-cell {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-color: #b0b6ff;
  border-radius: 50%;
  margin: auto;
  opacity: 0.8;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.clickable-cell:hover {
  transform: scale(1.4);
  background-color: #5a4def;
}

/* --- Bugungi kun --- */
.current {
  background-color: #d9dbff;
  font-weight: 700;
  color: #4838c8;
  box-shadow: 0 0 12px 3px #8f8dfd88;
  border: 2px solid #4838c8;
}

/* --- Band qilingan kataklar (kelajak va o'tgan) --- */
.booked-future {
  background: linear-gradient(135deg, #9be7ff, #38bdf8);
  color: #0369a1;
  font-weight: 700;
  border-left: 6px solid #0284c7;
  box-shadow: 0 2px 8px #38bdf8aa;
}

.booked-past {
  background: linear-gradient(135deg, #ff9b9b, #f87171);
  color: #9b1c1c;
  font-weight: 700;
  border-left: 6px solid #b91c1c;
  box-shadow: 0 2px 8px #f8717180;
}

/* --- Tooltip (custom) --- */
.calendar td[title]:hover::after {
  content: attr(title);
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) translateY(-110%);
  background: rgba(72, 56, 200, 0.9);
  color: #fff;
  padding: 6px 10px;
  font-size: 0.85rem;
  border-radius: 8px;
  white-space: pre-line;
  pointer-events: none;
  z-index: 10;
  max-width: 280px;
  box-shadow: 0 0 8px rgba(72, 56, 200, 0.8);
  opacity: 0;
  animation: fadeInTooltip 0.3s forwards;
}

.calendar td:hover[title]::after {
  opacity: 1;
}

@keyframes fadeInTooltip {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-120%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-110%);
  }
}

/* --- Modal overlay --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 12000;
  padding: 20px;
  box-sizing: border-box;
  animation: fadeInOverlay 0.3s ease forwards;
}

@keyframes fadeInOverlay {
  from {opacity: 0;}
  to {opacity: 1;}
}

/* --- Modal oynasi --- */
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 12px 36px rgba(72, 56, 200, 0.25);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  position: relative;
  animation: scaleInModal 0.3s ease forwards;
}

@keyframes scaleInModal {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal h3 {
  font-weight: 800;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #5a4def;
  text-align: center;
  user-select: none;
}

.modal label {
  display: block;
  font-weight: 600;
  margin-top: 1.3rem;
  color: #444;
  user-select: none;
}

.modal input[type="text"],
.modal input[type="tel"],
.modal input[type="date"] {
  width: 100%;
  padding: 0.6rem 1rem;
  margin-top: 0.3rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 1.8px solid #ccc;
  background: #f9f9f9;
  color: #222;
  box-shadow: inset 1px 1px 5px #ddd;
  transition: border-color 0.3s ease;
}

.modal input[type="text"]:focus,
.modal input[type="tel"]:focus,
.modal input[type="date"]:focus {
  outline: none;
  border-color: #5a4def;
  box-shadow: 0 0 8px #8f8dfd88;
}

.modal-buttons {
  margin-top: 2.5rem;
  display: flex;
  gap: 1rem;
}

.modal-buttons button {
  flex: 1;
  padding: 1rem 0;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: white;
  transition: background-color 0.3s ease;
  user-select: none;
}

.modal-buttons button:hover {
  filter: brightness(0.9);
}

.modal-buttons .cancel-btn {
  background-color: #ef4444;
  box-shadow: 0 6px 14px #f8717180;
}

.modal-buttons .cancel-btn:hover {
  background-color: #b91c1c;
}

.modal-buttons .delete-btn {
  background-color: #dc2626;
  box-shadow: 0 6px 14px #ef4444cc;
}

.modal-buttons .delete-btn:hover {
  background-color: #991b1b;
}

.modal-buttons button:not(.cancel-btn):not(.delete-btn) {
  background-color: #5a4def;
  box-shadow: 0 6px 16px #7269f1cc;
}

/* --- Responsive dizayn --- */
@media (max-width: 992px) {
  .calendar-container {
    margin-left: 150px;
    padding: 16px;
    max-width: 100%;
  }
  .calendar {
    min-width: 700px;
    font-size: 0.9rem;
  }
  .filters input[type="date"],
  .filters input[type="text"],
  .filters select {
    min-width: 140px;
  }
  .filters button {
    min-width: 110px;
    padding: 8px 18px;
    font-size: 1rem;
  }
  .modal {
    max-width: 420px;
    padding: 1.8rem 2rem;
  }
  .modal h3 {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .calendar-container {
    margin-left: 100px;
    padding: 12px;
  }
  .calendar {
    min-width: 600px;
    font-size: 0.85rem;
  }
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .filters input[type="date"],
  .filters input[type="text"],
  .filters select {
    min-width: auto;
    width: 100%;
  }
  .filters button {
    width: 100%;
    padding: 10px 0;
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
    padding: 10px;
  }
  .calendar {
    min-width: 500px;
    font-size: 0.8rem;
  }
  .filters {
    gap: 10px;
  }
  .filters input[type="date"],
  .filters input[type="text"],
  .filters select {
    font-size: 0.85rem;
  }
  .filters button {
    font-size: 0.9rem;
    padding: 8px 0;
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