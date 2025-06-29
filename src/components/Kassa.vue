<template>
  <div class="kassa-page">
    <h2>💳 KASSA SAHIFASI</h2>

    <!-- Qidiruv -->
    <input
      type="text"
      v-model="searchQuery"
      placeholder="🔍 Ism yoki familiya orqali qidirish"
      class="search-input"
    />

    <!-- Bemorlar jadvali -->
    <div class="table-wrapper">
      <table class="client-table">
        <thead>
          <tr>
            <th>Ismi</th>
            <th>Familiyasi</th>
            <th>💰 Qarzi</th>
            <th>✅ To'langan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in paginatedClients"
            :key="client.id"
            @click="selectClient(client)"
            class="clickable-row"
          >
            <td>{{ client.ism }}</td>
            <td>{{ client.familiya }}</td>
            <td>{{ getTotalDebt(client.id).toLocaleString() }} so'm</td>
            <td>{{ getTotalPaid(client.id).toLocaleString() }} so'm</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sahifalash -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">⬅</button>
      <span>Sahifa {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">➡</button>
    </div>

    <!-- Modal -->
    <div v-if="selectedClient" class="modal-overlay" @click="closeModal">
      <div class="modal payment-modal" @click.stop>
        <button class="close-btn" @click="selectedClient = null">✖</button>

        <h3 class="modal-title">{{ selectedClient.ism }} {{ selectedClient.familiya }}</h3>

        <div class="info-box">
          <p @click="showDebts = !showDebts"><strong>💰 Qarzi:</strong> {{ totalDebt }} so'm</p>
          <ul v-if="showDebts">
            <li v-for="d in debts" :key="d.id">
              • {{ d.nomi }} – {{ d.summa.toLocaleString() }} so'm
            </li>
          </ul>
        </div>

        <div class="info-box">
          <p @click="showPayments = !showPayments"><strong>✅ To‘lagan:</strong> {{ totalPaid }} so'm</p>
          <ul v-if="showPayments">
            <li v-for="p in payments" :key="p.id">
              • {{ p.nomi }} – {{ p.summa.toLocaleString() }} so'm
            </li>
          </ul>
        </div>

        <div class="form-box payment-box">
          <h4>💸 To‘lov summasi va usuli</h4>
          <input type="number" v-model="payment.amount" placeholder="💵 Summani kiriting" class="pay-input" />
          <div class="method-group">
            <label :class="{ active: payment.method === 'naqd' }" @click="payment.method = 'naqd'">Naqd</label>
            <label :class="{ active: payment.method === 'karta' }" @click="payment.method = 'karta'">Karta</label>
            <label :class="{ active: payment.method === 'click' }" @click="payment.method = 'click'">Click</label>
          </div>
          <button class="confirm-btn" @click="submitPayment">✅ To‘lov qilish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Fake ma'lumotlar
const clients = ref([
  { id: 1, ism: 'Ali', familiya: 'Valiyev' },
  { id: 2, ism: 'Dilshod', familiya: 'Nazarov' },
  { id: 3, ism: 'Madina', familiya: 'Sobirova' },
  { id: 4, ism: 'Javohir', familiya: 'Karimov' },
  { id: 5, ism: 'Lola', familiya: 'Xolmatova' }
])

const debtsData = ref({
  1: [{ id: 1, nomi: 'Muolaja', summa: 300000 }],
  2: [{ id: 2, nomi: 'UZI', summa: 150000 }],
  3: [],
  4: [{ id: 3, nomi: 'Tahlil', summa: 200000 }],
  5: [{ id: 4, nomi: 'EKO xizmat', summa: 450000 }]
})

const paymentsData = ref({
  1: [{ id: 1, nomi: 'Muolaja', summa: 100000 }],
  2: [],
  3: [{ id: 2, nomi: 'Xizmat', summa: 250000 }],
  4: [],
  5: [{ id: 3, nomi: 'EKO xizmat', summa: 100000 }]
})

const searchQuery = ref('')
const selectedClient = ref(null)
const currentPage = ref(1)
const itemsPerPage = 5
const showDebts = ref(false)
const showPayments = ref(false)
const payment = ref({ amount: 0, method: 'naqd' })

const debts = ref([])
const payments = ref([])

const filteredClients = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return !query
    ? clients.value
    : clients.value.filter(c =>
        (c.ism + ' ' + c.familiya).toLowerCase().includes(query)
      )
})

const totalPages = computed(() => Math.ceil(filteredClients.value.length / itemsPerPage))
const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredClients.value.slice(start, start + itemsPerPage)
})

const getTotalDebt = (id) =>
  debtsData.value[id]?.reduce((sum, d) => sum + d.summa, 0) || 0
const getTotalPaid = (id) =>
  paymentsData.value[id]?.reduce((sum, p) => sum + p.summa, 0) || 0

const totalDebt = computed(() => debts.value.reduce((sum, d) => sum + d.summa, 0))
const totalPaid = computed(() => payments.value.reduce((sum, p) => sum + p.summa, 0))

const selectClient = (client) => {
  selectedClient.value = client
  debts.value = debtsData.value[client.id] ? [...debtsData.value[client.id]] : []
  payments.value = paymentsData.value[client.id] ? [...paymentsData.value[client.id]] : []
  showDebts.value = false
  showPayments.value = false
}

const closeModal = () => (selectedClient.value = null)

// To'lov amalga oshirilganda qarzdorlikni yangilash funksiyasi
const submitPayment = () => {
  const amount = Number(payment.value.amount)
  if (!amount || amount <= 0) return alert("⚠️ To‘lov summasini kiriting.")
  if (amount > totalDebt.value) return alert("❌ To‘lov summasi qarzdorlikdan oshmasligi kerak.")

  // Qarzdorlikni kamaytirish uchun qarzlardan pul yechamiz
  let remaining = amount
  const clientId = selectedClient.value.id

  // debtsData ni klonlaymiz (reaktivlik uchun)
  const updatedDebts = debtsData.value[clientId] ? [...debtsData.value[clientId]] : []

  // To'lovni qarzlarga kamaytiramiz ketma-ket
  for (let i = 0; i < updatedDebts.length; i++) {
    if (remaining <= 0) break

    if (updatedDebts[i].summa <= remaining) {
      remaining -= updatedDebts[i].summa
      updatedDebts[i].summa = 0
    } else {
      updatedDebts[i].summa -= remaining
      remaining = 0
    }
  }

  // Qarzi 0 ga teng bo'lganlarni olib tashlaymiz
  debtsData.value[clientId] = updatedDebts.filter(d => d.summa > 0)

  // To'lovlarga yangi yozuv qo'shamiz
  const newPayment = {
    id: Date.now(),
    nomi: 'To‘lov',
    summa: amount,
    usul: payment.value.method
  }
  if (!paymentsData.value[clientId]) paymentsData.value[clientId] = []
  paymentsData.value[clientId].push(newPayment)

  // Modalda ham yangilaymiz
  debts.value = debtsData.value[clientId] ? [...debtsData.value[clientId]] : []
  payments.value = paymentsData.value[clientId] ? [...paymentsData.value[clientId]] : []

  alert("✅ To‘lov amalga oshirildi.")
  payment.value.amount = 0
  payment.value.method = 'naqd'
  selectedClient.value = null
}
</script>


<!-- CSS MOSH STYLE -->
<style scoped>
/* === Modal overlay === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(44, 62, 80, 0.85);
  backdrop-filter: blur(7px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 12000;
  opacity: 0;
  animation: fadeInOverlay 0.35s forwards;
  padding: 20px;
  box-sizing: border-box;
}

@keyframes fadeInOverlay {
  to {
    opacity: 1;
  }
}

/* === Modal oynasi === */
.modal.payment-modal {
  background: linear-gradient(135deg, #f5f8ff, #dce6ff);
  border-radius: 18px;
  padding: 2.5rem 2.8rem;
  max-width: 460px;
  width: 100%;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 0 0 3px #a9baff;
  border: 3px solid transparent;
  transform-origin: center center;
  animation: scaleInModal 0.35s ease forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  position: relative;
}

@keyframes scaleInModal {
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.modal.payment-modal:hover {
  border-color: #5879ff;
}

/* Modal sarlavhasi */
.modal-title {
  font-weight: 800;
  font-size: 1.8rem;
  color: #324f9a;
  margin-bottom: 1.3rem;
  text-align: center;
  text-shadow: 1px 1px 3px #c0d0ff;
}

/* Yopish tugmasi */
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #66788a;
  transition: color 0.25s;
  user-select: none;
}
.close-btn:hover {
  color: #324f9a;
}

/* Info box */
.info-box {
  margin-top: 16px;
  background: #e5ecff;
  padding: 14px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
  user-select: none;
}
.info-box:hover {
  background: #c7d7ff;
}

/* List inside info box */
.info-box ul {
  margin-top: 8px;
  padding-left: 18px;
  color: #1f2a4d;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Form box */
.form-box.payment-box {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pay-input {
  padding: 14px 16px;
  border: 2px solid #a3b0ff;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: #2a3a6d;
  background: #f6f9ff;
  box-shadow: inset 1px 1px 8px #d0dbff;
  transition: border-color 0.3s ease;
}
.pay-input:focus {
  outline: none;
  border-color: #5879ff;
  box-shadow: 0 0 12px #5879ffaa;
}

/* To‘lov usuli toggle */
.method-group {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.method-group label {
  flex: 1;
  text-align: center;
  background: #e2e9ff;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  color: #324f9a;
  transition: background 0.25s ease, transform 0.25s ease;
  user-select: none;
  box-shadow: 0 4px 8px #bbccffaa inset;
}
.method-group label.active {
  background: #2c3e50;
  color: #ffffff;
  box-shadow: 0 0 14px #5879ffcc;
  transform: scale(1.1);
}

/* To‘lov tasdiqlash tugmasi */
.confirm-btn {
  padding: 14px 0;
  background: linear-gradient(45deg, #536dfe, #89a7ff);
  color: white;
  font-size: 1.1rem;
  font-weight: 900;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 9px 20px #5b77f6cc;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}
.confirm-btn:hover {
  background: linear-gradient(45deg, #4059e7, #4a6ee8);
  box-shadow: 0 12px 28px #4570e3cc;
}

/* Responsive */
@media (max-width: 600px) {
  .modal.payment-modal {
    padding: 1.8rem 2rem;
    max-width: 100%;
  }
  .pay-input {
    font-size: 0.95rem;
  }
  .method-group label {
    font-size: 0.9rem;
  }
  .confirm-btn {
    font-size: 1rem;
  }
}

.kassa-page {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #0d6efd;
}

.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

.table-wrapper {
  overflow-x: auto;
}

.client-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.client-table th, .client-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.client-table th {
  background-color: #f1f3f5;
}

.clickable-row {
  transition: background 0.3s ease;
  cursor: pointer;
}

.clickable-row:hover {
  background: #e7f1ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #dbeafe;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal.payment-modal {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  position: relative;
}

.modal-title {
  font-size: 20px;
  margin-bottom: 12px;
  color: #0d6efd;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.info-box {
  margin-top: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.3s;
  cursor: pointer;
}

.info-box:hover {
  background: #eef6ff;
}

.form-box.payment-box {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pay-input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
}

.method-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.method-group label {
  flex: 1;
  text-align: center;
  background: #e9ecef;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  user-select: none;
}

.method-group label.active {
  background: #0d6efd;
  color: white;
  font-weight: bold;
  transform: scale(1.05);
}

.confirm-btn {
  padding: 12px;
  background: #0d6efd;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.confirm-btn:hover {
  background: #0a58ca;
}

@media (max-width: 768px) {
  .kassa-page {
    margin: 20px;
    padding: 10px;
  }
  .modal {
    padding: 20px;
  }
  .form-box input,
  .form-box select,
  .form-box button,
  .method-group label {
    font-size: 14px;
  }
  .pagination span {
    font-size: 14px;
  }
}
</style>