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
              <td v-for="day in dateRange" :key="day.toISOString()" :class="getCellClass(room, day)"
                @click="handleCellClick(room, day)">
                <span v-if="getBooking(room, day)">
                  {{ isLastBookingDay(room, day) ? "🔓" : "🔒" }}
                </span>
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

    <div v-if="editBronModal" class="modal-overlay" @click.self="editBronModal = false">
      <div class="modal">
        <h3>✏️ Bron tahrirlash</h3>

        <p><strong>Xona:</strong> {{
          rooms.find(r => r.id === editingBooking.xona_id)?.display || "Noma'lum"
          }}</p>

        <label>F.I.Sh:</label>
        <input v-model="editingBooking.client_name" type="text" />

        <label>Telefon 1:</label>
        <input v-model="editingBooking.tel1" type="text" />

        <label>Telefon 2:</label>
        <input v-model="editingBooking.tel2" type="text" />

        <label>Boshlanish sanasi:</label>
        <input v-model="editingBooking.start" type="date" />

        <label>Tugash sanasi:</label>
        <input v-model="editingBooking.end" type="date" />

        <div style="margin-top: 15px;">
          <button @click="updateBooking">💾 Saqlash</button>
          <button @click="deleteBooking" style="background-color: #dc3545; margin-left: 10px;">
            🗑️ O'chirish
          </button>
          <button @click="editBronModal = false" style="margin-left: 10px;">
            ❌ Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <!-- Bron qilish modal -->
    <div v-if="showBronModal" class="modal-overlay" @click.self="showBronModal = false">
      <div class="modal">
        <h3>📝 Yangi bron</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.display }}</p>
        <p><strong>Boshlanish:</strong> {{ newBooking.start }}</p>

        <label>F.I.Sh:</label>
        <input v-model="newBooking.client_name" type="text" placeholder="Ism familiya" />

        <label>Telefon 1:</label>
        <input v-model="newBooking.tel1" type="text" placeholder="Telefon raqam 1" />

        <label>Telefon 2:</label>
        <input v-model="newBooking.tel2" type="text" placeholder="Telefon raqam 2 (ixtiyoriy)" />

        <label>Boshlanish sanasi:</label>
        <input v-model="newBooking.start" type="date" />

        <label>Kunlar soni:</label>
        <input type="number" min="1" v-model.number="newBooking.daysCount" placeholder="Necha kun" />

        <label>Tugash sanasi:</label>
        <input v-model="newBooking.end" type="date" readonly />

        <button @click="saveBooking">💾 Saqlash</button>
        <button @click="showBronModal = false">❌ Bekor qilish</button>
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
      editBronModal: false,         // Bron tahrir modal flag
      editingBooking: null,         // Tahrirlanayotgan bron
      rooms: [],                    // Xonalar ro'yxati
      bookings: [],                 // Bronlar ro'yxati

      startInput: today.toISOString().split("T")[0], // Filter boshlangan sana (string)
      endInput: new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0], // Filter tugagan sana

      startDate: today,             // Jadval uchun boshlangan sana (Date)
      endDate: new Date(today.getTime() + 14 * 86400000), // Jadval uchun tugagan sana (Date)

      roomFilter: "",               // Xona nomi bo'yicha filter
      floorFilter: "",              // Qavat bo'yicha filter

      showAddRoomModal: false,     // Yangi xona qo'shish modal flag
      showBronModal: false,        // Yangi bron modal flag

      selectedRoom: null,           // Tanlangan xona bron uchun
      selectedDate: null,           // Tanlangan sana bron uchun

      newRoom: {                   // Yangi xona ma'lumotlari
        xona: "",
        name: "",
        kishilik: 1,
        narxi: 0,
        qavat: 0,
      },

      newBooking: {                // Yangi bron ma'lumotlari
        client_name: "",
        tel1: "",
        tel2: "",
        start: "",
        end: "",
        daysCount: 1,
        status: "pending",
      },

      currentUser: {               // Hozirgi foydalanuvchi ma'lumotlari
        id: null,
        name: "",
      },
    };
  },

  computed: {
    // Jadvalda ko'rsatiladigan sana oralig'i
    dateRange() {
      // Eng oxirgi bronning tugash sanasini aniqlaymiz
      const maxBookingEnd = this.bookings.reduce((max, b) => {
        const endDate = new Date(b.end);
        return endDate > max ? endDate : max;
      }, this.endDate);

      // Jadval uchun oxirgi sana — foydalanuvchi tanlagan yoki bron oxirgi sanasi orasidagi kattasi
      const finalEndDate = maxBookingEnd > this.endDate ? maxBookingEnd : this.endDate;

      const range = [];
      let d = new Date(this.startDate);
      while (d <= finalEndDate) {
        range.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return range;
    },

    // Mavjud xonalardagi noyob qavatlar ro'yxati
    uniqueFloors() {
      return [...new Set(this.rooms.map((r) => r.qavat))].sort((a, b) => a - b);
    },

    // Filtrlarga mos keluvchi xonalar ro'yxati
    filteredRooms() {
      const term = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter((r) => {
        const match = r.display.toLowerCase().includes(term);
        const floorMatch = this.floorFilter
          ? String(r.qavat) === String(this.floorFilter)
          : true;
        return match && floorMatch;
      });
    },
  },

  watch: {
    // Yangi bron uchun kunlar soni o'zgarganda tugash sanasini yangilash
    "newBooking.daysCount"(newVal) {
      this.updateEndDate();
    },

    // Yangi bron boshlanish sanasi o'zgarganda tugash sanasini yangilash
    "newBooking.start"(newVal) {
      this.updateEndDate();
    },
  },

  methods: {
    // Katakchaga bosilganda — agar bron bor bo'lsa tahrir modalini ochamiz, yo'q bo'lsa yangi bron modalini
    handleCellClick(room, date) {
      const booking = this.getBooking(room, date);
      if (booking) {
        this.editingBooking = { ...booking }; // Nusxa olish
        this.editBronModal = true;
      } else {
        this.selectedRoom = room;
        this.selectedDate = date;
        const isoDate = date.toISOString().split("T")[0];
        this.newBooking.start = isoDate;
        this.newBooking.daysCount = 1;
        this.newBooking.client_name = "";
        this.newBooking.tel1 = "";
        this.newBooking.tel2 = "";
        this.newBooking.status = "active";
        this.updateEndDate();
        this.showBronModal = true;
      }
    },

    // Jadvaldagi katak uchun booking topish
    getBooking(room, date) {
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return this.bookings.find((b) => {
        if (String(b.xona_id) !== String(room.id)) return false;
        const start = new Date(b.start);
        const end = new Date(b.end);
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return startDateOnly <= dateOnly && dateOnly <= endDateOnly;
      });
    },

    // Sana bron oxirgi kuni ekanligini tekshirish
    isLastBookingDay(room, date) {
      const booking = this.getBooking(room, date);
      if (!booking) return false;

      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endDate = new Date(new Date(booking.end).getFullYear(), new Date(booking.end).getMonth(), new Date(booking.end).getDate());

      return dateOnly.getTime() === endDate.getTime();
    },

    // Jadval katakchalariga class qo'yish (band, band oxirgi kun, yoki bo'sh)
    getCellClass(room, date) {
      const booking = this.getBooking(room, date);
      if (!booking) return "available";

      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endDate = new Date(new Date(booking.end).getFullYear(), new Date(booking.end).getMonth(), new Date(booking.end).getDate());

      if (dateOnly.getTime() === endDate.getTime()) return "booked-end";

      return "booked";
    },

    // Yangi bron uchun tugash sanasini hisoblash
    updateEndDate() {
      const start = new Date(this.newBooking.start);
      if (isNaN(start.getTime()) || !this.newBooking.daysCount) {
        this.newBooking.end = "";
        return;
      }
      const end = new Date(start);
      end.setDate(end.getDate() + this.newBooking.daysCount - 1);
      this.newBooking.end = end.toISOString().split("T")[0];
    },

    // Jadvaldagi sanani qisqa formatda ko'rsatish (masalan: 05 iyul)
    formatShortDate(d) {
      return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
    },

    // Filtrlar uchun sanani tekshirish va jadvalga qo'llash
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

    // Yangi bron saqlash
    async saveBooking() {
      const { client_name, tel1, start, end } = this.newBooking;

      if (!client_name || !tel1 || !start || !end) {
        alert("❗ Barcha majburiy maydonlar to‘ldirilishi kerak!");
        return;
      }

      if (new Date(end) < new Date(start)) {
        alert("❗ Tugash sanasi boshlanish sanasidan oldin bo‘la olmaydi!");
        return;
      }

      const postData = {
        xona_id: this.selectedRoom.id,
        client_name: client_name.trim(),
        tel1: tel1.trim(),
        tel2: this.newBooking.tel2.trim() || null,
        start,
        end,
        create_user_id: this.currentUser.id,
        create_user_name: this.currentUser.name,
      };

      try {
        const res = await api.post("/api/v1/bron", postData);
        this.bookings.push(res.data);
        this.showBronModal = false;
        this.newBooking = {
          client_name: "",
          tel1: "",
          tel2: "",
          start: "",
          end: "",
          daysCount: 1,
          status: "pending",
        };
        alert("✅ Bron muvaffaqiyatli saqlandi!");
      } catch (err) {
        console.error("Serverdan xatolik:", err.response?.data || err);
        alert("❌ Bron saqlashda xatolik yuz berdi. Serverdan javobni konsolda tekshiring.");
      }
    },

    // Bronni tahrirlash
    async updateBooking() {
      if (!this.editingBooking) return;

      try {
        const res = await api.put(`/api/v1/bron/${this.editingBooking.id}`, this.editingBooking);
        const idx = this.bookings.findIndex(b => b.id === this.editingBooking.id);
        if (idx !== -1) {
          this.bookings.splice(idx, 1, res.data);
        }
        this.editBronModal = false;
        this.editingBooking = null;
        alert("✅ Bron yangilandi!");
      } catch (err) {
        console.error("Bron yangilashda xatolik:", err.response?.data || err);
        alert("❌ Bronni yangilashda xatolik yuz berdi!");
      }
    },

    // Bronni o'chirish
    async deleteBooking() {
      if (!this.editingBooking) return;
      if (!confirm("⚠️ Bronni o'chirishni xohlaysizmi?")) return;

      try {
        await api.delete(`/api/v1/bron/${this.editingBooking.id}`);
        this.bookings = this.bookings.filter(b => b.id !== this.editingBooking.id);
        this.editBronModal = false;
        this.editingBooking = null;
        alert("✅ Bron o'chirildi!");
      } catch (err) {
        console.error("Bron o'chirishda xatolik:", err.response?.data || err);
        alert("❌ Bronni o'chirishda xatolik yuz berdi!");
      }
    },

    // Yangi xona qo'shish
    async addRoom() {
      const { xona, name, kishilik, narxi, qavat } = this.newRoom;
      if (!xona || !name || kishilik <= 0 || narxi <= 0 || qavat < 0) {
        alert("❗ Barcha maydonlarni to‘g‘ri to‘ldiring!");
        return;
      }

      try {
        const narxiStr = Number(narxi).toFixed(2);
        const { data: roomType } = await api.post("/api/v1/room-types", {
          name: name.trim(),
          Narxi: narxiStr,
        });

        const { data: room } = await api.post("/api/v1/room", {
          xona: xona.trim(),
          qavat: Number(qavat),
          sigim: Number(kishilik),
          room_type_id: roomType.id,
        });

        this.rooms.push({
          id: room.id,
          display: `${name} – xona ${xona}, ${kishilik} kishilik, qavat ${qavat}`,
          qavat: Number(qavat),
        });

        this.showAddRoomModal = false;
        this.newRoom = { xona: "", name: "", kishilik: 1, narxi: 0, qavat: 0 };
        alert("✅ Yangi xona qo‘shildi!");
      } catch (err) {
        console.error("❌ Xatolik:", err);
        alert("❌ Xona qo‘shishda xatolik yuz berdi!");
      }
    },
  },

  async mounted() {
    try {
      // Misol uchun foydalanuvchi ma'lumotlari backenddan olinadi
      this.currentUser.id = 1;
      this.currentUser.name = "Admin";

      // Xonalarni yuklash
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map((r) => ({
        id: Number(r.id),
        display: `${r.room_type.name} – xona ${r.xona}, ${r.sigim} kishilik, qavat ${r.qavat}`,
        qavat: Number(r.qavat),
      }));

      // Bronlarni yuklash
      const { data: bronData } = await api.get("/api/v1/bron");
      this.bookings = bronData.data || bronData;
    } catch (err) {
      console.error("Yuklashda xatolik:", err);
    }
  },
};
</script>


<style scoped>
.calendar-container {
  max-width: 1200px;
  overflow-x: auto;
  padding: 20px;
  margin: 20px 20px 20px 290px;
  font-family: Arial, sans-serif;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filters label {
  font-weight: bold;
}

.filters input[type="date"],
.filters input[type="text"],
.filters select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filters button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters button:hover {
  background-color: #007bff;
  color: white;
}

.calendar-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.calendar {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
}

.calendar th,
.calendar td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  min-width: 40px;
  user-select: none;
}

.calendar th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  z-index: 1;
}

.booked {
  background-color: #ffcccc;
  color: #b30000;
  cursor: not-allowed;
}

.booked-end {
  background-color: #cce5ff;
  color: #004085;
  cursor: not-allowed;
  font-weight: bold;
}

.available {
  background-color: #e6ffe6;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 6px;
  width: 320px;
  max-width: 90%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin-top: 0;
}

.modal label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

.modal input[type="text"],
.modal input[type="number"],
.modal input[type="date"] {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal button {
  margin-top: 15px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal button:first-of-type {
  background-color: #28a745;
  color: white;
  margin-right: 10px;
}

.modal button:last-of-type {
  background-color: #dc3545;
  color: white;
}
</style>
