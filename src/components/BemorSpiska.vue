<template>
  <div class="container">
    <!-- Filtrlar -->
    <div class="filters">
      <input
        v-model="filters.familiya"
        @input="debouncedFetchClients"
        placeholder="Familiya bo'yicha qidirish"
        class="input"
      />
      <input
        v-model="filters.ism"
        @input="debouncedFetchClients"
        placeholder="Ism bo'yicha qidirish"
        class="input"
      />
      <input
        v-model="filters.pasport"
        @input="debouncedFetchClients"
        placeholder="Pasport bo'yicha qidirish"
        class="input"
      />
      <input
        v-model="filters.tugulgan_sana"
        @input="debouncedFetchClients"
        type="date"
        placeholder="Tug'ilgan sana bo'yicha qidirish"
        class="input"
      />
    </div>

    <!-- Klientlar jadvali -->
    <table class="client-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Familiya</th>
          <th>Ism</th>
          <th>Pasport</th>
          <th>Qayerdan</th>
          <th>Tel</th>
          <th>Tug'ilgan sana</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(client, index) in clients"
          :key="client.id"
          class="table-row"
          tabindex="0"
          @keydown.enter="$emit('select-client', client)"
        >
          <td>{{ index + 1 + (pagination.current_page - 1) * pagination.per_page }}</td>
          <td>{{ client.familiya }}</td>
          <td>{{ client.ism }}</td>
          <td>{{ client.pasport }}</td>
          <td>{{ client.viloyat }}, {{ client.tuman }}</td>
          <td>{{ client.tel1 }}</td>
          <td>{{ client.tugulgan_sana }}</td>
        </tr>
        <tr v-if="clients.length === 0">
          <td colspan="7" class="no-data">Hech qanday ma'lumot topilmadi</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginatsiya -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button
        class="btn pagination-btn"
        :disabled="pagination.current_page === 1"
        @click="changePage(pagination.current_page - 1)"
        aria-label="Previous page"
      >
        ← Oldingi
      </button>

      <!-- Sahifa raqamlari -->
      <button
        v-for="page in pagesToShow"
        :key="page"
        class="btn pagination-btn"
        :class="{ active: pagination.current_page === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <!-- Agar oxirgi sahifa ko‘rinmasa, alohida tugma -->
      <button
        v-if="!pagesToShow.includes(pagination.last_page)"
        class="btn pagination-btn"
        :class="{ active: pagination.current_page === pagination.last_page }"
        @click="changePage(pagination.last_page)"
      >
        {{ pagination.last_page }}
      </button>

      <button
        class="btn pagination-btn"
        :disabled="pagination.current_page === pagination.last_page"
        @click="changePage(pagination.current_page + 1)"
        aria-label="Next page"
      >
        Keyingi →
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import debounce from 'lodash.debounce';

export default {
  name: 'ClientTable',
  data() {
    return {
      clients: [],
      filters: {
        familiya: '',
        ism: '',
        pasport: '',
        tugulgan_sana: '',
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 50,           // Har sahifada 50 ta klient ko‘rsatish
        prev_page_url: null,
        next_page_url: null,
      },
      role: null,
      token: null,
    };
  },
  computed: {
    pagesToShow() {
      const total = this.pagination.last_page;
      const current = this.pagination.current_page;
      const maxButtons = 7; // ko‘rsatadigan sahifa tugmalari soni

      let start = Math.max(1, current - Math.floor(maxButtons / 2));
      let end = start + maxButtons - 1;

      if (end > total) {
        end = total;
        start = Math.max(1, end - maxButtons + 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  created() {
    this.role = localStorage.getItem('role');
    this.token = localStorage.getItem('token');

    const allowedRoles = ['admin', 'kassa'];
    if (!allowedRoles.includes(this.role)) {
      alert('Sizda bu sahifaga kirish uchun ruxsat yo‘q!');
      this.$router.push({ name: 'LoginPage' });
      return;
    }

    if (api.defaults) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    this.debouncedFetchClients = debounce(this.fetchClients, 400);
    this.fetchClients();
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.pagination.current_page = 1;
        this.debouncedFetchClients();
      },
    },
  },
  methods: {
    async fetchClients() {
      try {
        const filteredParams = {};
        Object.entries(this.filters).forEach(([key, val]) => {
          if (val && val.toString().trim() !== '') {
            filteredParams[key] = val.toString().trim();
          }
        });

        const params = {
          ...filteredParams,
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
        };

        const res = await api.get('public/api/v1/clients', { params });

        this.clients = res.data.data;
        this.pagination = {
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          prev_page_url: res.data.prev_page_url,
          next_page_url: res.data.next_page_url,
        };
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Sessiya muddati tugagan. Qayta login qiling.");
          localStorage.clear();
          this.$router.push({ name: 'LoginPage' });
        } else {
          console.error('Xatolik:', error);
        }
        this.clients = [];
        this.pagination.last_page = 1;
      }
    },

    changePage(page) {
      if (page > 0 && page <= this.pagination.last_page && page !== this.pagination.current_page) {
        this.pagination.current_page = page;
        this.fetchClients();
      }
    },

    onPageInputChange() {
      if (this.pagination.current_page < 1) {
        this.pagination.current_page = 1;
      } else if (this.pagination.current_page > this.pagination.last_page) {
        this.pagination.current_page = this.pagination.last_page;
      }
      this.fetchClients();
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 20 auto;
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.input {
  flex: 1 1 180px;
  padding: 10px 14px;
  font-size: 15px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  background-color: white;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  color: #34495e;
}

.input::placeholder {
  color: #a0a0a0;
}

.input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 6px rgba(52, 152, 219, 0.4);
}

.client-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border-radius: 6px;
  overflow: hidden;
}

.client-table thead tr {
  background-color: #3498db;
  color: white;
  font-weight: 600;
  text-align: left;
}

.client-table th,
.client-table td {
  padding: 12px 18px;
  border-bottom: 1px solid #e1e8f0;
}

.client-table tbody tr {
  background-color: white;
  transition: background-color 0.25s ease;
  cursor: pointer;
}

.client-table tbody tr:hover {
  background-color: #eaf4fc;
}

.no-data {
  text-align: center;
  padding: 16px 0;
  color: #999;
  font-style: italic;
}

/* Paginatsiya */
.pagination {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  user-select: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Tugmalar kvadrat shaklida, biroz yumaloq burchaklar */
.pagination-btn {
  background-color: #2980b9;
  border: none;
  color: white;
  padding: 8px 14px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.pagination-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-btn:not(:disabled):hover {
  background-color: #1f618d;
}

/* Faol (aktiv) sahifa tugmasi aniqroq */
.pagination-btn.active {
  background-color: #1b4f72;
  font-weight: 700;
  cursor: default;
  box-shadow: 0 0 8px rgba(27, 79, 114, 0.6);
}

/* Kerak bo'lsa input paginatsiya joyi */
.page-info {
  display: none; /* Agar kerak bo'lsa yoqing */
}


</style>
