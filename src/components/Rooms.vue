<template>
  <div class="rooms-page">
    <h2 class="title">🏨 Xonalar ro'yxati</h2>

    <!-- Filterlar -->
    <div class="filter-container">
      <div class="filter-group">
        <label for="roomType" class="filter-label">Xona turi:</label>
        <select id="roomType" v-model="selectedType" class="custom-select">
          <option value="">Barchasi</option>
          <option value="LUX">LUX</option>
          <option value="Standart">Standart</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="search" class="filter-label">Qidiruv:</label>
        <input
          type="text"
          id="search"
          v-model="searchQuery"
          placeholder="Masalan: 107 yoki LUX"
          class="custom-select"
        />
      </div>

      <div class="filter-group capacity-filter">
        <label for="capacity" class="filter-label">Odam soni:</label>
        <select id="capacity" v-model.number="selectedCapacity" class="custom-select">
          <option value="">Barchasi</option>
          <option v-for="n in maxCapacity" :key="n" :value="n">{{ n }} kishi</option>
        </select>
      </div>

      <div class="filter-group btn-group">
        <button class="filter-btn" @click="applyFilterAndGo">
          Filter va Ko'rish
        </button>
      </div>
    </div>

    <!-- Jadval -->
    <div class="table-wrapper">
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Raqam</th>
            <th>Turi</th>
            <th>Narxi</th>
            <th>Qavat</th>
            <th>Kapasitet</th>
            <th>Holati</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in filteredRooms" :key="room.id">
            <td>
              <router-link :to="`/room/${room.id}`" class="room-link">
                {{ room.number }}
              </router-link>
            </td>
            <td>{{ room.type }}</td>
            <td>{{ formatPrice(room.price) }}</td>
            <td>{{ room.floor }}</td>
            <td>{{ room.capacity }} kishi</td>
            <td>
              <span class="badge" :class="room.status === 'Bo‘sh' ? 'free' : 'busy'">
                {{ room.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedType: '',
      searchQuery: '',
      selectedCapacity: '',
      rooms: [
        { id: 1, number: 107, type: 'LUX', price: 250000, floor: '2-qavat', capacity: 2, status: 'Bo‘sh' },
        { id: 2, number: 2, type: 'LUX', price: 250000, floor: '2-qavat', capacity: 3, status: 'Band' },
        { id: 3, number: 3, type: 'LUX', price: 250000, floor: '2-qavat', capacity: 2, status: 'Band' },
        { id: 4, number: 4, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 1, status: 'Band' },
        { id: 5, number: 5, type: 'LUX', price: 260000, floor: '2-qavat', capacity: 3, status: 'Band' },
        { id: 6, number: 6, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 2, status: 'Bo‘sh' },
        { id: 7, number: 7, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 1, status: 'Band' },
        { id: 8, number: 8, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 2, status: 'Bo‘sh' },
        { id: 9, number: 9, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 1, status: 'Band' },
        { id: 10, number: 10, type: 'Standart', price: 250000, floor: '2-qavat', capacity: 2, status: 'Bo‘sh' }
      ]
    };
  },
  computed: {
    maxCapacity() {
      // Roomlardagi maksimal kapasitetni topamiz (filter uchun)
      return Math.max(...this.rooms.map(r => r.capacity));
    },
    filteredRooms() {
      let result = this.rooms;

      if (this.selectedType) {
        result = result.filter(room => room.type === this.selectedType);
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(room =>
          room.type.toLowerCase().includes(query) ||
          room.number.toString().includes(query)
        );
      }

      if (this.selectedCapacity) {
        result = result.filter(room => room.capacity === this.selectedCapacity);
      }

      return result;
    }
  },
  methods: {
    formatPrice(val) {
      return val.toLocaleString('uz-UZ') + ' soʻm';
    },
    applyFilterAndGo() {
      // Filter natijasidan birinchi xona id sini olib
      if (this.filteredRooms.length) {
        const firstRoomId = this.filteredRooms[0].id;
        this.$router.push({ path: `/room/${firstRoomId}` });
      } else {
        alert("Ushbu mezonlarga mos xona topilmadi!");
      }
    }
  }
};
</script>

<style scoped>
.rooms-page {
  max-width: 1200px;
  margin-left: 270px;
  padding: 20px;
  background: #f9fcff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 28px;
  margin-bottom: 25px;
  font-weight: 700;
  text-align: center;
  color: #1a6291;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
}

.filter-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.custom-select {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.custom-select:focus {
  border-color: #1a6291;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 98, 145, 0.15);
}

.btn-group {
  width: 150px;
}

.filter-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.filter-btn:hover {
  background-color: #43a047;
}

.table-wrapper {
  overflow-x: auto;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.rooms-table th,
.rooms-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
}

.rooms-table th {
  background-color: #e6f1ff;
  font-weight: 600;
  color: #1a1a1a;
}

.rooms-table td {
  border-bottom: 1px solid #eee;
}

.room-link {
  color: #1a6291;
  font-weight: 600;
  text-decoration: none;
}

.room-link:hover {
  text-decoration: underline;
  color: #144a6a;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  min-width: 70px;
}

.free {
  background-color: #28a745;
}

.busy {
  background-color: #dc3545;
}

@media (max-width: 768px) {
  .rooms-page {
    margin-left: 0;
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .rooms-table th,
  .rooms-table td {
    font-size: 13px;
    padding: 10px;
  }

  .filter-group {
    width: 100%;
  }

  .btn-group {
    width: 100%;
  }
}
</style>
