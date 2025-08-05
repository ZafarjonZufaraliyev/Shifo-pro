<template>
  <div class="container">
    <h2>Bemorlar To‘lovlari</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>F.I.Sh</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>To‘lov vaqti</th>
          <th>Naqd</th>
          <th>Click</th>
          <th>Karta</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Kassir</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(payment, index) in payments"
          :key="payment.id || index"
          @click="goToPayment(payment)"
          class="clickable-row"
        >
          <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
          <td>{{ getClientName(payment) }}</td>
          <td>{{ payment.phone || '-' }}</td>
          <td>{{ payment.address || '-' }}</td>
          <td>{{ formatDate(getPaymentDatetime(payment)) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'cash')) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'click')) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'card')) }}</td>
          <td class="amount">{{ formatAmount(payment.balance) }}</td>
          <td
            class="amount qarz-link"
            @click.stop="goToPaymentPage(payment)"
            :class="{ 'qarzdor': payment.status === 'qarzdor', 'haqdor': payment.status === 'haqdor' }"
          >
            {{ payment.status === 'qarzdor' ? 'Qarzdor' : (payment.status === 'haqdor' ? 'Haqdor' : '-') }}
          </td>
          <td>{{ getPaymentUsername(payment) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="payments.length === 0" class="no-data">Ma’lumotlar yo‘q</p>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        &lt; Oldingi
      </button>

      <button
        v-for="page in pagesToShow"
        :key="page"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
        Keyingi &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const payments = ref([])
const currentPage = ref(1)
const perPage = ref(50) // serverdan kelgan per_page
const totalItems = ref(0)
const lastPage = ref(1)
const router = useRouter()

const fetchPatientPayments = async (page = 1) => {
  try {
    const res = await api.get('public/api/v1/patient_payments', {
      params: { page }
    })
    const data = res.data

    payments.value = data.data || []
    currentPage.value = data.current_page || 1
    perPage.value = data.per_page || 50
    totalItems.value = data.total || 0
    lastPage.value = data.last_page || 1
  } catch (error) {
    console.error("Xatolik patient_payments:", error)
  }
}

const getPaymentTotal = (payment, type) => {
  if (!payment.payments || !Array.isArray(payment.payments)) return 0
  return payment.payments.reduce((sum, p) => sum + Number(p[type] || 0), 0)
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '-'
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('uz-UZ').format(absAmount)
  return amount < 0 ? `-${formatted}` : formatted
}

const formatDate = (datetime) => {
  return datetime?.split(' ')[0] || '-'
}

const getPaymentDatetime = (payment) => {
  return payment.payments?.[0]?.datetime || ''
}

const getPaymentUsername = (payment) => {
  return payment.payments?.[0]?.username || '-'
}

const getClientName = (payment) => {
  if (typeof payment.client === 'object' && payment.client) {
    return `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim()
  }
  return typeof payment.client === 'string' ? payment.client : 'Nomaʼlum'
}

const getClientId = (payment) => {
  if (payment.client_id) return payment.client_id
  if (typeof payment.client === 'object' && payment.client?.id) return payment.client.id
  return null
}

const goToPaymentPage = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert("Bemor ID topilmadi!")
  }
}

const goToPayment = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert("Bemor ma'lumotlari topilmadi!")
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchPatientPayments(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Pagination uchun ko‘rsatish tugmalari soni (misol uchun 5 ta)
const pagesToShow = computed(() => {
  const total = lastPage.value
  const current = currentPage.value
  const delta = 2 // oldida va orqasida ko‘rsatish soni
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  // Agar boshlanish juda kichik bo‘lsa, oxirga qo‘shamiz
  if (current <= delta) {
    end = Math.min(total, 1 + 4)
  }
  // Agar oxir juda yaqin bo‘lsa, boshini kengaytiramiz
  if (current + delta > total) {
    start = Math.max(1, total - 4)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

onMounted(() => {
  fetchPatientPayments()
})
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background-color: #fff;
}

h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.amount {
  font-weight: bold;
  color: green;
}

tr:hover {
  background-color: #f9f9f9;
}

.clickable-row {
  cursor: pointer;
}

.no-data {
  text-align: center;
  color: gray;
  font-style: italic;
}

.qarz-link {
  cursor: pointer;
  text-decoration: underline;
}

.qarzdor {
  color: red;
  font-weight: 700;
}

.haqdor {
  color: green;
  font-weight: 700;
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 10px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  pointer-events: none;
}
</style>
