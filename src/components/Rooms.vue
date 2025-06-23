<template>
  <div class="rooms-page">
    <h2 class="title">Xonalar ro'yxati</h2>

    <div class="filter-container">
  <label for="roomType" class="filter-label">Xona turi bo‘yicha saralash:</label>
  <div class="custom-select-wrapper">
    <select id="roomType" v-model="selectedType" class="custom-select">
      <option value="">Barchasi</option>
      <option value="LUX">LUX</option>
      <option value="Standart">Standart</option>
    </select>
  </div>
</div>

    <table class="rooms-table">
      <thead>
        <tr>
          <th>Xona raqami</th>
          <th>Xona turi</th>
          <th>Narxi</th>
          <th>Joylashuvi</th>
          <th>Holati</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="room in filteredRooms"
          :key="room.id"
        >
          <td>{{ room.number }}</td>
          <td>{{ room.type }}</td>
          <td>{{ formatPrice(room.price) }}</td>
          <td>{{ room.floor }}</td>
          <td>
            <span
              class="badge"
              :class="room.status === 'Bo‘sh' ? 'free' : 'busy'"
            >
              {{ room.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import "@/assets/css/xona.css"
export default {
  data() {
    return {
      selectedType: '',
      rooms: [
        { id: 1, number: 1, type: 'LUX', price: 250000, floor: '2-qavat', status: 'Bo‘sh' },
        { id: 2, number: 2, type: 'LUX', price: 250000, floor: '2-qavat', status: 'Band' },
        { id: 3, number: 3, type: 'LUX', price: 250000, floor: '2-qavat', status: 'Band' },
        { id: 4, number: 4, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Band' },
        { id: 5, number: 5, type: 'LUX', price: 260000, floor: '2-qavat', status: 'Band' },
        { id: 6, number: 6, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Bo‘sh' },
        { id: 7, number: 7, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Band' },
        { id: 8, number: 8, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Bo‘sh' },
        { id: 9, number: 9, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Band' },
        { id: 10, number: 10, type: 'Standart', price: 250000, floor: '2-qavat', status: 'Bo‘sh' }
      ]
    }
  },
  computed: {
    filteredRooms() {
      if (this.selectedType) {
        return this.rooms.filter(room => room.type === this.selectedType)
      }
      return this.rooms
    }
  },
  methods: {
    formatPrice(val) {
      return val.toLocaleString('uz-UZ') + ' soʻm'
    }
  }
}
</script>

<style scoped>

</style>
