<template>
  <div class="calendar-container">
    <!-- Filtrlar -->
    <div class="filters">
      <label>📅 Sana oralig'i:</label>
      <input type="date" v-model="startInput" />
      <span>–</span>
      <input type="date" v-model="endInput" />

      <label>🏨 Xona:</label>
      <input type="text" v-model="roomFilter" placeholder="Masalan: LUX 101" />

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
              <th>Xona</th>
              <th v-for="day in dateRange" :key="day.toISOString()">
                {{ formatShortDate(day) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in filteredRooms" :key="room.id">
              <td>{{ room.display }}</td>
              <td
                v-for="day in dateRange"
                :key="day.toISOString()"
                :class="getCellClass(room, day)"
                @click="handleCellClick(room, day)"
              >
                <span v-if="getBooking(room, day)">Bronlangan</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-else>❗ Filtrga mos xona topilmadi.</p>

    <!-- Xona qo‘shish modal -->
    <div v-if="showAddRoomModal" class="modal-overlay" @click.self="showAddRoomModal = false">
      <div class="modal">
        <h3>➕ Yangi xona qo‘shish</h3>

        <label>Xona raqami:</label>
        <input v-model="newRoom.xona" type="text" placeholder="Masalan: 101" />

        <label>Xona nomi (turi):</label>
        <input v-model="newRoom.name" type="text" placeholder="Masalan: LUX" />

        <label>Necha kishilik (sig‘im):</label>
        <input v-model.number="newRoom.kishilik" type="number" min="1" />

        <label>Narxi:</label>
        <input v-model="newRoom.narxi" type="number" min="0" />

        <label>Qavati:</label>
        <input v-model.number="newRoom.qavat" type="number" min="0" />

        <button @click="addRoom">✅ Saqlash</button>
        <button @click="showAddRoomModal = false">❌ Bekor qilish</button>
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
      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0],
      startDate: today,
      endDate: new Date(today.getTime() + 14 * 86400000),
      roomFilter: "",
      floorFilter: "",
      showAddRoomModal: false,
      newRoom: {
        xona: "",
        name: "",
        kishilik: 1,
        narxi: 0,
        qavat: 0
      }
    };
  },
  computed: {
    dateRange() {
      const range = [];
      let d = new Date(this.startDate);
      while (d <= this.endDate) {
        range.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return range;
    },
    uniqueFloors() {
      return [...new Set(this.rooms.map(r => r.qavat))].sort((a, b) => a - b);
    },
    filteredRooms() {
      const term = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter(r => {
        const match = r.display.toLowerCase().includes(term);
        const floorMatch = this.floorFilter ? String(r.qavat) === String(this.floorFilter) : true;
        return match && floorMatch;
      });
    }
  },
  methods: {
    formatShortDate(d) {
      return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
    },
    applyFilters() {
      const s = new Date(this.startInput);
      const e = new Date(this.endInput);
      if (e >= s) {
        this.startDate = s;
        this.endDate = e;
      } else {
        alert("❗ Tugash sanasi boshlanish sanasidan kichik bo‘lmasligi kerak!");
      }
    },
    getBooking(room, date) {
      return this.bookings.find(b => {
        return (
          String(b.xona_id) === String(room.id) &&
          new Date(b.start) <= date &&
          date < new Date(b.end)
        );
      });
    },
    getCellClass(room, date) {
      const b = this.getBooking(room, date);
      return b ? "booked" : "";
    },
    handleCellClick(room, date) {
      const b = this.getBooking(room, date);
      if (b) {
        alert(`❌ Band: ${b.client_name || "Maʼlumot yo‘q"}`);
      } else {
        alert(`✅ Bo‘sh: ${room.display} – ${this.formatShortDate(date)}`);
      }
    },
    async addRoom() {
      const { xona, name, kishilik, narxi, qavat } = this.newRoom;

      if (!xona || !name || kishilik <= 0 || narxi <= 0 || qavat < 0) {
        alert("❗ Barcha maydonlarni to‘g‘ri to‘ldiring!");
        return;
      }

      try {
        const narxiStr = Number(narxi).toFixed(2); // ✅ string format: "450000.00"

        // 1. Xona turi qo‘shish
        const { data: roomType } = await api.post("/api/v1/room-types", {
          name: name.trim(),
          Narxi: narxiStr
        });

        // 2. Xona qo‘shish
        const { data: room } = await api.post("/api/v1/room", {
          xona: xona.trim(),
          qavat: Number(qavat),
          sigim: Number(kishilik),
          room_type_id: roomType.id
        });

        // 3. UIga qo‘shish
        this.rooms.push({
          id: room.id,
          display: `${name} – xona ${xona}, ${kishilik} kishilik, qavat ${qavat}`,
          qavat: Number(qavat)
        });

        this.showAddRoomModal = false;
        this.newRoom = { xona: "", name: "", kishilik: 1, narxi: 0, qavat: 0 };

        alert("✅ Yangi xona qo‘shildi!");
      } catch (err) {
        console.error("❌ Xatolik:", err);
        alert("❌ Xona qo‘shishda xatolik yuz berdi!");
      }
    }
  },
  async mounted() {
    try {
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map(r => ({
        id: Number(r.id),
        display: `${r.room_type.name} – xona ${r.xona}, ${r.sigim} kishilik, qavat ${r.qavat}`,
        qavat: Number(r.qavat)
      }));

      const { data: bronData } = await api.get("/api/v1/bron");
      this.bookings = bronData.data || bronData;
    } catch (err) {
      console.error("Yuklashda xatolik:", err);
    }
  }
};
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}
.calendar-wrapper {
  overflow-x: auto;
}
.calendar {
  width: 100%;
  border-collapse: collapse;
}
.calendar th,
.calendar td {
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
}
.booked {
  background-color: #ffdddd;
  color: #900;
  font-weight: bold;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.modal input {
  width: 100%;
  margin-bottom: 10px;
  padding: 7px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal button {
  margin-right: 10px;
  padding: 7px 14px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}
.modal button:first-of-type {
  background-color: #4caf50;
  color: white;
}
.modal button:last-of-type {
  background-color: #f44336;
  color: white;
}
</style>
