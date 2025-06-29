<template>
  <div class="calendar-container">
    <!-- Filtrlar -->
    <div class="filters">
      <label>📅 Sana oralig'i:</label>
      <input type="date" v-model="startInput" />
      <span>–</span>
      <input type="date" v-model="endInput" />

      <label>🏨 Xona raqami:</label>
      <input type="text" v-model="roomFilter" placeholder="Masalan: 1-xona" />

      <button @click="applyFilters">Filterlash</button>
    </div>

    <!-- Bron qilish modal (bo‘sh katak uchun) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Bron qilish</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.name }}</p>

        <label> Mehmon ismi:</label>
        <input v-model="guestName" placeholder="Mehmon ismini kiriting" />

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

    <!-- Bron tafsilot modal (bronlangan katak uchun) -->
    <div v-if="showBookingDetail" class="modal-overlay" @click.self="closeBookingDetailModal">
      <div class="modal">
        <h3>Bron tafsilotlari</h3>
        <p><strong>Xona:</strong> {{ selectedBookingRoom?.name }}</p>
        <p><strong>Mehmon:</strong> {{ selectedBooking?.guest }}</p>
        <p><strong>Kelish sanasi:</strong> {{ selectedBooking?.start }}</p>
        <p><strong>Ketish sanasi:</strong> {{ selectedBooking?.end }}</p>
        <div class="modal-buttons">
          <button @click="closeBookingDetailModal" class="cancel-btn">Yopish</button>
        </div>
      </div>
    </div>

    <!-- Jadval -->
    <div class="calendar-wrapper">
      <table class="calendar" v-if="filteredRooms.length">
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
            <td class="room-label">{{ room.name }}</td>
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
      <p v-else>Filtrga mos xona topilmadi.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const today = new Date();
    return {
      rooms: [
        { id: 1, name: "1-xona" },
        { id: 2, name: "2-xona" },
        { id: 3, name: "3-xona" },
        { id: 4, name: "VIP-xona" },
        { id: 5, name: "4-xona" },
        { id: 6, name: "5-xona" },
        { id: 7, name: "6-xona" },
        { id: 8, name: "7-xona" },
        { id: 9, name: "VIP-xona" },
        { id: 10, name: "8-xona" }
      ],
      bookings: [
        {
          id: 1,
          roomId: 1,
          start: "2025-06-28",
          end: "2025-07-02",
          guest: "Ali Valiyev",
        },
        {
          id: 2,
          roomId: 2,
          start: "2025-06-30",
          end: "2025-07-05",
          guest: "Gulbahor Saidova",
        },
        {
          id: 3,
          roomId: 3,
          start: "2025-07-01",
          end: "2025-07-10",
          guest: "Oybek Rasulov",
        },
        {
          id: 4,
          roomId: 4,
          start: "2025-06-27",
          end: "2025-06-29",
          guest: "Sardor Karimov",
        },
      ],
      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14).toISOString().split("T")[0],
      startDate: today,
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      roomFilter: "",
      today: today,

      // Modal uchun bron qilish
      showModal: false,
      selectedRoom: null,
      selectedDate: null,
      guestName: '',
      arrivalDate: '',
      departureDate: '',

      // Bron tafsilot modal uchun
      showBookingDetail: false,
      selectedBooking: null,
      selectedBookingRoom: null,
    };
  },

  computed: {
    dateRange() {
      const dates = [];
      let current = new Date(this.startDate);
      while (current <= this.endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    },

    filteredRooms() {
      if (!this.roomFilter.trim()) return this.rooms;
      return this.rooms.filter(room =>
        room.name.toLowerCase().includes(this.roomFilter.trim().toLowerCase())
      );
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
        month: "short",
        year: "numeric",
      });
    },

    getBooking(room, date) {
      return this.bookings.find(booking => {
        if (booking.roomId !== room.id) return false;
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        return date >= start && date < end;
      });
    },

    getBookingTitle(room, date) {
      const booking = this.getBooking(room, date);
      if (!booking) return "";
      return `Bron qilingan: ${booking.guest}\n${booking.start} dan ${booking.end} gacha`;
    },

    getCellClass(room, date) {
      const booking = this.getBooking(room, date);
      if (!booking) return "";
      const d = new Date(date.toDateString());
      const today = new Date(this.today.toDateString());
      if (d.getTime() === today.getTime()) return "current";
      else if (d > today) return "booked-future";
      else return "booked-past";
    },

    openBookingModal(room, date) {
      this.selectedRoom = room;
      this.selectedDate = date;
      this.guestName = '';
      this.arrivalDate = date.toISOString().split("T")[0];
      this.departureDate = '';
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    confirmBooking() {
      if (!this.guestName.trim() || !this.arrivalDate || !this.departureDate) {
        alert("Barcha maydonlarni to‘ldiring!");
        return;
      }

      const start = new Date(this.arrivalDate);
      const end = new Date(this.departureDate);
      end.setDate(end.getDate() + 1); // chiqish kuni band bo‘lmasin

      if (end <= start) {
        alert("Ketish sanasi kelish sanasidan keyin bo‘lishi kerak!");
        return;
      }

      const overlapping = this.bookings.some(b => {
        if (b.roomId !== this.selectedRoom.id) return false;
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        return (start < bEnd) && (end > bStart);
      });

      if (overlapping) {
        alert("Bu sana oralig‘ida xona band!");
        return;
      }

      this.bookings.push({
        id: this.bookings.length + 1,
        roomId: this.selectedRoom.id,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        guest: this.guestName.trim()
      });

      alert("Bron muvaffaqiyatli qo‘shildi!");
      this.closeModal();
    },

    // Yangi metod: bronlangan katakchani bosganda bron tafsilot modalini ochadi
    handleCellClick(room, date) {
      const booking = this.getBooking(room, date);
      if (booking) {
        this.selectedBooking = booking;
        this.selectedBookingRoom = room;
        this.showBookingDetail = true;
      } else {
        this.openBookingModal(room, date);
      }
    },

    closeBookingDetailModal() {
      this.showBookingDetail = false;
      this.selectedBooking = null;
      this.selectedBookingRoom = null;
    }
  }
};
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  margin:20px 20px 20px 290px;
  /* width:100%; */
  max-width: 1200px;
  font-family: "Segoe UI", sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}
@media (max-width: 768px) {
 .calendar-container {
  max-width: 1200px;
  margin: 20px;
  }}

/* === FILTRLAR === */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 10px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filters label {
  font-weight: 500;
  margin-right: 4px;
}

.filters input[type="date"],
.filters input[type="text"] {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.filters button {
  padding: 6px 12px;
  background-color: #3498db;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.filters button:hover {
  background-color: #2c80b4;
}

/* === MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background-color: white;
  padding: 25px 30px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0px);
    opacity: 1;
  }
}

.modal h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #333;
}

.modal label {
  font-size: 14px;
  margin-top: 10px;
  display: block;
  font-weight: 500;
}

.modal input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-buttons button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.modal-buttons .cancel-btn {
  background-color: #e74c3c;
  color: white;
}
.modal-buttons .cancel-btn:hover {
  background-color: #c0392b;
}
.modal-buttons button:not(.cancel-btn) {
  background-color: #2ecc71;
  color: white;
}
.modal-buttons button:not(.cancel-btn):hover {
  background-color: #27ae60;
}

/* === CALENDAR TABLE === */
.calendar-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.calendar {
  width: 100%;
  border-collapse: collapse;
}

.calendar th,
.calendar td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
  font-size: 14px;
  min-width: 100px;
}

.calendar th {
  background-color: #f0f0f0;
  font-weight: 600;
  color: #333;
}

.room-label {
  font-weight: bold;
  background-color: #f9f9f9;
}

.clickable-cell {
  cursor: pointer;
  height: 28px;
  display: block;
  background-color: #ecf0f1;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}
.clickable-cell:hover {
  background-color: #d0e4f1;
}

/* === CELL COLORS === */
.booked-past {
  background-color: #dcdde1;
  color: #888;
}
.booked-future {
  background-color: #74b9ff;
  color: white;
}
.current {
  background-color: #fdcb6e;
  color: black;
  font-weight: bold;
}
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-top: 5px;
}

.badge.paid {
  background-color: #27ae60;
}

.badge.unpaid {
  background-color: #e67e22;
}
.booking-detail-modal {
  background-color: white;
  padding: 20px 25px;
  border-radius: 12px;
  width: 380px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
}

.booking-detail-modal h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.booking-detail-modal p {
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
}

.booking-detail-modal .close-btn {
  margin-top: 15px;
  padding: 6px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.booking-detail-modal .close-btn:hover {
  background-color: #c0392b;
}
.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

.navigation-buttons button {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #2980b9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.navigation-buttons button:hover {
  background-color: #1c5f8a;
}

</style>
