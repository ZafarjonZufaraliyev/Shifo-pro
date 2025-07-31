<template>
  <div>
    <h2>Tahlil turlari ro'yxati</h2>

    <!-- Tahlil turlari ro'yxatini ko'rsatish -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tahlil nomi</th>
          <th>Birlik</th>
          <th>Normal oralig'i</th>
          <th>Harakatlar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in labTests" :key="test.id">
          <td>{{ test.id }}</td>
          <td>{{ test.name }}</td>
          <td>{{ test.unit }}</td>
          <td>{{ test.normal_range }}</td>
          <td>
            <button @click="editTest(test.id)">Tahrir</button>
            <button @click="deleteTest(test.id)">O'chirish</button>
            <button @click="copyTest(test.id)">Nusxalash</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Yangi tahlil qo'shish formasi -->
    <div>
      <h3>Yangi Tahlil Qo'shish</h3>
      <form @submit.prevent="addLabTest">
        <div>
          <label for="name">Tahlil nomi:</label>
          <input type="text" id="name" v-model="newLabTest.name" required />
        </div>

        <div>
          <label for="description">Tahlil tavsifi:</label>
          <textarea id="description" v-model="newLabTest.description"></textarea>
        </div>

        <div>
          <label for="unit">Birlik:</label>
          <input type="text" id="unit" v-model="newLabTest.unit" required />
        </div>

        <div>
          <label for="normal_range">Normal oralig'i:</label>
          <input type="text" id="normal_range" v-model="newLabTest.normal_range" required />
        </div>

        <button type="submit">Qo'shish</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/api';
export default {
  data() {
    return {
      labTests: [],  // Tahlil turlari ro'yxati
      newLabTest: {
        name: '',
        description: '',
        unit: '',
        normal_range: '',
      },
    };
  },
  mounted() {
    this.fetchLabTests();
  },
  methods: {
    // Tahlil turlarini olish
    async fetchLabTests() {
      try {
        const response = await fetch('/api/lab-test-results');
        this.labTests = await response.json();
        console.log(this.labTests)
      } catch (error) {
        console.error('Tahlil turlari yuklanishda xato:', error);
      }
    },

    // Yangi tahlil qo'shish
    async addLabTest() {
      try {
        const response = await fetch('/api/lab-test-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newLabTest),
        });

        if (response.ok) {
          alert('Tahlil muvaffaqiyatli qo‘shildi');
          this.newLabTest = { name: '', description: '', unit: '', normal_range: '' };  // Formani tozalash
          this.fetchLabTests();  // Yangi tahlil qo'shilgandan so'ng ro'yxatni yangilash
        } else {
          alert('Tahlil qo‘shishda xato!');
        }
      } catch (error) {
        console.error('Xatolik:', error);
      }
    },

    // Tahlil turini tahrirlash
    editTest(id) {
      this.$router.push({ name: 'edit-lab-test', params: { id } });
    },

    // Tahlil turini o‘chirish
    async deleteTest(id) {
      if (confirm('Siz ushbu tahlil turini o‘chirishni xohlaysizmi?')) {
        try {
          const response = await fetch(`/api/lab-tests/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            this.fetchLabTests();  // O'chirishdan so'ng ro'yxatni yangilash
          } else {
            alert('Tahlilni o‘chirishda xatolik!');
          }
        } catch (error) {
          console.error('Xatolik:', error);
        }
      }
    },

    // Tahlil turini nusxalash
    async copyTest(id) {
      try {
        const response = await fetch(`/api/lab-tests/${id}/copy`, {
          method: 'POST',
        });
        if (response.ok) {
          this.fetchLabTests();  // Nusxalashdan so'ng ro'yxatni yangilash
        } else {
          alert('Nusxalashda xatolik!');
        }
      } catch (error) {
        console.error('Xatolik:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Styling for the table and form */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
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
  margin-top: 20px;
}

label {
  display: block;
  margin: 5px 0;
}

input, textarea {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
}

button[type="submit"] {
  background-color: #28a745;
}

button[type="submit"]:hover {
  background-color: #218838;
}
</style>
