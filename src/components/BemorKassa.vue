<template>
  <div class="container">
    <h2>Bemorlar To‘lovlari</h2>

    <!-- Filtrlar -->
    <div class="filters">
      <!-- To‘lov turi olib tashlandi -->
      <!-- Qayerdan bo‘yicha qidiruv olib tashlandi -->

      <!-- Davolanish statusi -->
      <select v-model="davolanishStatus" @change="fetchPatientPayments(1)">
        <option value="">Hammasi</option>
        <option value="1">Davolanmoqda</option>
        <option value="0">Tugagan</option>
      </select>

      <!-- Qidirish tugmasi -->
      <button class="search-btn" @click="fetchPatientPayments(1)">🔍 Qidirish</button>
    </div>

    <!-- To‘lovlar jadvali -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>F.I.Sh</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>So‘nggi to‘lov vaqti</th>
          <th>Naqd</th>
          <th>Click</th>
          <th>Karta</th>
          <th>Balans</th>
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
          <td>{{ payment.client || '0' }}</td>
          <td>{{ payment.phone || '0' }}</td>
          <td>{{ payment.address || '0' }}</td>
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
            {{ payment.status === 'qarzdor' ? 'Qarzdor' : payment.status === 'haqdor' ? 'Haqdor' : '-' }}
          </td>
          <td>{{ getPaymentUsername(payment) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Ma'lumot yo‘q -->
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

      <button
        v-if="pagesToShow[pagesToShow.length - 1] < lastPage"
        @click="changePage(lastPage)"
      >
        ... {{ lastPage }}
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
const perPage = ref(50)
const totalItems = ref(0)
const lastPage = ref(1)

// Faqat davolanish statusi filtr uchun
const davolanishStatus = ref('')

const router = useRouter()

const fetchPatientPayments = async (page = 1) => {
  try {
    const params = {
      page,
      // Sana va matnli qidiruv parametrlari olib tashlandi
      davolanish_status: davolanishStatus.value || null,
    }

    const res = await api.get('public/api/v1/patient_payments', { params })
    const data = res.data
    
    console.log(data  )
    payments.value = (data.data || []).filter(p => {
      if (davolanishStatus.value === '1') {
        // Davolanmoqda bo'lsa, barcha yozuvlar
        return true
      } else {
        // Boshqalari uchun balans 0 bo'lmaganlar
        return p.balance !== 0 && p.balance !== null && p.balance !== undefined
      }
    })

    currentPage.value = data.current_page || 1
    perPage.value = data.per_page || 50
    totalItems.value = data.total || 0
    lastPage.value = data.last_page || 1
  } catch (error) {
    console.error('Xatolik patient_payments:', error)
  }
}

const getPaymentTotal = (payment, type) => {
  if (!payment.payments || !Array.isArray(payment.payments)) return 0
  return payment.payments.reduce((sum, p) => sum + Number(p[type] || 0), 0)
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '-'
  const absAmount = Math.abs(amount)
  return (amount < 0 ? '-' : '') + new Intl.NumberFormat('uz-UZ').format(absAmount)
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

const getClientId = (payment) => {
  return payment.client_id || null
}

const goToPaymentPage = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert('Bemor ID topilmadi!')
  }
}

const goToPayment = (payment) => {
  goToPaymentPage(payment)
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchPatientPayments(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const pagesToShow = computed(() => {
  const total = lastPage.value
  const current = currentPage.value
  const delta = 2
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (current <= delta) end = Math.min(total, 1 + 4)
  if (current + delta > total) start = Math.max(1, total - 4)

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  fetchPatientPayments()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.filters input,
.filters select {
  padding: 8px 12px;
  font-size: 15px;
  border: 1.8px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.3s ease;
  min-width: 160px;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.search-btn {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  box-shadow: 0 2px 6px rgb(0 123 255 / 0.4);
  user-select: none;
}

.search-btn:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 12px rgb(0 86 179 / 0.6);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14.5px;
  min-width: 900px;
}

thead tr {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  user-select: none;
}

thead th {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 2px solid #0056b3;
}

tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: #f0f7ff;
}

tbody td {
  padding: 10px 14px;
  vertical-align: middle;
  white-space: nowrap;
}

.amount {
  text-align: right;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #444;
}

.qarz-link {
  cursor: pointer;
  font-weight: 700;
  user-select: none;
}

.qarzdor {
  color: #d32f2f; /* To‘q qizil */
}

.haqdor {
  color: #388e3c; /* To‘q yashil */
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  user-select: none;
}

.pagination button {
  background-color: #f1f3f5;
  border: 1.5px solid #ddd;
  padding: 8px 14px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgb(0 123 255 / 0.5);
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: #f9f9f9;
  color: #999;
  border-color: #eee;
}

.pagination button.active {
  background-color: #0056b3;
  color: white;
  border-color: #0056b3;
  cursor: default;
  box-shadow: 0 0 8px rgb(0 86 179 / 0.7);
}

.no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 18px;
  font-weight: 600;
  color: #666;
  user-select: none;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
</style>
