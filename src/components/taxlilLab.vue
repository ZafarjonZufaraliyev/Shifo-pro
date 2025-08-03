<template>
  <div class="contaner" >
    <h2>Tahlil parametrlar ro'yxati</h2>


    <!-- Jadval -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tahlil turi</th>
          <th>Parametr nomi</th>
          <th>Birlik</th>
          <th>Normal oralig'i</th>
          <th>Harakatlar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="param in filteredParameters" :key="param.id">
          <td>{{ param.id }}</td>
          <td>{{ labTestTypes }}</td>
          <td>{{ param.name }}</td>
          <td>{{ param.unit }}</td>
          <td>{{ param.normal_range }}</td>
          <td>
            <button @click="editParameter(param.id)">Tahrir</button>
            <button @click="deleteParameter(param.id)">O'chirish</button>
            <button @click="copyParameter(param.id)">Nusxalash</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Forma -->
    <div>
      <h3>Yangi parametr qo'shish</h3>
      <form @submit.prevent="addParameter">
        <div>
          <label for="labTestTypeAdd">Tahlil turi:</label>
          <select v-model="newParameter.lab_test_type_id" id="labTestTypeAdd" required>
            <option disabled value="">Tanlang</option>
            <option v-for="type in labTestTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="name">Parametr nomi:</label>
          <input type="text" id="name" v-model="newParameter.name" required />
        </div>

        <div>
          <label for="description">Tavsifi:</label>
          <textarea id="description" v-model="newParameter.description"></textarea>
        </div>

        <div>
          <label for="unit">Birlik:</label>
          <input type="text" id="unit" v-model="newParameter.unit" required />
        </div>

        <div>
          <label for="normal_range">Normal oralig'i:</label>
          <input type="text" id="normal_range" v-model="newParameter.normal_range" required />
        </div>

        <button type="submit">Qo'shish</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'TestParameters',

  data() {
    return {
      labTestTypes: [],
      testParameters: [],
      selectedLabTestTypeId: '',
      newParameter: {
        lab_test_type_id: '',
        name: '',
        description: '',
        unit: '',
        normal_range: ''
      }
    };
  },

  mounted() {
    this.fetchLabTestTypes();
    this.fetchTestParameters();
  },

  computed: {
    filteredParameters() {
      if (!this.selectedLabTestTypeId) return this.testParameters;
      return this.testParameters.filter(
        param => String(param.lab_test_type_id) === String(this.selectedLabTestTypeId)
      );
    }
  },

  methods: {
    async fetchLabTestTypes() {
      try {
        const response = await api.get('/api/v1/lab-test-types');
        this.labTestTypes = response.data;
      } catch (error) {
        console.error('Tahlil turlari yuklanishda xato:', error);
        alert('Tahlil turlari yuklanishda xatolik yuz berdi');
      }
    },

    async fetchTestParameters() {
      try {
        const url = this.selectedLabTestTypeId
          ? `/api/v1/test-parameters?lab_test_type_id=${this.selectedLabTestTypeId}`
          : '/api/v1/test-parameters';

        const response = await api.get(url);
        this.testParameters = response.data;
      } catch (error) {
        console.error('Parametrlar yuklanishda xato:', error);
        alert('Parametrlar yuklanishda xatolik yuz berdi');
      }
    },

    getLabTestTypeName(id) {
      const type = this.labTestTypes.find(t => t.id === id);
      return type ? type.name : '-';
    },

    async addParameter() {
      try {
        if (!this.newParameter.lab_test_type_id) {
          alert('Iltimos, tahlil turini tanlang!');
          return;
        }

        const payload = {
          lab_test_type_id: this.newParameter.lab_test_type_id,
          name: this.newParameter.name,
          description: this.newParameter.description,
          unit: this.newParameter.unit,
          normal_range: this.newParameter.normal_range
        };

        await api.post('/api/v1/test-parameters', payload);
        alert('Parametr muvaffaqiyatli qo‘shildi');

        this.newParameter = {
          lab_test_type_id: '',
          name: '',
          description: '',
          unit: '',
          normal_range: ''
        };

        this.fetchTestParameters();
      } catch (error) {
        console.error('Parametr qo‘shishda xato:', error);
        alert(
          error.response?.data?.message || 'Parametr qo‘shishda xatolik yuz berdi'
        );
      }
    },

    editParameter(id) {
      this.$router.push({ name: 'edit-test-parameter', params: { id } });
    },

    async deleteParameter(id) {
      if (confirm('Siz ushbu parametrni o‘chirishni xohlaysizmi?')) {
        try {
          await api.delete(`/api/v1/test-parameters/${id}`);
          alert('Parametr muvaffaqiyatli o‘chirildi');
          this.fetchTestParameters();
        } catch (error) {
          console.error('Parametrni o‘chirishda xatolik:', error);
          alert('Parametrni o‘chirishda xatolik yuz berdi');
        }
      }
    },

    async copyParameter(id) {
      try {
        await api.post(`/api/v1/test-parameters/${id}/copy`);
        alert('Parametr muvaffaqiyatli nusxalandi');
        this.fetchTestParameters();
      } catch (error) {
        console.error('Parametrni nusxalashda xatolik:', error);
        alert('Parametrni nusxalashda xatolik yuz berdi');
      }
    }
  }
};
</script>

<style scoped>
.contaner{
  max-width: 1200px;
  padding:20px;
  margin:20px auto;
  
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th,
td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
button {
  margin-right: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
form {
  margin-top: 25px;
}
label {
  display: block;
  margin: 5px 0;
}
input,
textarea,
select {
  width: 100%;
  padding: 8px;
  margin: 5px 0 15px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}
button[type='submit'] {
  background-color: #28a745;
}
button[type='submit']:hover {
  background-color: #218838;
}
</style>
