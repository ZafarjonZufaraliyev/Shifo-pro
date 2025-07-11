<template>
  <div class="warehouse-table">
    <!-- Header -->
    <h2 class="header">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M3 7l9-4 9 4m-1 8a8 8 0 11-16 0M4 7v8a8 8 0 0016 0V7"
        />
      </svg>
      Ombordagi Mahsulotlar
    </h2>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mahsulot nomi</th>
            <th>O'lchami</th>
            <th>Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in products" :key="item.id" :class="index % 2 === 0 ? 'even' : ''">
            <td>{{ index + 1 }}</td>
            <td class="product-name">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-inline"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 3h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" />
              </svg>
              {{ item.name }}
            </td>
            <td>{{ item.size }}</td>
            <td class="note">{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const products = ref([
  { id: 1, name: "Un", size: "50 kg", note: "Yangi yetkazib berilgan" },
  { id: 2, name: "Shakar", size: "25 kg", note: "Talab yuqori" },
  { id: 3, name: "Oʻsimlik yogʻi", size: "10 l", note: "Yaroqlilik muddati: 2025-11" },
  { id: 4, name: "Guruch", size: "20 kg", note: "Premium toifa" },
]);
</script>

<style scoped>
.warehouse-table {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #5c3d99;
}

.icon {
  width: 32px;
  height: 32px;
  stroke: #7c3aed;
}

/* Table wrapper */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fafafa;
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
}

th {
  background-color: #6b46c1;
  color: white;
  text-transform: uppercase;
  font-weight: 700;
}

tr.even {
  background-color: #f3f2f7;
}

.product-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.icon-inline {
  width: 18px;
  height: 18px;
  fill: #d53f8c;
  flex-shrink: 0;
}

.note {
  font-style: italic;
  font-size: 13px;
  color: #666;
}
</style>
