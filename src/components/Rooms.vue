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
      <button @click="showAddRoomModal = true">➕ Xona qo‘shish</button>
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

    <!-- Yangi xona turi va xona qo‘shish modal -->
    <div v-if="showAddRoomModal" class="modal-overlay" @click.self="showAddRoomModal = false">
      <div class="modal">
        <h3>Yangi xona va turi qo‘shish</h3>
        <label>Xona turi nomi:</label>
        <input v-model="newRoomType.name" type="text" placeholder="Masalan: LUX" />

        <label>Narxi:</label>
        <input v-model="newRoomType.Narxi" type="number" placeholder="Masalan: 350000" />

        <label>Xona soni:</label>
        <input v-model="newRoomType.count" type="number" placeholder="Nechta xona qurildi?" />

        <label>Qavati:</label>
        <input v-model="newRoomType.qavat" type="number" placeholder="Masalan: 2" />

        <button @click="addRoomTypeAndRooms">✅ Qo‘shish</button>
        <button @click="showAddRoomModal = false">Bekor qilish</button>
      </div>
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
      roomTypes: [],
      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14).toISOString().split("T")[0],
      startDate: today,
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      roomFilter: "",
      floorFilter: "",
      today,
      showAddRoomModal: false,
      newRoomType: {
        name: "",
        Narxi: "",
        count: 1,
        qavat: ""
      }
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
      const term = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter(room => {
        const matchRoom = room.display.toLowerCase().includes(term);
        const matchFloor = this.floorFilter ? String(room.qavat) === String(this.floorFilter) : true;
        return matchRoom && matchFloor;
      });
    }
  },
  methods: {
    applyFilters() {
      if (!this.startInput || !this.endInput) return;
      const s = new Date(this.startInput);
      const e = new Date(this.endInput);
      if (e < s) return;
      this.startDate = s;
      this.endDate = e;
    },
    formatFullDate(date) {
      return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" });
    },
    formatShortDate(date) {
      return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
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
      return b ? `Bron: ${b.client_name}\n${this.formatFullDate(new Date(b.start))} – ${this.formatFullDate(new Date(b.end))}` : "";
    },
    getCellClass(room, date) {
      const b = this.getBooking(room, date);
      if (!b) return "";

      const today = new Date(this.today.toDateString());
      const currentDate = new Date(date.toDateString());
      const start = new Date(b.start);
      const end = new Date(b.end);

      if (currentDate.getTime() === today.getTime()) {
        return "current";
      } else if (currentDate > today && start > today) {
        return "booked-future";
      } else if (end < today) {
        return "booked-past";
      } else {
        return "current";
      }
    },
    handleCellClick(room, date) {
      const b = this.getBooking(room, date);
      if (b) {
        alert(`Bu xona bron qilingan: ${b.client_name}`);
      } else {
        alert(`${room.display} uchun ${this.formatFullDate(date)} sanasini bosdingiz.`);
      }
    },
    async addRoomTypeAndRooms() {
      const { name, Narxi, count, qavat } = this.newRoomType;
      if (!name || !Narxi || !count || !qavat) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }

      try {
        const { data: roomType } = await api.post("/api/v1/room_type", { name, Narxi });
        const room_type_id = roomType.id;

        const createdRooms = [];
        for (let i = 1; i <= count; i++) {
          const roomNumber = Math.floor(Math.random() * 900 + 100); // Tasodifiy xona raqami
          const { data: room } = await api.post("/api/v1/room", {
            xona: roomNumber,
            qavat,
            room_type_id
          });
          createdRooms.push({
            id: room.id,
            display: `${name} – xona ${roomNumber}, qavat ${qavat}`,
            qavat
          });
        }

        this.rooms.push(...createdRooms);
        alert("Xonalar muvaffaqiyatli qo‘shildi!");
        this.showAddRoomModal = false;
        this.newRoomType = { name: "", Narxi: "", count: 1, qavat: "" };

        const { data: roomTypes } = await api.get("/api/v1/room_type");
        this.roomTypes = roomTypes;
      } catch (err) {
        console.error("Xona yoki turi qo‘shishda xatolik:", err);
        alert("Xatolik yuz berdi");
      }
    }
  },
  async mounted() {
    try {
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map(item => ({
        id: item.id,
        display: `${item.room_type.name} – xona ${item.xona}, qavat ${item.qavat}`,
        qavat: item.qavat
      }));

      const { data: roomTypeData } = await api.get("/api/v1/room_type");
      this.roomTypes = roomTypeData;

      const { data } = await api.get("/api/v1/bron");
      this.bookings = data.data || data;
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    }
  }
};
</script>


<style scoped>
/* === Umumiy konteyner === */
.calendar-container {
  font-family: 'Segoe UI', sans-serif;
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: linear-gradient(135deg, #f9fafe, #eef2f7);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* === Filtrlar === */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-bottom: 25px;
}

.filters label {
  font-weight: bold;
  color: #333;
}

.filters input,
.filters select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 160px;
}

.filters input:focus,
.filters select:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.4);
}

.filters button {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}

.filters button:hover {
  background-color: #0056b3;
}

/* === Jadval === */
.calendar-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #dee2e6;
}

.calendar {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  background: white;
}

.calendar th,
.calendar td {
  padding: 12px;
  border: 1px solid #dee2e6;
  text-align: center;
  vertical-align: middle;
}

.room-header {
  background-color: #f8f9fa;
  font-weight: bold;
}

.room-label {
  font-weight: 500;
  text-align: left;
  background: #f0f8ff;
}

.booked-past {
  background-color: #fff3cd;
  color: #856404;
}

.booked-future {
  background-color: #d1ecf1;
  color: #0c5460;
}

.current {
  background-color: #f8d7da;
  color: #721c24;
}

.clickable-cell {
  display: block;
  width: 100%;
  height: 100%;
  background: #f1f3f5;
  border-radius: 4px;
  transition: background 0.3s ease;
  cursor: pointer;
}

.clickable-cell:hover {
  background: #dee2e6;
}

/* === Modal dizayni === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 14px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal h3 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  text-align: center;
}

.modal label {
  display: block;
  margin-top: 12px;
  font-weight: 600;
  color: #555;
}

.modal input {
  width: 100%;
  padding: 10px 14px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.modal button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  transition: background-color 0.3s;
  cursor: pointer;
}

.modal button:hover {
  background-color: #218838;
}
</style>