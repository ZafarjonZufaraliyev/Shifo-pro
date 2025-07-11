<template>
  <div class="oshxona-page">
    <h2>🍽️ Oshxona Chiqimlar</h2>

    <!-- 🔎 Sana filtri -->
    <div class="filter">
      <label>📅 Sanani tanlang:</label>
      <input type="date" v-model="filterDate" />
      <button @click="clearFilter" class="btn-clear">Filterni tozalash</button>
    </div>

    <!-- 📋 Chiqimlar jadvali -->
    <div v-if="filteredItems.length" class="group">
      <table class="product-table">
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Miqdori</th>
            <th>Qayerga</th>
            <th>Sana va Vaqt</th>
            <th>Tasdiq</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredItems" :key="index">
            <td>{{ item.nomi }}</td>
            <td>{{ item.miqdori }} {{ item.birlik }}</td>
            <td>{{ item.dest }}</td>
            <td>{{ formatDateTime(item.date, item.time) }}</td>
            <td>
              <span :class="item.status === 'tasdiqlandi' ? 'confirmed' : 'pending'">
                {{ item.status === 'tasdiqlandi' ? 'Tasdiqlandi' : 'Tasdiqlanmadi' }}
              </span>
            </td>
            <td>
              <button
                v-if="item.status === 'tasdiqlanmadi'"
                @click="tasdiqlash(index)"
                class="btn-approve"
              >
                ✅ Tasdiqlash
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="no-data">Hech qanday chiqim topilmadi.</div>
  </div>
</template>

<script>
export default {
  name: 'OshxonaChiqim',
  data() {
    return {
      filterDate: '',
      items: [
        { nomi: 'Kartoshka', miqdori: 15, birlik: 'kg', dest: 'Oshxona', date: '2025-07-11', time: '07:00', status: 'tasdiqlanmadi' },
        { nomi: 'Piyoz', miqdori: 5, birlik: 'kg', dest: 'Oshxona', date: '2025-07-11', time: '07:05', status: 'tasdiqlanmadi' },
        { nomi: 'Yog‘',  miqdori: 2,  birlik: 'l',  dest: 'Oshxona', date: '2025-07-10', time: '11:30', status: 'tasdiqlandi' },
        { nomi: 'Go‘sht', miqdori: 10, birlik: 'kg', dest: 'Oshxona', date: '2025-07-09', time: '10:00', status: 'tasdiqlandi' },
      ],
    }
  },
  computed: {
    filteredItems() {
      if (this.filterDate) {
        return this.items.filter(item => item.date === this.filterDate);
      }
      return this.items;
    }
  },
  methods: {
    clearFilter() {
      this.filterDate = '';
    },
    tasdiqlash(index) {
      const filtered = this.filteredItems;
      const item = filtered[index];

      const realIndex = this.items.findIndex(i => 
        i.nomi === item.nomi &&
        i.date === item.date &&
        i.time === item.time &&
        i.miqdori === item.miqdori
      );

      if (realIndex !== -1) {
        this.$set(this.items, realIndex, { ...this.items[realIndex], status: 'tasdiqlandi' });
      }
    },
    formatDateTime(date, time) {
      return `${date} ${time}`;
    }
  }
}
</script>


<style scoped>
.oshxona-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1A6291;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.filter {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.filter label {
  font-weight: 600;
}

.filter input[type='date'] {
  padding: 6px 10px;
  font-size: 16px;
  border: 2px solid #1A6291;
  border-radius: 6px;
}

.btn-clear {
  background-color: #1A6291;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-clear:hover {
  background-color: #14507a;
}

.group {
  margin-top: 20px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #f9fbfd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(26, 98, 145, 0.2);
}

.product-table th,
.product-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
}

.product-table th {
  background-color: #1A6291;
  color: white;
  text-transform: uppercase;
  font-weight: 600;
}

.confirmed {
  background-color: #d1f7d6;
  color: #27ae60;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 15px;
  user-select: none;
}

.pending {
  background-color: #fddede;
  color: #e74c3c;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 15px;
  user-select: none;
}

.btn-approve {
  background-color: #1A6291;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-approve:hover {
  background-color: #14507a;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 17px;
  margin-top: 40px;
  user-select: none;
}
</style>
