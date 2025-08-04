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
    <div class="pagination">
      <button
        @click="changePage(pagination.current_page - 1)"
        :disabled="!pagination.prev_page_url"
        class="btn pagination-btn"
        aria-label="Previous page"
      >
        ←
      </button>

      <div class="page-info">
        <span>Page</span>
        <input
          v-model.number="pagination.current_page"
          @change="onPageInputChange"
          type="number"
          min="1"
          :max="pagination.last_page"
          class="page-input"
          aria-label="Current page number"
        />
        <span>of {{ pagination.last_page }}</span>
      </div>

      <button
        @click="changePage(pagination.current_page + 1)"
        :disabled="!pagination.next_page_url"
        class="btn pagination-btn"
        aria-label="Next page"
      >
        →
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
        per_page: 20,
        prev_page_url: null,
        next_page_url: null,
      },
      role: null,
      token: null,
    };
  },
  created() {
    this.role = localStorage.getItem('role');
    this.token = localStorage.getItem('token');

   const allowedRoles = ['admin',  'kassa'];
if (!allowedRoles.includes(this.role)) {
  alert('Sizda bu sahifaga kirish uchun ruxsat yo‘q!');
  this.$router.push({ name: 'LoginPage' });
  return;
}


    // Tokenni headerga qo‘shamiz (agar api.js-da yo'q bo‘lsa)
    if (api.defaults) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    // Debounce funksiyani tayyorlaymiz
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
      if (page > 0 && page <= this.pagination.last_page) {
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
/* Styling sizning oldingi kodingiz kabi */
.container {
  padding: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  max-width: 1100px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.input {
  flex: 1 1 200px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: #fafafa;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  color: #333;
}

.input::placeholder {
  color: #999;
}

.input:focus {
  outline: none;
  border-color: #1A6291;
  box-shadow: 0 0 8px rgba(26, 98, 145, 0.5);
}

.client-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.client-table thead tr {
  background-color: #1A6291;
  color: white;
  font-weight: 600;
  text-align: left;
  border-radius: 12px 12px 0 0;
}

.client-table th,
.client-table td {
  padding: 14px 20px;
}

.client-table tbody tr {
  background-color: #f9fbfd;
  transition: background-color 0.3s ease;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(26, 98, 145, 0.1);
}

.client-table tbody tr:hover {
  background-color: #dbe9f8;
  box-shadow: 0 4px 10px rgba(26, 98, 145, 0.2);
}

.no-data {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-style: italic;
}

.pagination {
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  user-select: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pagination-btn {
  background-color: #1A6291;
  border: none;
  color: white;
  padding: 10px 18px;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.pagination-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-btn:not(:disabled):hover {
  background-color: #154d71;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #1A6291;
  font-weight: 600;
  user-select: text;
}

.page-input {
  width: 60px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 2px solid #1A6291;
  font-size: 16px;
  text-align: center;
  color: #1A6291;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.page-input:focus {
  outline: none;
  border-color: #154d71;
  box-shadow: 0 0 10px rgba(26, 98, 145, 0.6);
}
</style>
