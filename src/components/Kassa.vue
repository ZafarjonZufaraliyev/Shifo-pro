<template>
  <div class="cashier-system">
    <!-- Navigation Tabs -->
    <div class="navigation-tabs">
      <button :class="{ active: currentTab === 'statistics' }" @click="switchTab('statistics')">
        📊 Statistika
      </button>
      <button :class="{ active: currentTab === 'income' }" @click="switchTab('income')">
        📥 Kirim
      </button>
      <button :class="{ active: currentTab === 'expense' }" @click="switchTab('expense')">
        📤 Chiqim
      </button>
      <button :class="{ active: currentTab === 'patients' }" @click="switchTab('patients')">
        👤 Bemorlar
      </button>
    </div>

    <!-- Statistics Tab -->
    <div v-if="currentTab === 'statistics'" class="tab-content">
      <div class="statistics-grid">
        <!-- Today's Income -->
        <div class="stat-card">
          <h3>📥 Bugungi Kirim</h3>
          <div class="stat-values">
            <div><span>Jami:</span> <strong>{{ formatMoney(todayIncome.total) }} so'm</strong></div>
            <div><span>Naqd:</span> <strong>{{ formatMoney(todayIncome.cash) }} so'm</strong></div>
            <div><span>Karta:</span> <strong>{{ formatMoney(todayIncome.card) }} so'm</strong></div>
            <div><span>Click:</span> <strong>{{ formatMoney(todayIncome.click) }} so'm</strong></div>
            <div><span>Humo:</span> <strong>{{ formatMoney(todayIncome.humo) }} so'm</strong></div>
          </div>
        </div>

        <!-- Today's Expense -->
        <div class="stat-card">
          <h3>📤 Bugungi Chiqim</h3>
          <div class="stat-values">
            <div><span>Jami:</span> <strong>{{ formatMoney(todayExpense.total) }} so'm</strong></div>
            <div><span>Naqd:</span> <strong>{{ formatMoney(todayExpense.cash) }} so'm</strong></div>
            <div><span>Karta:</span> <strong>{{ formatMoney(todayExpense.card) }} so'm</strong></div>
            <div><span>Click:</span> <strong>{{ formatMoney(todayExpense.click) }} so'm</strong></div>
            <div><span>Humo:</span> <strong>{{ formatMoney(todayExpense.humo) }} so'm</strong></div>
          </div>
        </div>

        <!-- Patients Stats -->
        <div class="stat-card">
          <h3>👤 Bemorlar</h3>
          <div class="stat-values">
            <div><span>Jami Qarz:</span> <strong>{{ formatMoney(totalDebt) }} so'm</strong></div>
            <div><span>Bugun Qo'shildi:</span> <strong>{{ formatMoney(todayAddedDebt) }} so'm</strong></div>
            <div><span>Bugun To'langan:</span> <strong>{{ formatMoney(todayPaidDebt) }} so'm</strong></div>
            <div><span>Qarzdorlar:</span> <strong>{{ debtorsCount }} ta</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Income Tab -->
    <div v-if="currentTab === 'income'" class="tab-content">
      <div class="tab-header">
        <h2>📥 Kirimlar</h2>
        <div class="controls">
          <div class="date-filter">
            <label>Sana oralig'i:</label>
            <input type="date" v-model="filters.startDate" />
            <span>dan</span>
            <input type="date" v-model="filters.endDate" />
          </div>
          <div class="search-filter">
            <label>Qidirish:</label>
            <input type="text" v-model="filters.search" placeholder="Kimdan/qayerdan..." />
          </div>
          <button class="add-btn" @click="openPaymentModal('income')">➕ Kirim qo'shish</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sana/Vaqt</th>
              <th>Kimdan/Qayerdan</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
              <th>Humo</th>
              <th>Kassir</th>
              <th>Izoh</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments.income" :key="payment.id">
              <td>{{ formatDateTime(payment.datetime) }}</td>
              <td>{{ payment.from }}</td>
              <td>{{ formatMoney(payment.cash) }}</td>
              <td>{{ formatMoney(payment.card) }}</td>
              <td>{{ formatMoney(payment.click) }}</td>
              <td>{{ formatMoney(payment.humo) }}</td>
              <td>{{ payment.cashier }}</td>
              <td>{{ payment.note }}</td>
            </tr>
            <tr v-if="filteredPayments.income.length === 0">
              <td colspan="8">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary" v-if="filters.startDate || filters.endDate || filters.search">
        <h4>Xulosa:</h4>
        <p>
          Jami kirim: <strong>{{ formatMoney(incomeSummary.total) }} so'm</strong>
          ({{ filteredPayments.income.length }} ta)
        </p>
      </div>
    </div>

    <!-- Expense Tab -->
    <div v-if="currentTab === 'expense'" class="tab-content">
      <div class="tab-header">
        <h2>📤 Chiqimlar</h2>
        <div class="controls">
          <div class="date-filter">
            <label>Sana oralig'i:</label>
            <input type="date" v-model="filters.startDate" />
            <span>dan</span>
            <input type="date" v-model="filters.endDate" />
          </div>
          <div class="search-filter">
            <label>Qidirish:</label>
            <input type="text" v-model="filters.search" placeholder="Kimga/qayerga..." />
          </div>
          <button class="add-btn" @click="openPaymentModal('expense')">➕ Chiqim qo'shish</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sana/Vaqt</th>
              <th>Kimga/Qayerga</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
              <th>Humo</th>
              <th>Kassir</th>
              <th>Izoh</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments.expense" :key="payment.id">
              <td>{{ formatDateTime(payment.datetime) }}</td>
              <td>{{ payment.from }}</td>
              <td>{{ formatMoney(payment.cash) }}</td>
              <td>{{ formatMoney(payment.card) }}</td>
              <td>{{ formatMoney(payment.click) }}</td>
              <td>{{ formatMoney(payment.humo) }}</td>
              <td>{{ payment.cashier }}</td>
              <td>{{ payment.note }}</td>
            </tr>
            <tr v-if="filteredPayments.expense.length === 0">
              <td colspan="8">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary" v-if="filters.startDate || filters.endDate || filters.search">
        <h4>Xulosa:</h4>
        <p>
          Jami chiqim: <strong>{{ formatMoney(expenseSummary.total) }} so'm</strong>
          ({{ filteredPayments.expense.length }} ta)
        </p>
      </div>
    </div>

    <!-- Patients Tab -->
    <div v-if="currentTab === 'patients'" class="tab-content">
      <div class="tab-header">
        <h2>👤 Bemorlar</h2>
        <div class="controls">
          <div class="search-filter">
            <label>Qidirish:</label>
            <input type="text" v-model="patientFilters.search" placeholder="Ism, telefon..." />
          </div>
        </div>
      </div>
      <div class="patient-tabs">
        <button :class="{ active: patientTab === 'debtors' }" @click="patientTab = 'debtors'">
          Qarzdorlar ({{ debtors.length }})
        </button>

        <button :class="{ active: patientTab === 'all' }" @click="patientTab = 'all'">
          Barcha bemorlar
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>F.I</th>
              <th>Sana / Vaqt</th>
              <th>Manzil</th>
              <th>Telefon</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
              <th>Humo</th>
              <th>Jami Haqqi</th>
              <th>Kassir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in filteredPatients" :key="p.id">
              <td>{{ index + 1 }}</td>
              <td>{{ p.ism }} {{ p.familiya }}</td>
              <td>{{ formatDateTime(p.datetime || p.created_at) }}</td>
              <td>{{ p.viloyat || '' }} {{ p.tuman || '' }}</td>
              <td>{{ p.tel1 || '-' }}</td>
              <td>{{ formatMoney(p.naqd) }}</td>
              <td>{{ formatMoney(p.karta) }}</td>
              <td>{{ formatMoney(p.click) }}</td>
              <td>{{ formatMoney(p.humo) }}</td>
              <td>{{ formatMoney(p.haqqi) }}</td>
              <td>{{ p.kassir || '-' }}</td>
            </tr>
            <tr v-if="filteredPatients.length === 0">
              <td colspan="11" class="text-center">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-content">
        <h3>{{ paymentModalType === 'income' ? '➕ Kirim qo\'shish' : '➖ Chiqim qo\'shish' }}</h3>

        <div class="form-group">
          <label>{{ paymentModalType === 'income' ? 'Kimdan/Qayerdan' : 'Kimga/Qayerga' }}</label>
          <input type="text" v-model="paymentForm.from"
            :placeholder="paymentModalType === 'income' ? 'Kirim manbasi...' : 'Chiqim manzili...'" />
        </div>

        <div class="payment-methods">
          <div class="form-group">
            <label>Naqd (so'm)</label>
            <input type="number" v-model.number="paymentForm.cash" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Karta (so'm)</label>
            <input type="number" v-model.number="paymentForm.card" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Click (so'm)</label>
            <input type="number" v-model.number="paymentForm.click" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Humo (so'm)</label>
            <input type="number" v-model.number="paymentForm.humo" min="0" placeholder="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Izoh</label>
          <textarea v-model="paymentForm.note" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button class="save-btn" @click="savePayment">💾 Saqlash</button>
          <button class="cancel-btn" @click="closePaymentModal">❌ Bekor qilish</button>
        </div>
      </div>
    </div>

    <!-- Patient Payment Modal -->
    <div v-if="showPatientPaymentModal" class="modal-overlay" @click.self="closePatientPaymentModal">
      <div class="modal-content">
        <h3>💰 Bemor to'lovi: {{ selectedPatient.name }}</h3>
        <p v-if="selectedPatient.debt > 0" class="patient-debt">
          Jami qarz: <strong>{{ formatMoney(selectedPatient.debt) }} so'm</strong>
        </p>

        <div class="payment-methods">
          <div class="form-group">
            <label>Naqd (so'm)</label>
            <input type="number" v-model.number="patientPaymentForm.cash" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Karta (so'm)</label>
            <input type="number" v-model.number="patientPaymentForm.card" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Click (so'm)</label>
            <input type="number" v-model.number="patientPaymentForm.click" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Humo (so'm)</label>
            <input type="number" v-model.number="patientPaymentForm.humo" min="0" placeholder="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Izoh</label>
          <textarea v-model="patientPaymentForm.note" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button class="save-btn" @click="savePatientPayment">💾 Saqlash</button>
          <button class="cancel-btn" @click="closePatientPaymentModal">❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'; // axios token bilan sozlangan instance

export default {
  data() {
    return {
      currentTab: 'statistics',
      patientTab: 'debtors',

      currentUser: { id: null, name: '' },

      payments: [],
      patients: [],

      filters: { startDate: '', endDate: '', search: '' },
      patientFilters: { search: '' },

      showPaymentModal: false,
      paymentModalType: 'kirim',
      paymentForm: {
        type: 'kirim',
        from: '',
        cash: 0,
        card: 0,
        click: 0,
        humo: 0,
        note: '',
        is_patient_payment: false,
        client_id: null,
        davolanish_id: null,
        cashier: ''
      },

      showPatientPaymentModal: false,
      selectedPatient: { id: null, name: '', debt: 0 },
      patientPaymentForm: { cash: 0, card: 0, click: 0, humo: 0, note: '' },

      todayIncome: { total: 0, cash: 0, card: 0, click: 0, humo: 0 },
      todayExpense: { total: 0, cash: 0, card: 0, click: 0, humo: 0 },
      totalDebt: 0,
      todayAddedDebt: 0,
      todayPaidDebt: 0,
      debtorsCount: 0
    };
  },

  async created() {
    await this.getCurrentUser();
    await Promise.all([this.fetchPayments(), this.fetchPatients()]);
    this.calculateStatistics();
  },

  methods: {
    formatMoney(amount) {
      return amount ? Number(amount).toLocaleString('ru-RU') : '0';
    },

    async getCurrentUser() {
      try {
        const res = await api.get('/api/v1/user_data');
        const user = res.data.user;
        this.currentUser = {
          id: user?.id || null,
          name: user?.name || user?.username || 'Foydalanuvchi'
        };
      } catch (err) {
        console.error('Foydalanuvchini olishda xatolik:', err);
      }
    },

    async fetchPayments() {
      try {
        const res = await api.get('/api/v1/payments');
        this.payments = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      } catch (err) {
        console.error('To‘lovlarni olishda xatolik:', err);
      }
    },

    async fetchPatients() {
      try {
        const res = await api.get('/api/v1/clients');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.patients = list.map(p => ({
          ...p,
          debt: (p.total_debt || 0) - (p.total_paid || 0)
        }));
      } catch (err) {
        console.error('Bemorlarni olishda xatolik:', err);
      }
    },

    calculateStatistics() {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayPayments = this.payments.filter(p => p.datetime?.startsWith(todayStr));
      const kirimlar = todayPayments.filter(p => p.type === 'kirim');
      const chiqimlar = todayPayments.filter(p => p.type === 'chiqim');

      const sumFields = (arr, field) => arr.reduce((acc, x) => acc + (Number(x[field]) || 0), 0);

      const calc = (type) => ({
        cash: sumFields(type, 'cash'),
        card: sumFields(type, 'card'),
        click: sumFields(type, 'click'),
        humo: sumFields(type, 'humo')
      });

      const income = calc(kirimlar);
      const expense = calc(chiqimlar);

      this.todayIncome = { ...income, total: income.cash + income.card + income.click + income.humo };
      this.todayExpense = { ...expense, total: expense.cash + expense.card + expense.click + expense.humo };

      this.totalDebt = this.patients.reduce((acc, p) => acc + (p.debt || 0), 0);

      const todayAdded = todayPayments.filter(p => p.type === 'chiqim' && p.is_patient_payment);
      const todayPaid = todayPayments.filter(p => p.type === 'kirim' && p.is_patient_payment);

      const sumPayment = arr => arr.reduce((acc, p) => acc + Number(p.cash || 0) + Number(p.card || 0) + Number(p.click || 0) + Number(p.humo || 0), 0);

      this.todayAddedDebt = sumPayment(todayAdded);
      this.todayPaidDebt = sumPayment(todayPaid);
      this.debtorsCount = this.patients.filter(p => p.debt > 0).length;
    },

    switchTab(tab) {
      this.currentTab = tab;
      this.filters = { startDate: '', endDate: '', search: '' };
      this.patientFilters.search = '';
    },

    openPaymentModal(type) {
      this.paymentModalType = type;
      this.paymentForm = {
        type,
        from: '',
        cash: 0,
        card: 0,
        click: 0,
        humo: 0,
        note: '',
        is_patient_payment: false,
        client_id: null,
        davolanish_id: null,
        cashier: this.currentUser.name || ''
      };
      this.showPaymentModal = true;
    },

    closePaymentModal() {
      this.showPaymentModal = false;
    },

    async savePayment() {
      try {
        const total = this.paymentForm.cash + this.paymentForm.card + this.paymentForm.click + this.paymentForm.humo;
        if (!this.paymentForm.from || total <= 0) return alert('To‘lov manbasi va summani kiriting.');

        const payload = {
          ...this.paymentForm,
          type: this.paymentModalType,
          is_patient_payment: this.paymentForm.is_patient_payment ? 1 : 0,
          user_id: this.currentUser.id,
          cashier: this.currentUser.name,
          datetime: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };

        await api.post('/api/v1/payments', payload);
        await Promise.all([this.fetchPayments(), this.fetchPatients()]);
        this.calculateStatistics();
        this.closePaymentModal();
        alert('To‘lov saqlandi.');
      } catch (err) {
        console.error('To‘lov saqlashda xatolik:', err);
      }
    },

    openPatientPaymentModal(patient) {
      this.selectedPatient = patient;
      this.patientPaymentForm = { cash: 0, card: 0, click: 0, humo: 0, note: '' };
      this.showPatientPaymentModal = true;
    },

    closePatientPaymentModal() {
      this.showPatientPaymentModal = false;
    },

    async savePatientPayment() {
      try {
        const total = this.patientPaymentForm.cash + this.patientPaymentForm.card + this.patientPaymentForm.click + this.patientPaymentForm.humo;
        if (total <= 0) return alert('To‘lov summasini kiriting.');

        const payload = {
          type: 'kirim',
          from: this.selectedPatient.name,
          ...this.patientPaymentForm,
          is_patient_payment: 1,
          client_id: this.selectedPatient.id,
          user_id: this.currentUser.id,
          cashier: this.currentUser.name,
          datetime: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };

        await api.post('/api/v1/payments', payload);
        await Promise.all([this.fetchPayments(), this.fetchPatients()]);
        this.calculateStatistics();
        this.closePatientPaymentModal();
        alert('Bemor to‘lovi saqlandi.');
      } catch (err) {
        console.error('Bemor to‘lovi saqlashda xatolik:', err);
      }
    },

    formatMoney(amount) {
      return amount ? Number(amount).toLocaleString('ru-RU') : '0';
    },

    formatDateTime(datetime) {
      if (!datetime) return '';
      const [date, time] = datetime.split(' ');
      return `${date} ${time?.slice(0, 5)}`;
    },

    formatDate(datetime) {
      return datetime?.split(' ')[0] || '';
    }
  },

  computed: {
    debtors() {
      return this.patients.filter(p => p.debt > 0);
    },
    filteredPayments() {
      const { startDate, endDate, search } = this.filters;
      const filter = (items) => items.filter(p => {
        const dateOk = (!startDate || p.datetime >= startDate) && (!endDate || p.datetime <= endDate + ' 23:59:59');
        const searchOk = !search || p.from?.toLowerCase().includes(search.toLowerCase());
        return dateOk && searchOk;
      });

      return {
        income: filter(this.payments.filter(p => p.type === 'kirim')),
        expense: filter(this.payments.filter(p => p.type === 'chiqim'))
      };
    },

    filteredPatients() {
      let list = this.patientTab === 'debtors' ? this.patients.filter(p => p.debt > 0) : this.patients;
      if (this.patientFilters.search) {
        const search = this.patientFilters.search.toLowerCase();
        list = list.filter(p => p.name?.toLowerCase().includes(search) || p.phone?.toLowerCase().includes(search));
      }
      return list;
    },

    incomeSummary() {
      return {
        total: this.filteredPayments.income.reduce((acc, p) => acc + (p.cash || 0) + (p.card || 0) + (p.click || 0) + (p.humo || 0), 0)
      };
    },

    expenseSummary() {
      return {
        total: this.filteredPayments.expense.reduce((acc, p) => acc + (p.cash || 0) + (p.card || 0) + (p.click || 0) + (p.humo || 0), 0)
      };
    }
  }
};
</script>




<style scoped>
.cashier-system {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Navigation tabs */
.navigation-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.navigation-tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: #e2e8f0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.navigation-tabs button:hover {
  background-color: #cbd5e1;
}

.navigation-tabs button.active {
  background-color: #4f46e5;
  color: white;
}

/* Tab content */
.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.tab-header h2 {
  margin: 0;
  color: #4f46e5;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.date-filter,
.search-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-filter label,
.search-filter label {
  font-weight: 600;
  font-size: 14px;
}

input[type="date"],
input[type="text"] {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.add-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #4338ca;
}

/* Statistics grid */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4f46e5;
  font-size: 18px;
}

.stat-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-values div {
  display: flex;
  justify-content: space-between;
}

.stat-values span {
  color: #64748b;
}

.stat-values strong {
  color: #1e293b;
}

/* Tables */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.data-table th {
  background-color: #4f46e5;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background-color: #f8fafc;
}

.debtor-row {
  background-color: #fff1f2;
}

.debtor-row:hover {
  background-color: #ffe4e6 !important;
}

.text-red {
  color: #ef4444;
  font-weight: 600;
}

/* Patient tabs */
.patient-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.patient-tabs button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #e2e8f0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.patient-tabs button:hover {
  background-color: #cbd5e1;
}

.patient-tabs button.active {
  background-color: #4f46e5;
  color: white;
}

/* Action buttons */
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 13px;
}

.payment-btn {
  background-color: #10b981;
  color: white;
}

.payment-btn:hover {
  background-color: #059669;
}

/* Summary */
.summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.summary h4 {
  margin-top: 0;
  color: #4f46e5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  color: #4f46e5;
}

.patient-debt {
  color: #ef4444;
  font-weight: 600;
  margin-top: -10px;
  margin-bottom: 20px;
}

/* Form groups */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

/* Modal actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #4338ca;
}

.cancel-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #dc2626;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .navigation-tabs {
    flex-wrap: wrap;
  }

  .controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-filter,
  .search-filter {
    width: 100%;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }
}
</style>