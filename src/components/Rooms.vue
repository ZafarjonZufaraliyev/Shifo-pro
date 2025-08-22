  <template>
    <div class="calendar-container">
      <!-- Filtrlar -->
      <div class="filters" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
        <label>📅 Sana oralig'i:</label>
        <input type="date" v-model="startInput" />
        <span>–</span>
        <input type="date" v-model="endInput" />

        <label>🏨 Xona:</label>
        <input type="text" v-model="roomFilter" placeholder="Masalan: LUX 101" style="min-width: 150px;" />

        <label>🏢 Qavat:</label>
        <select v-model="floorFilter" style="min-width: 100px;">
          <option value="">Barchasi</option>
          <option v-for="f in uniqueFloors" :key="f" :value="f">{{ f }}-qavat</option>
        </select>

        <button @click="applyFilters" style="padding: 5px 12px; cursor: pointer;">Filterlash</button>

        <button v-if="canAddRoom" @click="showAddRoomModal = true"
          style="padding: 5px 12px; background-color: #28a745; color: white; border: none; cursor: pointer;">
          ➕ Xona qo‘shish
        </button>
      </div>

      <!-- Jadval -->
      <div v-if="filteredRooms.length" class="calendar-wrapper" style="overflow-x: auto;">
        <table class="calendar" border="1" cellspacing="0" cellpadding="5"
          style="min-width: 100%; border-collapse: collapse; text-align: center;">
          <thead style="background-color: #f0f0f0;">
            <tr>
              <th style="position: sticky; left: 0; background: #f0f0f0; z-index: 2; white-space: nowrap;">
                Xona
              </th>
              <th v-for="day in dateRange" :key="day.toISOString()" style="white-space: nowrap; padding: 5px 8px;"
                :title="day.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })">
                {{ formatShortDate(day) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in filteredRooms" :key="room.id" style="border-bottom: 1px solid #ddd;">
              <td
                style="white-space: nowrap; font-weight: 600; background: #fafafa; position: sticky; left: 0; z-index: 1;"
                :title="room.display">
                {{ room.display }}
              </td>

              <td v-for="date in dateRange" :key="date" :class="getCellClass(room, date)"
                style="cursor: pointer; vertical-align: middle; min-width: 70px; position: relative; padding: 6px 4px;">
                <div style="font-weight: bold; text-align: center;"
                  :style="{ color: getGuestsCountByRoomAndDate(room, date) >= room.kishilik ? 'red' : 'green' }">
                  👤 {{ getGuestsCountByRoomAndDate(room, date) }}/{{ room.kishilik }}
                </div>

                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 4px;">
                  <!-- Rooms.vue ichida -->
                  <button class=" rounded"
                    @click="$router.push({ name: 'taxrirBron', params: { roomId: room.id } })">
                    ✏️ Bronlar
                  </button>




                  <span @click.stop="openNewBooking(room, date)" title="Yangi bron qo‘shish"
                    style="cursor: pointer; color: green;">
                    ➕
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else style="margin-top: 20px; font-weight: bold; color: #c00;">
        ❗ Filtrga mos xona topilmadi.
      </p>

      <div>
        <!-- ADD ROOM BUTTON -->
        <button @click="showAddRoomModal = true"
          style="padding: 5px 12px; background-color: #28a745; color: white; border: none; cursor: pointer; margin-bottom: 10px;">
          ➕ Xona qo‘shish
        </button>

        <!-- Xona qo‘shish modal -->
        <div v-if="showAddRoomModal" class="modal-overlay" @click.self="showAddRoomModal = false"
          style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;">
          <div class="modal"
            style="max-width: 400px; padding: 20px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <h3>➕ Yangi xona qo‘shish</h3>

            <label>Xona raqami:</label>
            <input v-model="newRoom.xona" type="text" placeholder="Masalan: 101" />


            <label>Xona turi va narxi:</label>
            <select v-model="selectedRoomTypeId">
              <option value="" disabled>Tanlang</option>
              <option v-for="type in roomTypes" :key="type.id" :value="type.id">
                {{ type.name }} ({{ type.Narxi }} so'm)
              </option>
            </select>


            <label>Necha kishilik (sig‘im):</label>
            <input v-model.number="newRoom.kishilik" type="number" min="1" />


            <label>Qavati:</label>
            <input v-model.number="newRoom.qavat" type="number" min="0" />

            <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
              <button @click="addRoom" :disabled="!canAddRoom"
                style="padding: 6px 12px; background-color: #28a745; color: white; border: none; cursor: pointer;">
                ✅ Saqlash
              </button>
              <button @click="showAddRoomModal = false"
                style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; cursor: pointer;">
                ❌ Bekor qilish
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Yangi bron qilish modal -->
      <div v-if="showBronModal" class="modal-overlay" @click.self="showBronModal = false"
        style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;">
        <div class="modal"
          style="max-width: 450px; padding: 20px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <h3>📝 Yangi bron</h3>
          <p><strong>Xona:</strong> {{ selectedRoom?.display }}</p>


          <label>F.I.Sh:</label>
          <input v-model="newBooking.client_name" type="text" placeholder="Ism familiya" />

          <label>Telefon 1:</label>
          <input v-model="newBooking.tel1" type="text" placeholder="Telefon raqam 1" />

          <label>Boshlanish sanasi:</label>
          <input v-model="newBooking.start" type="date" />

          <label>Kunlar soni:</label>
          <input type="number" min="1" v-model.number="newBooking.daysCount" placeholder="Necha kun" />

          <label>Tugash sanasi:</label>
          <input v-model="newBooking.end" type="date" readonly />

          <label>Status:</label>
          <select v-model="newBooking.status">
            <option value="faol">Faol</option>
            <option value="bajarildi">Bajarildi</option>
            <option value="nofaol">Nofaol</option>
            <option value="bekor qilingan">Bekor qilingan</option>
          </select>



          <label>💰 To‘lov (so'm):</label>
          <input v-model.number="newBooking.price" type="number" min="0" placeholder="Masalan: 500000" />


          <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
            <button :disabled="!canSaveNewBooking" @click="saveBooking"
              style="padding: 6px 12px; background-color: #007bff; color: white; border: none; cursor: pointer;">
              💾 Saqlash
            </button>
            <button @click="showBronModal = false"
              style="background-color: #6c757d; color: white; border: none; padding: 6px 12px; cursor: pointer;">
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
      editBronModal: false,
      editingBooking: null,

      rooms: [],
      bookings: [],
      clientServices: [],
      roomTypes: [],           // ✅ qo‘shildi
      selectedRoomTypeId: null, // ✅ qo‘shildi
      startInput: today.toISOString().split("T")[0],
      endInput: new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0],
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
        guestsCount: 1,
        price: 0,
      },

      currentUser: {
        id: null,
        name: "",
      },
    };
  },

  computed: {
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

    uniqueFloors() {
      return [...new Set(this.rooms.map(r => r.qavat))].sort((a, b) => a - b);
    },

    filteredRooms() {
      const term = this.roomFilter.trim().toLowerCase();
      return this.rooms.filter(r => {
        const matchesName = r.display.toLowerCase().includes(term);
        const matchesFloor = this.floorFilter ? String(r.qavat) === String(this.floorFilter) : true;
        return matchesName && matchesFloor;
      });
    },

    canSaveNewBooking() {
      const b = this.newBooking;
      if (
        !b.client_name.trim() ||
        !b.tel1.trim() ||
        !b.start ||
        !b.end ||
        b.guestsCount <= 0 ||
        b.guestsCount > (this.selectedRoom?.kishilik || 1)
      ) return false;

      const bookedGuestsCount = this.getGuestsCountByRoomAndDate(this.selectedRoom, new Date(b.start));
      if (bookedGuestsCount + b.guestsCount > (this.selectedRoom?.kishilik || 1)) return false;

      return true;
    },

    canAddRoom() {
      return this.newRoom.xona.trim() !== "" && this.selectedRoomTypeId;
    },
  },

  watch: {
    "newBooking.daysCount"() {
      this.updateEndDate();
    },
    "newBooking.start"() {
      this.updateEndDate();
    },
  },

  methods: {
    getMaxGuestsForEdit(booking) {
      if (!booking) return 1;
      const room = this.rooms.find(r => String(r.id) === String(booking.xona_id));
      return room ? room.kishilik : 1;
    },

    getBookingsByRoomAndDate(room, date) {
      if (!room || !date) return [];
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return this.bookings.filter(b => {
        if (!["faol", "bajarildi"].includes(b.status)) return false;
        if (String(b.xona_id) !== String(room.id)) return false;

        const startDateOnly = new Date(new Date(b.start).toDateString());
        const endDateOnly = new Date(new Date(b.end).toDateString());

        return startDateOnly <= dateOnly && dateOnly <= endDateOnly;
      });
    },

    getGuestsCountByRoomAndDate(room, date) {
      return this.getBookingsByRoomAndDate(room, date).reduce((sum, b) => sum + (b.guestsCount || 1), 0);
    },

    openNewBooking(room, date) {
      if (!room || !date) return;

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
        price: ""
      };

      this.showBronModal = true;
    },

    formatShortDate(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    openServiceInfo(room, date) {
      if (!room || !date) {
        alert("Xona yoki sana tanlanmagan.");
        return;
      }
      const dateStr = date.toISOString().split("T")[0];
      const booking = this.bookings.find(
        b => String(b.xona_id) === String(room.id) && b.start <= dateStr && dateStr <= b.end
      );
      if (!booking) {
        alert("Bu sanada bron topilmadi.");
        return;
      }
      this.editingBooking = { ...booking };
      this.editBronModal = true;
    },

    getCellClass(room, date) {
      if (!room || !date) return "";

      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const capacity = room.kishilik || 1;
      const dateStr = date.toISOString().split("T")[0];

      const isLocked = this.clientServices.some(
        s => String(s.room_id) === String(room.id) && s.start_date <= dateStr && dateStr <= s.end_date
      );

      if (isLocked) return "locked";
      if (guestsCount === 0) return "available";
      if (guestsCount >= capacity) return "booked";
      return "partially-booked";
    },

    handleCellClick(room, date) {
      const guestsCount = this.getGuestsCountByRoomAndDate(room, date);
      const capacity = room.kishilik || 1;
      const dateStr = date.toISOString().split("T")[0];

      const isLocked = this.clientServices.some(
        s => String(s.room_id) === String(room.id) && s.start_date <= dateStr && dateStr <= s.end_date
      );

      if (isLocked) {
        alert("🔒 Bu xona ushbu sanada band (xizmat davom etmoqda).");
        return;
      }

      if (guestsCount >= capacity) {
        const booking = this.getBookingsByRoomAndDate(room, date)[0];
        if (booking) {
          this.editingBooking = { ...booking };
          this.editBronModal = true;
        } else {
          alert("⚠️ Xona to‘liq band qilingan, yangi bron qo‘shib bo‘lmaydi!");
        }
        return;
      }

      this.openNewBooking(room, date);
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
      if (!this.canSaveNewBooking) {
        alert("❗ Bron ma'lumotlari noto‘g‘ri yoki xona sig‘imi yetarli emas!");
        return;
      }

      const postData = {
        xona_id: this.selectedRoom.id,
        client_name: this.newBooking.client_name.trim(),
        tel1: this.newBooking.tel1.trim(),
        tel2: this.newBooking.tel2.trim() || null,
        start: this.newBooking.start,
        end: this.newBooking.end,
        status: this.newBooking.status || "faol",
        price: this.newBooking.price,
        guestsCount: this.newBooking.guestsCount,
        create_user_id: this.currentUser.id,
        create_user_name: this.currentUser.name,
      };

      try {
        const res = await api.post("/api/v1/bron", postData);
        this.bookings.push(res.data);
        this.showBronModal = false;
        alert("✅ Bron muvaffaqiyatli saqlandi!");
      } catch (err) {
        // console.error("Serverdan xatolik:", err.response?.data || err);
        alert("❌ Bron saqlashda xatolik yuz berdi.");
      }
    },

    async updateBooking() {
      if (!this.editingBooking) return;

      const room = this.rooms.find(r => r.id === this.editingBooking.xona_id);
      if (!room) return alert("Xona topilmadi!");

      const otherGuests = this.getGuestsCountByRoomAndDate(room, new Date(this.editingBooking.start)) - (this.editingBooking.guestsCount || 1);
      if (otherGuests + (this.editingBooking.guestsCount || 1) > room.kishilik) {
        alert(`❗ Bu sanada xona sig‘imi (${room.kishilik}) dan ko‘p odam band qilib bo‘lmaydi!`);
        return;
      }

      try {
        const res = await api.put(`/api/v1/bron/${this.editingBooking.id}`, this.editingBooking);
        const idx = this.bookings.findIndex(b => b.id === this.editingBooking.id);
        if (idx !== -1) this.bookings.splice(idx, 1, res.data);

        this.editBronModal = false;
        this.editingBooking = null;
        alert("✅ Bron yangilandi!");
      } catch (err) {
        // console.error("Bron yangilashda xatolik:", err.response?.data || err);
        alert("❌ Bronni yangilashda xatolik yuz berdi!");
      }
    },

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
        // console.error("Bron o'chirishda xatolik:", err.response?.data || err);
        alert("❌ Bronni o'chirishda xatolik yuz berdi!");
      }
    },

    async addRoom() {
      if (!this.canAddRoom) {
        alert("❗ Xona ma'lumotlari to‘liq to‘ldirilmagan!");
        return;
      }

      try {
        const selectedType = this.roomTypes.find(rt => rt.id === this.selectedRoomTypeId);
        if (!selectedType) {
          alert("❗ Xona turi tanlanmagan!");
          return;
        }

        // postData shu yerda aniqlanadi
        const postData = {
          xona: this.newRoom.xona.trim(),
          room_type_id: selectedType.id,
          qavat: Number(this.newRoom.qavat),
          kishilik: Number(this.newRoom.kishilik),
          narxi: Number(selectedType.Narxi)
        };

        // Laraveldagi to‘g‘ri route
        const { data } = await api.post("/v1/rooms", postData);

        this.rooms.push({
          id: data.data.id,
          display: selectedType.name,
          qavat: Number(this.newRoom.qavat),
          kishilik: Number(this.newRoom.kishilik),
        });

        this.showAddRoomModal = false;
        this.newRoom = { xona: "", name: "", kishilik: 1, narxi: 0, qavat: 0 };
        this.selectedRoomTypeId = null;

        alert("✅ Yangi xona qo‘shildi!");
      } catch (err) {
        // console.error("❌ Xatolik:", err.response?.data || err);
        alert("❌ Xona qo‘shishda xatolik yuz berdi!");
      }
    }


    ,
  },

  async mounted() {
    try {
      this.currentUser.id = 1;
      this.currentUser.name = "Admin";

      const { data: roomData } = await api.get("/api/v1/room");
      this.rooms = roomData.map(r => ({
        id: Number(r.id),
        display: `${r.room_type?.name || "Noma'lum"} (xona №${r.xona})`,
        qavat: Number(r.qavat),
        kishilik: Number(r.sigim),
      }));


      const { data: roomTypesRes } = await api.get("/api/v1/room-types");
      this.roomTypes = Array.isArray(roomTypesRes.data) ? roomTypesRes.data : [];

      // console.log("=== Room Types ===", this.roomTypes);


      const { data: bookingData } = await api.get("/api/v1/bron");
      this.bookings = bookingData;

      const { data: clientServiceData } = await api.get("/api/v1/client-services");
      this.clientServices = Array.isArray(clientServiceData) ? clientServiceData : [];

    } catch (err) {
      console.error("Ma'lumot yuklashda xatolik:", err);
      alert("❌ Ma'lumotlarni yuklashda muammo yuz berdi.");
    }
  }

};
</script>





<style scoped>
/* ===========================
   Calendar Container & Filters
=========================== */
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
.rounded{
  width: 80px;
  height: 30px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
}
.filters input[type="text"],
.filters input[type="date"],
.filters select {
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.filters button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filters button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.filters button:hover:not(:disabled) {
  background-color: #0056b3;
}

/* ===========================
   Calendar Table
=========================== */
.calendar-wrapper {
  overflow-x: auto;
}

.calendar {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
}

.calendar th,
.calendar td {
  border: 1px solid #ccc;
  padding: 6px 10px;
  text-align: center;
  user-select: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

/* Room status styles */
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

.locked {
  background-color: #e63946; /* dark red */
  color: #fff;
  font-weight: bold;
  border-radius: 4px;
  padding: 4px;
  cursor: not-allowed;
}

/* ===========================
   Modals
=========================== */
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
  background-color: #fff;
  width: 500px;
  max-height: 90vh;
  margin: 50px 0;
  padding: 20px;
  overflow-y: auto;
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.modal label {
  display: block;
  margin: 8px 0 4px;
  font-weight: bold;
  font-size: 14px;
}

.modal input[type="text"],
.modal input[type="number"],
.modal input[type="date"],
.modal select {
  width: 100%;
  padding: 6px 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.modal button {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal button:hover {
  background-color: #0056b3;
}
</style>
