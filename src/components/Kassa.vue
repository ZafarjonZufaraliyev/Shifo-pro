<template>
  <div class="cashier-system">
    <!-- --- NAV TABS -------------------------------------------------- -->
    <div class="navigation-tabs">
      <button :class="{ active: currentTab === 'statistics' }" @click="switchTab('statistics')">📊 Statistika</button>
      <button :class="{ active: currentTab === 'income' }" @click="switchTab('income')">📥 Kirim</button>
      <button :class="{ active: currentTab === 'expense' }" @click="switchTab('expense')">📤 Chiqim</button>
      <button :class="{ active: currentTab === 'patients' }" @click="switchTab('patients')">👤 Bemorlar</button>
    </div>

    <!-- --- STATISTICS TAB ------------------------------------------- -->
    <div v-if="currentTab === 'statistics'" class="tab-content">
      <div class="statistics-grid">
        <!-- BUGUNGI KIRIM -->
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
        <!-- BUGUNGI CHIQIM -->
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
        <!-- BEMOR STAT -->
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

    <!-- --- INCOME TAB ----------------------------------------------- -->
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
            <tr v-for="p in filteredPayments.income" :key="p.id || p.datetime + p.from">
              <td>{{ formatDateTime(p.datetime) }}</td>
              <td>{{ p.from }}</td>
              <td>{{ formatMoney(p.cash) }}</td>
              <td>{{ formatMoney(p.card) }}</td>
              <td>{{ formatMoney(p.click) }}</td>
              <td>{{ formatMoney(p.humo) }}</td>
              <td>{{ p.cashier }}</td>
              <td>{{ p.note }}</td>
            </tr>
            <tr v-if="filteredPayments.income.length === 0">
              <td colspan="8">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="summary" v-if="filters.startDate || filters.endDate || filters.search">
        <h4>Xulosa:</h4>
        <p>Jami kirim: <strong>{{ formatMoney(incomeSummary.total) }} so'm</strong> ({{ filteredPayments.income.length
        }} ta)</p>
      </div>
    </div>

    <!-- --- EXPENSE TAB ---------------------------------------------- -->
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
            <tr v-for="p in filteredPayments.expense" :key="p.id || p.datetime + p.from">
              <td>{{ formatDateTime(p.datetime) }}</td>
              <td>{{ p.from }}</td>
              <td>{{ formatMoney(p.cash) }}</td>
              <td>{{ formatMoney(p.card) }}</td>
              <td>{{ formatMoney(p.click) }}</td>
              <td>{{ formatMoney(p.humo) }}</td>
              <td>{{ p.cashier }}</td>
              <td>{{ p.note }}</td>
            </tr>
            <tr v-if="filteredPayments.expense.length === 0">
              <td colspan="8">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="summary" v-if="filters.startDate || filters.endDate || filters.search">
        <h4>Xulosa:</h4>
        <p>Jami chiqim: <strong>{{ formatMoney(expenseSummary.total) }} so'm</strong> ({{
          filteredPayments.expense.length }} ta)</p>
      </div>
    </div>

    <!-- --- PATIENTS TAB --------------------------------------------- -->
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

      <!-- 👉 Yangi patient-tab tugmalar -->
      <div class="patient-tabs">
        <button :class="{ active: patientTab === 'debtors' }" @click="patientTab = 'debtors'">
          Qarzdorlar ({{ debtors.length }})
        </button>
        <button :class="{ active: patientTab === 'paid' }" @click="patientTab = 'paid'">
          To‘laganlar ({{ paidPatients.length }})
        </button>
        <button :class="{ active: patientTab === 'all' }" @click="patientTab = 'all'">
          Barcha bemorlar ({{ patients.length }})
        </button>
      </div>

      <!-- 👉 Jadval -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ism Familiya</th>
              <th>Telefon</th>
              <th>Naq</th>
              <th>To'langan</th>
              <th>{{ patientTab === 'debtors' ? 'Qarzi' : 'Haqqi' }}</th>
              <th>Holat</th>
              <th>Kassir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in filteredPatients" :key="p.client + i">
              <td>{{ i + 1 }}</td>
              <td>{{ p.fullName || p.client || '-' }}</td>
              <td>{{ p.phone || '-' }}</td>

              <td>{{ p.phone }} so'm</td>
              <td>{{ formatMoney(p.paidSum) }} so'm</td>
              <td @click="openPatientPaymentModal(p)"
                :style="{ cursor: 'pointer', color: Number(p.balance) < 0 ? 'red' : (Number(p.balance) > 0 ? 'green' : '#000') }"
                :title="patientTab === 'debtors' ? 'Qarz qo‘shish yoki to‘lash' : 'To‘lov qo‘shish'">
                {{ patientTab === 'debtors' ? formatMoney(-Number(p.balance)) : formatMoney(Number(p.balance)) }} so'm
              </td>
              <td>{{ p.status }}</td>
              <td>{{ p.lastCashier }}</td>
            </tr>
            <tr v-if="filteredPatients.length === 0">
              <td colspan="8">Ma'lumot topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>



    <!-- --- PAYMENT MODAL -------------------------------------------- -->
    <!-- --- PAYMENT MODAL -------------------------------------------- -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-content">
        <h3>{{ paymentModalType === 'income' ? '➕ Kirim qo\'shish' : '➖ Chiqim qo\'shish' }}</h3>

        <!-- KIMDAN / KIMGA SELECT -->
        <div class="form-group">
          <label>{{ paymentModalType === 'income' ? 'Kimdan/Qayerdan' : 'Kimga/Qayerga' }}</label>
          <div class="select-with-controls">
            <select v-model="paymentForm.from">
              <option disabled value="">-- Tanlang --</option>
              <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
            </select>
            <button class="ctrl-btn" @click="addSource" title="Yangi manba qo‘shish">➕</button>
            <button class="ctrl-btn" @click="removeSource" title="Tanlangan manbani o‘chirish">❌</button>
          </div>
        </div>

        <!-- SUMMALAR -->
        <div class="payment-methods">
          <div class="form-group" v-for="m in ['cash', 'card', 'click', 'humo']" :key="m">
            <label>{{ m.charAt(0).toUpperCase() + m.slice(1) }} (so'm)</label>
            <input type="number" v-model.number="paymentForm[m]" min="0" placeholder="0" />
          </div>
        </div>

        <!-- IZOHLAR -->
        <div class="form-group">
          <label>Izoh</label>
          <textarea v-model="paymentForm.note" rows="3"></textarea>
        </div>

        <!-- ACTION TUGMALARI -->
        <div class="modal-actions">
          <button class="save-btn" @click="savePayment">💾 Saqlash</button>
          <button class="cancel-btn" @click="closePaymentModal">❌ Bekor qilish</button>
        </div>
      </div>
    </div>


    <!-- --- PATIENT PAYMENT MODAL ------------------------------------ -->
    <div v-if="showPatientPaymentModal" class="modal-overlay" @click.self="closePatientPaymentModal">
      <div class="modal-content">
        <h3>💰 Bemor to'lov: {{ selectedPatient.fullName }}</h3>
        <p v-if="selectedPatient.debt > 0" class="patient-debt">Jami qarz: <strong>{{ formatMoney(selectedPatient.debt)
            }} so'm</strong></p>
        <div class="form-group">
          <label>To'lov turi:</label>
          <select v-model="patientPaymentForm.type">
            <option value="kirim">➕ Kirim</option>
            <option value="chiqim">➖ Chiqim</option>
          </select>
        </div>
        <div class="payment-methods">
          <div class="form-group" v-for="m in ['cash', 'card', 'click', 'humo']" :key="m">
            <label>{{ m.charAt(0).toUpperCase() + m.slice(1) }} (so'm)</label>
            <input type="number" v-model.number="patientPaymentForm[m]" min="0" placeholder="0" />
          </div>
        </div>
        <div class="form-group"><label>Izoh</label><textarea v-model="patientPaymentForm.note" rows="3"></textarea>
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
import api from "@/api";

export default {
  /* ------------------------------ data */
  data() {
    return {
      /* UI states */
      currentTab        : "statistics",
      patientTab        : "debtors",
      filters           : { startDate: "", endDate: "", search: "" },
      patientFilters    : { search: "" },
      showPaymentModal  : false,
      showPatientPaymentModal: false,

      /* backend data */
      currentUser       : { id: null, name: "" },
      payments          : [],      // faqat is_patient_payment = true
      clientServices    : [],
      patients          : [],

      /* forms */
      selectedPatient   : { id: null, fullName: "", latestDavolanishId: null },
      patientPaymentForm: {
        type: "kirim", from: "", cash: 0, card: 0, click: 0, humo: 0, note: ""
      },

      /* stats */
      todayIncome       : { cash: 0, card: 0, click: 0, humo: 0, total: 0 },
      todayExpense      : { cash: 0, card: 0, click: 0, humo: 0, total: 0 },
      totalDebt         : 0,
      debtorsCount      : 0,
    };
  },

  /* ------------------------------ lifecycle */
  async created() {
    await Promise.all([
      this.getCurrentUser(),
      this.fetchPayments(),
      this.fetchClientServices()
    ]);
    await this.fetchPatients();
    this.calculateStatistics();
  },

  /* ------------------------------ methods */
  methods: {
    switchTab(tab) {
      this.currentTab     = tab;
      this.filters        = { startDate: "", endDate: "", search: "" };
      this.patientFilters = { search: "" };
    },

    switchPatientTab(tab) {
      this.patientTab     = tab;
      this.patientFilters = { search: "" };
    },

    formatMoney(v) {
      return v ? Number(v).toLocaleString("ru-RU") : "0";
    },

    formatDateTime(dt) {
      if (!dt) return "-";
      const d = new Date(dt.replace(" ", "T"));
      return d.toLocaleString("uz-UZ", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
      });
    },

    async getCurrentUser() {
      const { data } = await api.get("/api/v1/user_data");
      const u = data.user || {};
      this.currentUser = {
        id  : u.id ?? null,
        name: u.name || u.username || "Foydalanuvchi"
      };
    },

    async fetchPayments() {
      const { data } = await api.get("/api/v1/payments");
      console.log(data)         deferfev
      const all = Array.isArray(data) ? data : data?.data || [];
      this.payments = all.filter(p => p.is_patient_payment); // faqat bemorga oid
    },

    async fetchClientServices() {
      const { data } = await api.get("/api/v1/client-services");
      this.clientServices = Array.isArray(data) ? data : data?.data || [];
    },

    async fetchPatients() {
      const { data } = await api.get("/api/v1/patient_payments");
      console.log(data)
      const list = Array.isArray(data) ? data : data?.data || [];

      this.patients = list.map(p => {
        const id = p.client_id ?? p.id ?? null;
        const services = this.clientServices.filter(cs => String(cs.client_id) === String(id));
        return {
          ...p,
          id,
          fullName           : p.client?.trim() || "-",
          latestDavolanishId : services.at(-1)?.davolanish_id ?? null,
          clientServices     : services,
          payments           : this.payments.filter(pay => String(pay.client_id) === String(id))
        };
      });
    },

    openPatientPaymentModal(patient) {
      this.selectedPatient = {
        id                : patient.id,
        fullName          : patient.fullName,
        latestDavolanishId: patient.latestDavolanishId
      };
      this.patientPaymentForm = {
        type: "kirim", from: patient.fullName,
        cash: 0, card: 0, click: 0, humo: 0, note: ""
      };
      this.showPatientPaymentModal = true;
    },

    async savePatientPayment() {
      const fields   = ["cash", "card", "click", "humo"];
      const datetime = new Date().toISOString().replace("T", " ").slice(0, 19);

      const payloads = fields.flatMap(f => {
        const val = Number(this.patientPaymentForm[f] || 0);
        return val > 0 ? [{
          type              : "kirim",
          is_patient_payment: 1,
          client_id         : this.selectedPatient.id,
          davolanish_id     : this.selectedPatient.latestDavolanishId,
          client            : this.selectedPatient.fullName,
          user_id           : this.currentUser.id,
          cashier           : this.currentUser.name,
          from              : this.patientPaymentForm.from,
          note              : this.patientPaymentForm.note,
          datetime,
          cash: 0, card: 0, click: 0, humo: 0,
          [f]: val
        }] : [];
      });

      if (!payloads.length) return alert("Iltimos, to‘lov summasini kiriting.");

      await Promise.all(payloads.map(p => api.post("/api/v1/payments", p)));

      await this.fetchPatients();
      this.calculateStatistics();
      this.showPatientPaymentModal = false;
      alert("To‘lov(lar) saqlandi");
    },

    calculateStatistics() {
      const today = new Date().toISOString().slice(0, 10);
      const inc = { cash: 0, card: 0, click: 0, humo: 0 };
      const exp = { cash: 0, card: 0, click: 0, humo: 0 };

      this.payments.forEach(p => {
        if (p.datetime?.slice(0, 10) !== today) return;
        const target = p.type === "kirim" ? inc : exp;
        ["cash", "card", "click", "humo"].forEach(f => {
          target[f] += Number(p[f] || 0);
        });
      });

      this.todayIncome  = { ...inc, total: Object.values(inc).reduce((a, b) => a + b, 0) };
      this.todayExpense = { ...exp, total: Object.values(exp).reduce((a, b) => a + b, 0) };
      this.debtorsCount = this.patients.filter(p => p.balance < 0).length;
      this.totalDebt    = this.patients.reduce((sum, p) =>
        sum + (p.balance < 0 ? -p.balance : 0), 0);
    }
  },

  /* ------------------------------ computed */
  computed: {
    debtors() {
      return this.patients.filter(p => p.balance < 0);
    },
    paidPatients() {
      return this.patients.filter(p => p.balance >= 0);
    },
    filteredPatients() {
      const base =
        this.patientTab === "debtors" ? this.debtors :
        this.patientTab === "paid"   ? this.paidPatients :
        this.patients;
      const q = this.patientFilters.search.toLowerCase();
      return base.filter(p =>
        (p.fullName || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q)
      );
    },
    todayAddedDebt() {
      const today = new Date().toISOString().slice(0, 10);
      return this.patients.reduce((sum, p) => {
        const addedToday = p.payments?.some(
          pay => pay.type === 'kirim' && pay.datetime?.slice(0, 10) === today
        );
        return addedToday && p.balance < 0
          ? sum + Math.abs(p.balance)
          : sum;
      }, 0);
    },
    todayPaidDebt() {
      const today = new Date().toISOString().slice(0, 10);
      return this.patients.reduce((sum, p) => {
        const paymentsToday = p.payments?.filter(
          pay => pay.type === 'kirim' && pay.datetime?.slice(0, 10) === today
        );
        return sum + paymentsToday.reduce((s, pay) => {
          return s + ['cash', 'card', 'click', 'humo'].reduce(
            (a, method) => a + Number(pay[method] || 0), 0
          );
        }, 0);
      }, 0);
    }
  }
};
</script>














<style scoped>
.table-container {
  overflow-x: auto;
  max-width: 100%;
  margin-top: 20px;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table th {
  background-color: #f2f2f2;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background-color: #f9f9f9;
}

.data-table tbody tr td[style*="cursor: pointer"] {
  text-decoration: underline;
}

/* Siz xohlagancha CSS qo'shishingiz mumkin */
/* Masalan: */

.navigation-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.navigation-tabs button {
  padding: 8px 12px;
  border: none;
  background: #e0e0e0;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.navigation-tabs button.active {
  background: #3498db;
  color: white;
}

.tab-content {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.1);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f4f6f8;
  border-radius: 12px;
  padding: 12px 16px;
}

.stat-card h3 {
  margin-bottom: 8px;
}

.stat-values div {
  margin-bottom: 4px;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.data-table th {
  background: #f0f0f0;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 8px;
}

.add-btn:hover {
  background: #218838;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.date-filter,
.search-filter {
  display: flex;
  align-items: center;
  gap: 6px;
}

.patient-tabs {
  margin-bottom: 8px;
}

.patient-tabs button {
  padding: 6px 14px;
  border: none;
  background: #ddd;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-right: 8px;
}

.patient-tabs button.active {
  background: #3498db;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 34, 34, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 360px;
  max-width: 90%;
  box-shadow: 0 6px 12px rgb(0 0 0 / 0.15);
}

.modal-content h3 {
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.payment-methods {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.payment-methods .form-group {
  flex: 1;
  min-width: 70px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.save-btn {
  background: #007bff;
  border: none;
  color: white;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.select-with-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.select-with-controls select {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.ctrl-btn {
  background: #eee;
  border: 1px solid #aaa;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.ctrl-btn:hover {
  background: #ddd;
}

.save-btn:hover {
  background: #0056b3;
}

.cancel-btn {
  background: #dc3545;
  border: none;
  color: white;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn:hover {
  background: #b02a37;
}

.patient-debt {
  color: #dc3545;
  font-weight: 700;
  margin-bottom: 12px;
}
</style>
