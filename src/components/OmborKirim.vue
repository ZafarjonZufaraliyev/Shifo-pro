<template>
  <div class="warehouse-receive">
    <!-- Header -->
    <h2 class="header">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 8v4l3 3m5-12l-9-4-9 4m18 0l-9 4m9-4v6a9 9 0 11-18 0V6" />
      </svg>
      Omborga Kelgan Mahsulotlar
    </h2>

    <!-- Input form -->
    <div class="input-card">
      <div class="grid">
        <input v-model="newItem.name" placeholder="Mahsulot nomi" class="input" />
        <input v-model.number="newItem.qty" type="number" min="1" placeholder="Miqdori" class="input" />
        <input v-model.number="newItem.amount" type="number" min="0" placeholder="Summasi (soʻm)" class="input" />
        <input v-model="newItem.date" type="date" class="input" />
        <input v-model="newItem.source" placeholder="Qayerdan" class="input" />
        <input v-model="newItem.note" placeholder="Izoh" class="input" />
      </div>
      <button @click="addItem" :disabled="!isValid" class="btn">
        ＋ Qo‘shish
      </button>
    </div>

    <!-- Items table -->
    <div v-if="items.length" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mahsulot nomi</th>
            <th>Miqdori</th>
            <th>Summasi</th>
            <th>Sana</th>
            <th>Qayerdan</th>
            <th>Izoh</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id" :class="index % 2 === 0 ? 'even' : ''">
            <td>{{ index + 1 }}</td>
            <td class="bold">{{ item.name }}</td>
            <td>{{ item.qty }}</td>
            <td>{{ fmtCurrency(item.amount) }}</td>
            <td>{{ fmtDate(item.date) }}</td>
            <td>{{ item.source }}</td>
            <td class="italic small">{{ item.note }}</td>
            <td class="text-right">
              <button @click="removeItem(index)" class="btn-remove" title="O‘chirish">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <p v-else class="empty-state">Hozircha hech narsa qo‘shilmagan.</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const newItem = ref({
  name: "",
  qty: 1,
  amount: 0,
  date: todayISO(),
  source: "",
  note: "",
});

const items = ref([]);

// Validation: nom va miqdor bo‘lishi kerak
const isValid = computed(() => newItem.value.name.trim() && newItem.value.qty > 0);

function resetForm() {
  Object.assign(newItem.value, {
    name: "",
    qty: 1,
    amount: 0,
    date: todayISO(),
    source: "",
    note: "",
  });
}

function addItem() {
  if (!isValid.value) return;
  items.value.push({ id: Date.now(), ...newItem.value });
  resetForm();
}

function removeItem(index) {
  items.value.splice(index, 1);
}

function fmtCurrency(val) {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
  }).format(val);
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("uz-UZ");
}
</script>

<style scoped>
.warehouse-receive {
  max-width: 1200px;
  margin: 20px auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #0f766e;
}

.icon {
  height: 32px;
  width: 32px;
  stroke: #34d399;
}

/* Input form */
.input-card {
  background: #f9fafb;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 32px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.05);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.input {
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 16px;
  border: 1.5px solid #ccc;
  outline: none;
  transition: border-color 0.3s ease;
}

.input:focus {
  border-color: #0f766e;
  background-color: #ecfdf5;
}

/* Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  background: linear-gradient(90deg, #10b981, #06b6d4);
  border: none;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: box-shadow 0.3s ease;
  margin: 0 auto;
  font-size: 18px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
}

.btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.1);
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 15px;
}

th {
  background-color: #0f766e;
  color: white;
  text-transform: uppercase;
  font-weight: 700;
}

tr.even {
  background-color: #f3f4f6;
}

.bold {
  font-weight: 700;
}

.italic {
  font-style: italic;
}

.small {
  font-size: 13px;
  color: #6b7280;
}

.text-right {
  text-align: right;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #ef4444;
  font-weight: 700;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  transition: color 0.3s ease;
}

.btn-remove:hover {
  color: #b91c1c;
}

/* Empty state */
.empty-state {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  margin-top: 40px;
  font-size: 17px;
}
</style>
