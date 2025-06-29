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

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Bron qilish</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.name }}</p>

        <label>👤 Mehmon ismi:</label>
        <input v-model="guestName" placeholder="Mehmon ismini kiriting" />

        <label>📅 Kelish sanasi:</label>
        <input type="date" v-model="arrivalDate" />

        <label>📅 Ketish sanasi:</label>
        <input type="date" v-model="departureDate" />

        <div class="modal-buttons">
          <button @click="confirmBooking">Bron qilish</button>
          <button @click="closeModal" class="cancel-btn">Bekor qilish</button>
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
              @click="!getBooking(room, day) && openBookingModal(room, day)"
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
      endInput: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
        .toISOString()
        .split("T")[0],
      startDate: today,
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      roomFilter: "",
      today: today,

      // Modal uchun
      showModal: false,
      selectedRoom: null,
      selectedDate: null,
      guestName: '',
      arrivalDate: '',
      departureDate: '',
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
      return this.rooms.filter((room) =>
        room.name.toLowerCase().includes(this.roomFilter.trim().toLowerCase())
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
        year: "numeric",
      });
    },
    getBooking(room, date) {
      return this.bookings.find((booking) => {
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
      end.setDate(end.getDate() + 1); // chiqarilgan kun band emas

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
  },
};
</script>

<style scoped>
/* Umumiy konteyner */
.calendar-container {
  padding: 20px;
  margin:20px 20px 20px 290px;
  /* font-family: 'Segoe UI', sans-serif; */
  /* background: #f9f9fb; */
  color: #333;
}

/* === Filtrlar === */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.filters label {
  font-weight: 600;
  margin-right: 0.5rem;
}

.filters input[type="date"],
.filters input[type="text"] {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
}

.filters button {
  padding: 0.5rem 1rem;
  background-color: #3a86ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.filters button:hover {
  background-color: #265fc1;
}

/* === Jadval === */
.calendar-wrapper {
  overflow-x: auto;
}

.calendar {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.calendar th,
.calendar td {
  border: 1px solid #e0e0e0;
  padding: 8px;
  text-align: center;
  min-width: 100px;
}

.calendar th {
  background-color: #f1f5f9;
  font-weight: 600;
  color: #333;
}

.room-label {
  font-weight: bold;
  background-color: #f8fafc;
  text-align: left;
  padding-left: 1rem;
}

/* === Katak ranglari === */
.booked-past {
  background-color: #f8d7da;
  color: #721c24;
}
.booked-future {
  background-color: #cfe2ff;
  color: #084298;
}
.current {
  background-color: #fff3cd;
  color: #664d03;
}
.clickable-cell {
  cursor: pointer;
  color: #28a745;
  font-size: 20px;
  transition: transform 0.2s ease;
}
.clickable-cell:hover {
  transform: scale(1.2);
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 350px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal h3 {
  margin-top: 0;
  font-size: 20px;
  color: #333;
}

.modal input {
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.modal-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-buttons button:first-child {
  background-color: #3a86ff;
  color: white;
}

.modal-buttons button:first-child:hover {
  background-color: #265fc1;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #c0c0c0;
}

/* === Responsivlik === */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .calendar th,
  .calendar td {
    min-width: 80px;
    font-size: 13px;
  }

  .modal {
    width: 90%;
  }
}
</style>

