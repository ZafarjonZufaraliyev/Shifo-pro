<template>
  <div class="warehouse-outflow">
    <h2>Ombor Chiqimlar</h2>

    <!-- Chiqim Qo‘shish Formasi -->
    <form @submit.prevent="addOutflow">
      <select v-model="newItem.product_id" required>
        <option disabled value="">Mahsulot tanlang</option>
        <option v-for="p in products" :key="p.id" :value="p.id">
          {{ p.name }} ({{ p.unit }})
        </option>
      </select>

      <input
        type="number"
        v-model.number="newItem.quantity"
        min="0.01"
        step="0.01"
        required
        placeholder="Miqdori"
      />

      <select v-model="newItem.used_for" required>
        <option disabled value="">Qayerga ishlatilgani</option>
        <option value="oshxona">Oshxona</option>
        <option value="fitobar">Fitobar</option>
        <option value="boshqa">Boshqa joy</option>
      </select>

      <input type="date" v-model="newItem.date" required />

      <input v-model="newItem.comment" placeholder="Izoh (ixtiyoriy)" />

      <button type="submit" :disabled="!formValid">Qo‘shish</button>
    </form>

    <!-- Loading ko'rsatish -->
    <div v-if="loadingProducts" class="loading-overlay">
      <div class="spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>

    <!-- Chiqimlar jadvali -->
    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Mahsulot</th>
          <th>Miqdori</th>
          <th>Qayerga ishlatilgani</th>
          <th>Sana</th>
          <th>Status</th>
          <th>Izoh</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="item.id">
          <td>{{ i + 1 }}</td>
          <td>{{ item.product?.name || '—' }}</td>
          <td>{{ item.quantity }} {{ item.product?.unit || '' }}</td>
          <td>{{ item.used_for }}</td>
          <td>{{ formatDate(item.date) }}</td>
          <td>
            <span :class="item.checking === 1 ? 'badge-confirmed' : 'badge-pending'">
              {{ item.checking === 1 ? 'Tasdiqlandi' : 'Tasdiqlanmadi' }}
            </span>
          </td>
          <td>{{ item.comment || '—' }}</td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="7" class="no-data">Ma'lumotlar mavjud emas</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      products: [],
      items: [],
      loadingProducts: false,
      newItem: {
        product_id: '',
        quantity: null,
        used_for: '',
        checking: 0,
        date: new Date().toISOString().slice(0, 10),
        comment: '',
      },
    };
  },
  computed: {
    formValid() {
      return (
        this.newItem.product_id &&
        this.newItem.quantity > 0 &&
        this.newItem.used_for &&
        this.newItem.date
      );
    },
  },
  methods: {
    async fetchProducts() {
      this.loadingProducts = true;
      try {
        const { data } = await api.get('/api/v1/products');
        this.products = data;
      } catch (e) {
        console.error('Mahsulotlarni olishda xatolik:', e);
      } finally {
        this.loadingProducts = false;
      }
    },

    async fetchOutflows() {
      try {
        const { data } = await api.get('/api/v1/product-chiqim');
        this.items = data;
      } catch (e) {
        console.error('Chiqimlarni olishda xatolik:', e);
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('uz-UZ');
    },

    async addOutflow() {
      try {
        const payload = {
          product_id: Number(this.newItem.product_id),
          quantity: Number(this.newItem.quantity),
          used_for: this.newItem.used_for,
          checking: 0, // Tasdiqlanmadi
          date: this.newItem.date,
          comment: this.newItem.comment || '',
        };
        await api.post('/api/v1/product-chiqim', payload);
        await this.fetchOutflows();
        this.resetForm();
      } catch (e) {
        if (e.response && e.response.data) {
          console.error('Xatolik:', e.response.data);
          alert('Xatolik: ' + JSON.stringify(e.response.data));
        } else {
          alert('Xatolik yuz berdi: ' + e.message);
        }
      }
    },

    resetForm() {
      this.newItem = {
        product_id: '',
        quantity: null,
        used_for: '',
        checking: 0,
        date: new Date().toISOString().slice(0, 10),
        comment: '',
      };
    },
  },
  mounted() {
    this.fetchProducts();
    this.fetchOutflows();
  },
};
</script>




<style scoped>
/* Container */
.warehouse-outflow {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.loading-overlay {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-size: 1.3rem;
  color: #56ab2f;
  font-weight: 700;
  user-select: none;
  pointer-events: none;
}

/* Spinner: aylanuvchi doira */
.spinner {
  border: 6px solid #e0e0e0;
  border-top: 6px solid #56ab2f;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

/* Spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Title */
.warehouse-outflow h2 {
  font-size: 2.2rem;
  margin-bottom: 25px;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  letter-spacing: 1.2px;
}

/* Form Styles */
form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 35px;
  justify-content: center;
}

form select,
form input[type="number"],
form input[type="date"],
form input[type="text"] {
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 10px;
  width: 220px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

form select:focus,
form input[type="number"]:focus,
form input[type="date"]:focus,
form input[type="text"]:focus {
  outline: none;
  border-color: #56ab2f;
  box-shadow: 0 0 8px #a8e063;
}

/* Submit Button */
form button {
  background: linear-gradient(135deg, #56ab2f, #a8e063);
  color: white;
  border: none;
  font-weight: 700;
  padding: 14px 28px;
  font-size: 1.1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  align-self: center;
  min-width: 140px;
  user-select: none;
}

form button:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
}

form button:not(:disabled):hover {
  background: linear-gradient(135deg, #a8e063, #56ab2f);
  transform: scale(1.05);
}

/* Table Styles */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  font-size: 1rem;
  color: #444;
}

thead tr {
  background-color: #56ab2f;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 12px;
}

thead th {
  padding: 14px 12px;
  text-align: left;
}

tbody tr {
  background: #f9f9f9;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.1);
  border-radius: 12px;
  transition: background 0.3s ease;
  cursor: default;
}

tbody tr:hover {
  background: #e9f5d3;
}

tbody td {
  padding: 14px 12px;
  vertical-align: middle;
  border: none;
}

/* Badge styles */
.badge-confirmed {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #56ab2f, #a8e063);
  color: white;
  padding: 6px 14px;
  font-size: 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(86, 171, 47, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: transform 0.25s ease;
  user-select: none;
}

.badge-pending {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e74c3c, #f85032);
  color: white;
  padding: 6px 14px;
  font-size: 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(231, 56, 39, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: transform 0.25s ease;
  user-select: none;
}

.badge-confirmed:hover,
.badge-pending:hover {
  transform: scale(1.1);
}

.badge-confirmed::before {
  content: "✔️";
  margin-right: 8px;
  font-size: 1.1rem;
}

.badge-pending::before {
  content: "⏳";
  margin-right: 8px;
  font-size: 1.1rem;
}
</style>
