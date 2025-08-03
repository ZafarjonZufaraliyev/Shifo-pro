<template>
  <div class="calendar-container">
    <!-- Filtrlar -->
    <div class="filters" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
      <label>📅 Sana oralig'i:</label>
      <input type="date" v-model="startInput" />
      <span>–</span>
      <input type="date" v-model="endInput" />

      <label>🏨 Xona:</label>
      <input
        type="text"
        v-model="roomFilter"
        placeholder="Masalan: LUX 101"
        style="min-width: 150px;"
      />

      <label>🏢 Qavat:</label>
      <select v-model="floorFilter" style="min-width: 100px;">
        <option value="">Barchasi</option>
        <option v-for="f in uniqueFloors" :key="f" :value="f">{{ f }}-qavat</option>
      </select>

      <button @click="applyFilters" style="padding: 5px 12px; cursor: pointer;">Filterlash</button>

      <button
        v-if="canAddRoom"
        @click="showAddRoomModal = true"
        style="padding: 5px 12px; background-color: #28a745; color: white; border: none; cursor: pointer;"
      >
        ➕ Xona qo‘shish
      </button>
    </div>

    <!-- Jadval -->
    <div v-if="filteredRooms.length" class="calendar-wrapper" style="overflow-x: auto;">
      <table
        class="calendar"
        border="1"
        cellspacing="0"
        cellpadding="5"
        style="min-width: 100%; border-collapse: collapse; text-align: center;"
      >
        <thead style="background-color: #f0f0f0;">
          <tr>
            <th style="position: sticky; left: 0; background: #f0f0f0; z-index: 2; white-space: nowrap;">Xona</th>
            <th
              v-for="day in dateRange"
              :key="day.toISOString()"
              style="white-space: nowrap; padding: 5px 8px;"
              :title="day.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })"
            >
              {{ formatShortDate(day) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in filteredRooms" :key="room.id" style="border-bottom: 1px solid #ddd;">
            <td
              style="white-space: nowrap; font-weight: 600; background: #fafafa; position: sticky; left: 0; z-index: 1;"
              :title="room.display"
            >
              {{ room.display }}
            </td>

            <td
              v-for="date in dateRange"
              :key="date"
              :class="getCellClass(room, date)"
              @click="handleCellClick(room, date)"
              style="cursor: pointer; vertical-align: middle; min-width: 45px; position: relative; padding: 6px 4px;"
              :title="generateTooltip(room, date)"
            >
              <template v-if="getCellClass(room, date) === 'locked'">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  
                  <span style="font-weight: bold; color: green;">+</span>
                </div>
              </template>

              <template v-else-if="getCellClass(room, date) === 'partially-booked'">
                <span style="font-weight: bold; color: green;">+</span>
                <span
  @click.stop="openServiceInfo(room, date)"
  style="cursor: pointer;"
  title="Xizmat tafsilotlari"
>
  🖊️
</span>

              </template>

              <template v-else>
                <span style="color: #777;">
                  {{ getGuestsCountByRoomAndDate(room, date) }}/{{ room.kishilik }}
                </span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else style="margin-top: 20px; font-weight: bold; color: #c00;">
      ❗ Filtrga mos xona topilmadi.
    </p>

    <!-- Xona qo‘shish modal -->
    <div
      v-if="showAddRoomModal"
      class="modal-overlay"
      @click.self="showAddRoomModal = false"
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;"
    >
      <div
        class="modal"
        style="max-width: 400px; padding: 20px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
      >
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

        <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
          <button
            @click="addRoom"
            style="padding: 6px 12px; background-color: #28a745; color: white; border: none; cursor: pointer;"
          >
            ✅ Saqlash
          </button>
          <button
            @click="showAddRoomModal = false"
            style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; cursor: pointer;"
          >
            ❌ Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <!-- Bron tahrirlash modal -->
    <div
      v-if="editBronModal"
      class="modal-overlay"
      @click.self="editBronModal = false"
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;"
    >
      <div
        class="modal"
        style="max-width: 450px; padding: 20px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
      >
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

        <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
          <button
            @click="updateBooking"
            style="padding: 6px 12px; background-color: #007bff; color: white; border: none; cursor: pointer;"
          >
            💾 Saqlash
          </button>
          <button
            @click="deleteBooking"
            style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; cursor: pointer;"
          >
            🗑️ O'chirish
          </button>
          <button
            @click="editBronModal = false"
            style="background-color: #6c757d; color: white; border: none; padding: 6px 12px; cursor: pointer;"
          >
            ❌ Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <!-- Yangi bron qilish modal -->
    <div
      v-if="showBronModal"
      class="modal-overlay"
      @click.self="showBronModal = false"
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;"
    >
      <div
        class="modal"
        style="max-width: 450px; padding: 20px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
      >
        <h3>📝 Yangi bron</h3>
        <p><strong>Xona:</strong> {{ selectedRoom?.display }}</p>
        <p><strong>Boshlanish:</strong> {{ newBooking.start }}</p>

        <label>F.I.Sh:</label>
        <input v-model="newBooking.client_name" type="text" placeholder="Ism familiya" />

        <label>Telefon 1:</label>
        <input v-model="newBooking.tel1" type="text" placeholder="Telefon raqam 1" />

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

        <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
          <button
            :disabled="!canSaveNewBooking"
            @click="saveBooking"
            style="padding: 6px 12px; background-color: #007bff; color: white; border: none; cursor: pointer;"
          >
            💾 Saqlash
          </button>
          <button
            @click="showBronModal = false"
            style="background-color: #6c757d; color: white; border: none; padding: 6px 12px; cursor: pointer;"
          >
            ❌ Bekor qilish
          </button>
        </div>
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
      // Modal va tahrirlash uchun
      editBronModal: false,
      editingBooking: null,

      // Asosiy ma'lumotlar
      rooms: [],
      bookings: [],
      clientServices: [],

      // Kalendar uchun sanalar
      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0],
      startDate: today,
      endDate: new Date(today.getTime() + 14 * 86400000),

      // Filtrlar
      roomFilter: "",
      floorFilter: "",

      // Modal oynalar
      showAddRoomModal: false,
      showBronModal: false,

      // Tanlangan xona va sana
      selectedRoom: null,
      selectedDate: null,

      // Yangi xona qo'shish uchun
      newRoom: {
        xona: "",
        name: "",
        kishilik: 1,
        narxi: 0,
        qavat: 0,
      },

      // Yangi bron uchun
      newBooking: {
        client_name: "",
        tel1: "",
        tel2: "",
        start: "",
        end: "",
        daysCount: 1,
        status: "faol",
        guestsCount: 1,
      },

      // Hozirgi foydalanuvchi (API dan olish mumkin)
      currentUser: {
        id: null,
        name: "",
      },
    };
  },

  computed: {
    // Kalendar sanalari oralig'i
    dateRange() {
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

    // Unikal qavatlar ro'yxati (filter uchun)
    uniqueFloors() {
      return [...new Set(this.rooms.map((r) => r.qavat))].sort((a, b) => a - b);
    },

    // Xonalarni nomi va qavatga qarab filtrlash
    filteredRooms() {
      const term = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter((r) => {
        const matchesName = r.display.toLowerCase().includes(term);
        const matchesFloor = this.floorFilter ? String(r.qavat) === String(this.floorFilter) : true;
        return matchesName && matchesFloor;
      });
    },

    // Bron saqlash uchun tekshiruv
    canSaveNewBooking() {
      const b = this.newBooking;
      if (
        !b.client_name.trim() ||
        !b.tel1.trim() ||
        !b.start ||
        !b.end ||
        b.guestsCount <= 0 ||
        b.guestsCount > (this.selectedRoom?.kishilik || 1)
      )
        return false;

      const bookedGuestsCount = this.getGuestsCountByRoomAndDate(this.selectedRoom, new Date(b.start));
      if (bookedGuestsCount + b.guestsCount > (this.selectedRoom?.kishilik || 1)) return false;

      return true;
    },

    // Yangi xona qo'shish buttoni faolligi uchun
    canAddRoom() {
      const { xona, name, kishilik, narxi, qavat } = this.newRoom;
      return (
        xona.trim() !== "" &&
        name.trim() !== "" &&
        kishilik > 0 &&
        narxi >= 0 &&
        qavat >= 0
      );
    },
  },

  watch: {
    // Days count yoki start sanasi o'zgarganda end sanani yangilash
    "newBooking.daysCount"(newVal) {
      this.updateEndDate();
    },
    "newBooking.start"(newVal) {
      this.updateEndDate();
    },
  },

  methods: {
    // Maksimal odam sonini olish (booking tahrirlashda kerak)
    getMaxGuestsForEdit(booking) {
      if (!booking) return 1;
      const room = this.rooms.find((r) => String(r.id) === String(booking.xona_id));
      return room ? room.kishilik : 1;
    },

    getBookingsByRoomAndDate(room, date) {
      if (!room || !date) return [];
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

    getGuestsCountByRoomAndDate(room, date) {
      const bookings = this.getBookingsByRoomAndDate(room, date);
      return bookings.reduce((sum, b) => sum + (b.guestsCount || 1), 0);
    },

    getBooking(room, date) {
      const bookings = this.getBookingsByRoomAndDate(room, date);
      return bookings.length ? bookings[0] : null;
    },

    openServiceInfo(room, date) {
      if (!room || !date) {
        alert("Xona yoki sana tanlanmagan.");
        return;
      }

      const dateStr = date.toISOString().split("T")[0];

      const booking = this.bookings.find(
        (b) =>
          String(b.xona_id) === String(room.id) &&
          b.start <= dateStr &&
          dateStr <= b.end
      );

      if (!booking) {
        alert("Bu sanada bron topilmadi.");
        return;
      }

      this.editingBooking = { ...booking };
      this.editBronModal = true;
    },

    generateTooltip(room, date) {
      return `Xona: ${room.display}\nSana: ${date.toLocaleDateString()}`;
    },

    getCellClass(room, date) {
      if (!room || !date) return "";

      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const capacity = room.kishilik || 1;
      const dateStr = date.toISOString().split("T")[0];

      const isLocked = this.clientServices.some(
        (s) =>
          String(s.room_id) === String(room.id) &&
          s.start_date <= dateStr &&
          dateStr <= s.end_date
      );

      if (isLocked) return "locked";
      if (guestsCount === 0) return "available";
      if (guestsCount >= capacity) return "booked";
      return "partially-booked";
    },

    handleCellClick(room, date) {
      if (!room || !date) return;

      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const capacity = room.kishilik || 1;
      const dateStr = date.toISOString().split("T")[0];

      const isLocked = this.clientServices.some(
        (s) =>
          String(s.room_id) === String(room.id) &&
          s.start_date <= dateStr &&
          dateStr <= s.end_date
      );

      if (isLocked) {
        alert("🔒 Bu xona ushbu sanada band (xizmat davom etmoqda).");
        return;
      }

      if (guestsCount >= capacity) {
        const booking = this.getBooking(room, date);
        if (booking) {
          this.editingBooking = { ...booking };
          this.editBronModal = true;
        } else {
          alert("⚠️ Xona to‘liq band qilingan, yangi bron qo‘shib bo‘lmaydi!");
        }
        return;
      }

      this.selectedRoom = room;
      this.selectedDate = date;
      const isoDate = dateStr;

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
      if (!d) return "";
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

      if (!client_name.trim() || !tel1.trim() || !start || !end) {
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

      const bookedGuestsCount = this.getGuestsCountByRoomAndDate(this.selectedRoom, new Date(start));
      const capacity = this.selectedRoom.kishilik || 1;
      if (bookedGuestsCount + guestsCount > capacity) {
        alert(`❗ Bu sanada xona sig‘imi (${capacity}) dan ko‘p odam band qilib bo‘lmaydi!`);
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
        alert("❌ Bron saqlashda xatolik yuz berdi.");
      }
    },

    async updateBooking() {
      if (!this.editingBooking) return;

      const editing = this.editingBooking;
      const room = this.rooms.find((r) => r.id === editing.xona_id);
      if (!room) return alert("Xona topilmadi!");

      const othersGuestsCount = this.getGuestsCountByRoomAndDate(room, new Date(editing.start)) - (editing.guestsCount || 1);
      if (othersGuestsCount + (editing.guestsCount || 1) > room.kishilik) {
        alert(`❗ Bu sanada xona sig‘imi (${room.kishilik}) dan ko‘p odam band qilib bo‘lmaydi!`);
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
      if (!xona.trim() || !name.trim() || kishilik <= 0 || narxi < 0 || qavat < 0) {
        alert("❗ Barcha maydonlarni to‘g‘ri to‘ldiring!");
        return;
      }

      try {
        // Xona turi yaratish
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
          display: `${name.trim()} – xona ${xona.trim()}, ${kishilik} kishilik, qavat ${qavat}`,
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
  },

  async mounted() {
    try {
      // Hozirgi foydalanuvchini o‘rnatish (demo uchun)
      this.currentUser.id = 1;
      this.currentUser.name = "Admin";

      // Xonalarni yuklash
      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map((r) => ({
        id: Number(r.id),
        display: `${r.room_type?.name || "Noma'lum"} – xona ${r.xona}, ${r.sigim} kishilik, qavat ${r.qavat}`,
        qavat: Number(r.qavat),
        kishilik: Number(r.sigim),
      }));

      // Bronlarni yuklash
      const { data: bookingData } = await api.get("/api/v1/bron");
      this.bookings = bookingData;

      // ClientServices ni yuklash (agar kerak bo'lsa)
      const { data: clientServiceData } = await api.get("/api/v1/client-services");
      this.clientServices = clientServiceData;

      console.log("Bronlar yuklandi:", this.bookings);
    } catch (err) {
      console.error("Ma'lumot yuklashda xatolik:", err);
      alert("❌ Ma'lumotlarni yuklashda muammo yuz berdi.");
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


.locked {
  background-color: #e63946;
  color: white;
  font-weight: bold;
  padding: 4px;
  border-radius: 4px;
}

.calendar th,
.calendar td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: center;
  user-select: none;
}

.available {
  background-color: #d4edda;
  /* light green */
  cursor: pointer;
}

.partially-booked {
  background-color: #fff3cd;
  /* light yellow */
  cursor: pointer;
}

.booked {
  background-color: #f8d7da;
  /* light red */
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
  width: 500px;
  margin: 50px 0px;
  max-height: 90vh; /* Ekran balandligining 90% dan oshmasin */
  overflow-y: auto; /* Vertikal scroll qo‘shadi agar kontent sig‘masa */
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
