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
      <button v-if="canAddRoom" @click="showAddRoomModal = true">➕ Xona qo‘shish</button>
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
                :title="`Band qilingan: ${getGuestsCountByRoomAndDate(room, day)} / ${room.kishilik} kishi`"
              >
                <span v-if="getGuestsCountByRoomAndDate(room, day) > 0">
                  {{ isLastBookingDay(room, day) ? "🔓" : "🔒" }}
                  &nbsp;{{ getGuestsCountByRoomAndDate(room, day) }}
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
        <input v-model.number="newRoom.narxi" type="number" min="0" />

        <label>Qavati:</label>
        <input v-model.number="newRoom.qavat" type="number" min="0" />

        <button @click="addRoom">✅ Saqlash</button>
        <button @click="showAddRoomModal = false">❌ Bekor qilish</button>
      </div>
    </div>

    <!-- Bron tahrirlash modal -->
    <div v-if="editBronModal" class="modal-overlay" @click.self="editBronModal = false">
      <div class="modal">
        <h3>✏️ Bron tahrirlash</h3>

        <p>
          <strong>Xona:</strong>
          {{
            rooms.find((r) => r.id === editingBooking.xona_id)?.display || "Noma'lum"
          }}
        </p>

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

        <label>Status:</label>
        <select v-model="editingBooking.status">
          <option value="faol">Faol</option>
          <option value="bajarildi">Bajarildi</option>
          <option value="nofaol">Nofaol</option>
          <option value="bekor qilingan">Bekor qilingan</option>
        </select>

        <label>Nechta kishi:</label>
        <input
          v-model.number="editingBooking.guestsCount"
          type="number"
          min="1"
          :max="getMaxGuestsForEdit(editingBooking)"
        />

        <div style="margin-top: 15px;">
          <button @click="updateBooking">💾 Saqlash</button>
          <button
            @click="deleteBooking"
            style="background-color: #dc3545; margin-left: 10px;"
          >
            🗑️ O'chirish
          </button>
          <button @click="editBronModal = false" style="margin-left: 10px;">
            ❌ Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <!-- Yangi bron qilish modal -->
    <div v-if="showBronModal" class="modal-overlay" @click.self="showBronModal = false">
      <div class="modal">
        <h3>📝 Yangi bron</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.display }}</p>
        <p><strong>Boshlanish:</strong> {{ newBooking.start }}</p>

        <label>F.I.Sh:</label>
        <input
          v-model="newBooking.client_name"
          type="text"
          placeholder="Ism familiya"
        />

        <label>Telefon 1:</label>
        <input
          v-model="newBooking.tel1"
          type="text"
          placeholder="Telefon raqam 1"
        />

        <label>Telefon 2:</label>
        <input
          v-model="newBooking.tel2"
          type="text"
          placeholder="Telefon raqam 2 (ixtiyoriy)"
        />

        <label>Boshlanish sanasi:</label>
        <input v-model="newBooking.start" type="date" />

        <label>Kunlar soni:</label>
        <input
          type="number"
          min="1"
          v-model.number="newBooking.daysCount"
          placeholder="Necha kun"
        />

        <label>Tugash sanasi:</label>
        <input v-model="newBooking.end" type="date" readonly />

        <label>Status:</label>
        <select v-model="newBooking.status">
          <option value="faol">Faol</option>
          <option value="bajarildi">Bajarildi</option>
          <option value="nofaol">Nofaol</option>
          <option value="bekor qilingan">Bekor qilingan</option>
        </select>

        <label>Nechta kishi:</label>
        <input
          v-model.number="newBooking.guestsCount"
          type="number"
          min="1"
          :max="selectedRoom?.kishilik || 1"
        />

        <button :disabled="!canSaveNewBooking" @click="saveBooking">
          💾 Saqlash
        </button>
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
      editBronModal: false,
      editingBooking: null,
      rooms: [],
      bookings: [],

      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getTime() + 14 * 86400000)
        .toISOString()
        .split("T")[0],

      startDate: today,
      endDate: new Date(today.getTime() + 14 * 86400000),

      roomFilter: "",
      floorFilter: "",

      showAddRoomModal: false,
      showBronModal: false,

      selectedRoom: null,
      selectedDate: null,

      newRoom: {
        xona: "",
        name: "",
        kishilik: 1,
        narxi: 0,
        qavat: 0,
      },

      newBooking: {
        client_name: "",
        tel1: "",
        tel2: "",
        start: "",
        end: "",
        daysCount: 1,
        status: "faol",
        guestsCount: 1, // yangi maydon: nechta kishi bron qilmoqda
      },

      currentUser: {
        id: null,
        name: "",
      },
    };
  },

  computed: {
    dateRange() {
      // Eng oxirgi sanani hisoblash (filtrda tanlangan yoki bronlarda eng katta)
      const maxBookingEnd = this.bookings.reduce((max, b) => {
        const endDate = new Date(b.end);
        return endDate > max ? endDate : max;
      }, this.endDate);

      const finalEndDate = maxBookingEnd > this.endDate ? maxBookingEnd : this.endDate;

      const range = [];
      let d = new Date(this.startDate);
      while (d <= finalEndDate) {
        range.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return range;
    },

    uniqueFloors() {
      return [...new Set(this.rooms.map((r) => r.qavat))].sort((a, b) => a - b);
    },

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

    // Yangi xona qo'shish faqat filtrdan keyin xona bor bo'lsa ko'rsatiladi
    canAddRoom() {
      return this.filteredRooms.length > 0;
    },

    // Yangi bron saqlash uchun majburiy maydonlar to'liq to'ldirilganmi
    canSaveNewBooking() {
      const b = this.newBooking;
      if (
        !b.client_name ||
        !b.tel1 ||
        !b.start ||
        !b.end ||
        b.guestsCount <= 0 ||
        b.guestsCount > (this.selectedRoom?.kishilik || 1)
      )
        return false;

      // Sig‘imni tekshirish
      const bookedGuestsCount = this.getGuestsCountByRoomAndDate(
        this.selectedRoom,
        new Date(b.start)
      );
      if (bookedGuestsCount + b.guestsCount > (this.selectedRoom?.kishilik || 1))
        return false;

      return true;
    },
  },

  watch: {
    "newBooking.daysCount"(newVal) {
      this.updateEndDate();
    },
    "newBooking.start"(newVal) {
      this.updateEndDate();
    },
  },

  methods: {
    // Berilgan xona va sana uchun faol va bajarilgan bronlarni qaytaradi
    getBookingsByRoomAndDate(room, date) {
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return this.bookings.filter((b) => {
        if (!["faol", "bajarildi"].includes(b.status)) return false;
        if (String(b.xona_id) !== String(room.id)) return false;

        const start = new Date(b.start);
        const end = new Date(b.end);
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        return startDateOnly <= dateOnly && dateOnly <= endDateOnly;
      });
    },

    // Berilgan xona va sana uchun jami qancha kishilik bron qilinganini hisoblaydi
    getGuestsCountByRoomAndDate(room, date) {
      const bookings = this.getBookingsByRoomAndDate(room, date);
      // Har bir bron uchun guestsCount maydonini hisobga oladi, agar yo'q bo'lsa 1 deb oladi
      return bookings.reduce((sum, b) => sum + (b.guestsCount || 1), 0);
    },

    getBooking(room, date) {
      // Ushbu sana uchun xona bo‘yicha birinchi bronni qaytaradi
      const bookings = this.getBookingsByRoomAndDate(room, date);
      return bookings.length ? bookings[0] : null;
    },

    isLastBookingDay(room, date) {
      const booking = this.getBooking(room, date);
      if (!booking) return false;

      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endDate = new Date(booking.end);
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return dateOnly.getTime() === endDateOnly.getTime();
    },

    // Jadval hujayrasining CSS sinfini belgilaydi
    getCellClass(room, date) {
      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const roomData = this.rooms.find((r) => r.id === room.id);
      const sigim = roomData?.kishilik || 1;

      if (guestsCount === 0) return "available";
      if (guestsCount >= sigim) return "booked";

      return "partially-booked";
    },

    handleCellClick(room, date) {
      // Agar xona to‘liq to‘lgan bo‘lsa yangi bron qo‘shishga ruxsat bermaymiz
      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const roomSigim = room.kishilik || 1;

      if (guestsCount >= roomSigim) {
        // To‘liq to‘lgan, faqat mavjud bronni tahrirlashga ruxsat bering
        const booking = this.getBooking(room, date);
        if (booking) {
          this.editingBooking = { ...booking };
          this.editBronModal = true;
        } else {
          alert("⚠️ Xona to‘liq band qilingan, yangi bron qo‘shib bo‘lmaydi!");
        }
        return;
      }

      // Agar xona bo‘sh yoki to‘liq to‘lmagan bo‘lsa yangi bron qo‘shish oynasini ochamiz
      this.selectedRoom = room;
      this.selectedDate = date;
      const isoDate = date.toISOString().split("T")[0];

      this.newBooking = {
        client_name: "",
        tel1: "",
        tel2: "",
        start: isoDate,
        daysCount: 1,
        end: isoDate,
        status: "faol",
        guestsCount: 1,
      };

      this.showBronModal = true;
    },

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

    async saveBooking() {
      const { client_name, tel1, start, end, status, guestsCount } = this.newBooking;

      if (!client_name || !tel1 || !start || !end) {
        alert("❗ Barcha majburiy maydonlar to‘ldirilishi kerak!");
        return;
      }

      if (new Date(end) < new Date(start)) {
        alert("❗ Tugash sanasi boshlanish sanasidan oldin bo‘la olmaydi!");
        return;
      }

      if (guestsCount <= 0) {
        alert("❗ Nechta kishi band qilinishini to‘g‘ri kiriting!");
        return;
      }

      // Sig‘imni tekshirish — xonaning mavjud sig‘imi va bron qilingan kishilar soni
      const bookedGuestsCount = this.getGuestsCountByRoomAndDate(this.selectedRoom, new Date(start));
      const roomSigim = this.selectedRoom.kishilik || 1;
      if (bookedGuestsCount + guestsCount > roomSigim) {
        alert(`❗ Bu sanada xona sig‘imi (${roomSigim}) dan ko‘p odam band qilib bo‘lmaydi!`);
        return;
      }

      const postData = {
        xona_id: this.selectedRoom.id,
        client_name: client_name.trim(),
        tel1: tel1.trim(),
        tel2: this.newBooking.tel2.trim() || null,
        start,
        end,
        status: status || "faol",
        guestsCount,
        create_user_id: this.currentUser.id,
        create_user_name: this.currentUser.name,
      };

      try {
        const res = await api.post("/api/v1/bron", postData);
        this.bookings.push(res.data);
        this.showBronModal = false;
        alert("✅ Bron muvaffaqiyatli saqlandi!");
      } catch (err) {
        console.error("Serverdan xatolik:", err.response?.data || err);
        alert("❌ Bron saqlashda xatolik yuz berdi. Serverdan javobni konsolda tekshiring.");
      }
    },

    async updateBooking() {
      if (!this.editingBooking) return;

      // Yangilash oldidan sig'imni tekshirish (editingBooking uchun)
      const editing = this.editingBooking;
      // boshqalar tomonidan band qilinganlar soni
      const othersGuestsCount = this.getGuestsCountByRoomAndDate(
        this.rooms.find(r => r.id === editing.xona_id),
        new Date(editing.start)
      ) - (editing.guestsCount || 1);

      const roomSigim = this.rooms.find(r => r.id === editing.xona_id)?.kishilik || 1;

      if (othersGuestsCount + (editing.guestsCount || 1) > roomSigim) {
        alert(`❗ Bu sanada xona sig‘imi (${roomSigim}) dan ko‘p odam band qilib bo‘lmaydi!`);
        return;
      }

      try {
        const res = await api.put(`/api/v1/bron/${editing.id}`, editing);
        const idx = this.bookings.findIndex((b) => b.id === editing.id);
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

    async deleteBooking() {
      if (!this.editingBooking) return;
      if (!confirm("⚠️ Bronni o'chirishni xohlaysizmi?")) return;

      try {
        await api.delete(`/api/v1/bron/${this.editingBooking.id}`);
        this.bookings = this.bookings.filter((b) => b.id !== this.editingBooking.id);
        this.editBronModal = false;
        this.editingBooking = null;
        alert("✅ Bron o'chirildi!");
      } catch (err) {
        console.error("Bron o'chirishda xatolik:", err.response?.data || err);
        alert("❌ Bronni o'chirishda xatolik yuz berdi!");
      }
    },

    async addRoom() {
      const { xona, name, kishilik, narxi, qavat } = this.newRoom;
      if (!xona || !name || kishilik <= 0 || narxi < 0 || qavat < 0) {
        alert("❗ Barcha maydonlarni to‘g‘ri to‘ldiring!");
        return;
      }

      try {
        // Room type yaratish (yoki backend bilan moslashtiring)
        const { data: roomType } = await api.post("/api/v1/room-types", {
          name: name.trim(),
          Narxi: narxi,
        });

        // Xona yaratish
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
          kishilik: Number(kishilik),
        });

        this.showAddRoomModal = false;
        this.newRoom = { xona: "", name: "", kishilik: 1, narxi: 0, qavat: 0 };
        alert("✅ Yangi xona qo‘shildi!");
      } catch (err) {
        console.error("❌ Xatolik:", err);
        alert("❌ Xona qo‘shishda xatolik yuz berdi!");
      }
    },

    getMaxGuestsForEdit(booking) {
      if (!booking) return 1;
      const room = this.rooms.find((r) => r.id === booking.xona_id);
      if (!room) return 1;

      // boshqalar tomonidan band qilinganlar soni (ushbu bronni hisoblamay)
      const othersGuestsCount = this.getGuestsCountByRoomAndDate(room, new Date(booking.start)) - (booking.guestsCount || 1);

      return room.kishilik - othersGuestsCount;
    },
  },

  async mounted() {
    try {
      // Foydalanuvchi ma'lumotlari (moslashtiring)
      this.currentUser.id = 1;
      this.currentUser.name = "Admin";

      // Xonalarni olish
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map((r) => ({
        id: Number(r.id),
        display: `${r.room_type.name} – xona ${r.xona}, ${r.sigim} kishilik, qavat ${r.qavat}`,
        qavat: Number(r.qavat),
        kishilik: Number(r.sigim),
      }));

      // Bronlarni olish
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
  padding: 15px;
  font-family: Arial, sans-serif;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.filters label {
  font-weight: bold;
  margin-right: 5px;
}

.filters input[type="text"],
.filters input[type="date"],
.filters select {
  padding: 5px;
  border-radius: 3px;
  border: 1px solid #ccc;
}

.filters button {
  cursor: pointer;
  padding: 6px 10px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: white;
}

.filters button:hover:not(:disabled) {
  background-color: #0056b3;
}

.calendar-wrapper {
  overflow-x: auto;
}

.calendar {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
}

.calendar th,
.calendar td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: center;
  user-select: none;
}

.available {
  background-color: #d4edda; /* light green */
  cursor: pointer;
}

.partially-booked {
  background-color: #fff3cd; /* light yellow */
  cursor: pointer;
}

.booked {
  background-color: #f8d7da; /* light red */
  cursor: default;
}

.booked:hover {
  cursor: default;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  width: 320px;
  max-width: 90%;
  border-radius: 5px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.modal label {
  display: block;
  margin: 8px 0 3px;
  font-weight: bold;
}

.modal input[type="text"],
.modal input[type="number"],
.modal input[type="date"],
.modal select {
  width: 100%;
  padding: 6px 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.modal button {
  cursor: pointer;
  padding: 8px 12px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: white;
}

.modal button:hover {
  background-color: #0056b3;
}
</style>
