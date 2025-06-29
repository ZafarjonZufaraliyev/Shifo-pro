<template>
  <div class="kassa-page">
    <h2>💳 KASSA SAHIFASI (DEMO)</h2>

    <!-- Qidiruv -->
    <input
      type="text"
      v-model="searchQuery"
      @input="searchClients"
      placeholder="🔍 Ism yoki familiya orqali qidirish"
      class="search-input"
    />

    <!-- Qidiruv natijalari -->
    <ul v-if="searchResults.length" class="search-results">
      <li
        v-for="client in searchResults"
        :key="client.id"
        @click="selectClient(client)"
      >
         {{ client.ism }} {{ client.familiya }}
      </li>
    </ul>

    <!-- Modal -->
    <div v-if="selectedClient" class="modal-overlay">
      <div class="modal">
        <button class="close-btn" @click="selectedClient = null">✖</button>

        <h3>{{ selectedClient.ism }} {{ selectedClient.familiya }}</h3>

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

        <div class="form-box">
          <h4>💸 Qarzga to‘lov qilish:</h4>
          <input type="number" v-model="payment.amount" placeholder="💵 To‘lov summasi" />
          <select v-model="payment.method">
            <option value="naqd">Naqd</option>
            <option value="karta">Karta</option>
            <option value="click">Click</option>
          </select>
          <button @click="submitPayment">✅ To‘lov qilish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const fakeClients = [
  { id: 1, ism: 'Ali', familiya: 'Valiyev' },
  { id: 2, ism: 'Zarina', familiya: 'Toirova' },
  { id: 3, ism: 'Jasur', familiya: 'Mahmudov' }
]

const fakeDebts = {
  1: [
    { id: 1, nomi: 'Yotoqxona', summa: 200000 },
    { id: 2, nomi: 'Davolash', summa: 150000 }
  ],
  2: [{ id: 3, nomi: 'Massaj', summa: 50000 }],
  3: [
    { id: 4, nomi: 'Diagnostika', summa: 100000 },
    { id: 5, nomi: 'Dori', summa: 80000 }
  ]
}

const fakePayments = {
  1: [{ id: 1, nomi: 'Oldingi to‘lov', summa: 100000 }],
  2: [],
  3: [{ id: 2, nomi: 'Avans', summa: 50000 }]
}

const searchQuery = ref('')
const searchResults = ref([])
const selectedClient = ref(null)

const debts = ref([])
const payments = ref([])
const showDebts = ref(false)
const showPayments = ref(false)

const payment = ref({
  amount: 0,
  method: 'naqd'
})

const totalDebt = computed(() =>
  debts.value.reduce((sum, d) => sum + d.summa, 0)
)
const totalPaid = computed(() =>
  payments.value.reduce((sum, p) => sum + p.summa, 0)
)

const searchClients = () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searchResults.value = fakeClients.filter(c =>
    (c.ism + ' ' + c.familiya).toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const selectClient = (client) => {
  selectedClient.value = client
  debts.value = JSON.parse(JSON.stringify(fakeDebts[client.id] || []))
  payments.value = JSON.parse(JSON.stringify(fakePayments[client.id] || []))
  showDebts.value = false
  showPayments.value = false
}

// 🔁 Modalga klaviatura va tashqi bosish ishlovchilari
const handleKeyEvents = (e) => {
  if (e.key === 'Escape') {
    selectedClient.value = null
  } else if (e.key === 'Enter' && selectedClient.value) {
    submitPayment()
  }
}
onMounted(() => window.addEventListener('keydown', handleKeyEvents))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyEvents))

const closeModal = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    selectedClient.value = null
  }
}

const submitPayment = () => {
  const amount = Number(payment.value.amount)

  if (totalDebt.value <= 0) {
    alert("❌ Bu mijozda qarzdorlik yo‘q.")
    return
  }

  if (!amount || amount <= 0) {
    alert("⚠️ To‘lov summasini kiriting.")
    return
  }

  if (amount > totalDebt.value) {
    alert(`❌ To‘lov summasi (${amount.toLocaleString()}) qarzdorlikdan (${totalDebt.value.toLocaleString()}) oshmasligi kerak.`)
    return
  }

  payments.value.push({
    id: Date.now(),
    nomi: 'Yangi to‘lov',
    summa: amount
  })

  let remaining = amount
  for (let i = 0; i < debts.value.length; i++) {
    if (remaining === 0) break
    if (debts.value[i].summa <= remaining) {
      remaining -= debts.value[i].summa
      debts.value[i].summa = 0
    } else {
      debts.value[i].summa -= remaining
      remaining = 0
    }
  }

  debts.value = debts.value.filter(d => d.summa > 0)

  alert("✅ To‘lov amalga oshirildi.")
  payment.value.amount = 0
  payment.value.method = 'naqd'
  selectedClient.value = null // 🔄 Modalni yopish
}
</script>


<style scoped>
.kassa-page {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff, #f7f9fb);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.kassa-page h2 {
  text-align: center;
  font-size: 26px;
  color: #333;
  margin-bottom: 30px;
}

/* Search input */
.search-input {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: border 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
}

.search-input:focus {
  border-color: #2c7be5;
  box-shadow: 0 0 8px rgba(44, 123, 229, 0.2);
  outline: none;
}

/* Search results */
.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-results li {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results li:hover {
  background-color: #f1f7ff;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal box */
.modal {
  background-color: #fff;
  padding: 30px;
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  right: 14px;
  top: 14px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal h3 {
  margin-bottom: 18px;
  font-size: 22px;
  text-align: center;
  color: #222;
}

/* Info box (qarz / to'lov) */
.info-box {
  margin-top: 20px;
}

.info-box p {
  font-weight: bold;
  cursor: pointer;
  color: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-box ul {
  padding-left: 20px;
  margin-top: 6px;
  color: #555;
  font-size: 15px;
}

/* Form (to‘lov qilish) */
.form-box {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-box input,
.form-box select {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-box input:focus,
.form-box select:focus {
  border-color: #007bff;
  outline: none;
}

.form-box button {
  margin-top: 16px;
  width: 100%;
  padding: 13px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form-box button:hover {
  background-color: #218838;
}

/* RESPONSIVE (mobil va kichik ekranlar) */
@media (max-width: 768px) {
  .kassa-page {
    margin: 20px 16px;
    padding: 18px;
  }

  .modal {
    width: 90%;
    padding: 20px;
  }

  .search-input {
    font-size: 15px;
  }

  .form-box input,
  .form-box select {
    font-size: 14px;
  }

  .form-box button {
    font-size: 15px;
  }
}
</style>
