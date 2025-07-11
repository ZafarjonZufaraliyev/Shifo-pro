<template>
  <div class="recipe-page">
    <h2>🍽 Retseptlar (1 kishi uchun)</h2>

    <table class="recipe-table">
      <thead>
        <tr>
          <th>Ovqat nomi</th>
          <th>Mahsulot nomi</th>
          <th>Miqdori</th>
          <th>Birlik</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in recipes" :key="index">
          <td>{{ item.ovqat }}</td>
          <td>{{ item.maxsulot }}</td>
          <td>
            <input
              type="number"
              v-model.number="item.miqdori"
              min="0"
              step="0.01"
            />
          </td>
          <td>{{ item.birlik }}</td>
          <td>
            <button @click="deleteRecipe(index)" title="O‘chirish">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>➕ Yangi retsept qo‘shish</h3>
    <form @submit.prevent="addRecipe" class="add-form">
      <!-- Ovqat nomini select qilib oldik -->
      <select v-model="newRecipe.ovqat" required>
        <option disabled value="">Ovqat nomini tanlang</option>
        <option
          v-for="ovqat in uniqueOvqatlar"
          :key="ovqat"
          :value="ovqat"
        >
          {{ ovqat }}
        </option>
      </select>

      <!-- Agar yangi ovqat nomi qo‘shmoqchi bo‘lsa, input chiqadi -->
      <input
        v-if="newRecipe.ovqat === 'new'"
        v-model="newOvqatNomi"
        placeholder="Yangi ovqat nomi kiriting"
        @input="newRecipe.ovqat = newOvqatNomi"
      />

      <input v-model="newRecipe.maxsulot" placeholder="Mahsulot nomi" required />

      <input
        v-model.number="newRecipe.miqdori"
        type="number"
        step="0.01"
        min="0"
        placeholder="Miqdori (1 kishi uchun)"
        required
      />
      <input v-model="newRecipe.birlik" placeholder="Birlik (kg, l, dona)" required />

      <button type="submit">Qo‘shish</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "RecipePage",
  data() {
    return {
      recipes: [
        {
          ovqat: "Palov",
          maxsulot: "G‘alla (guruch)",
          miqdori: 0.2,
          birlik: "kg",
        },
        {
          ovqat: "Palov",
          maxsulot: "Go‘sht",
          miqdori: 0.15,
          birlik: "kg",
        },
        {
          ovqat: "Shurva",
          maxsulot: "Sabzi",
          miqdori: 0.1,
          birlik: "kg",
        },
      ],
      newRecipe: {
        ovqat: "",
        maxsulot: "",
        miqdori: 0,
        birlik: "",
      },
      newOvqatNomi: "",
    };
  },
  computed: {
    uniqueOvqatlar() {
      // Noyob ovqat nomlarini olish va oxiriga "Yangi ovqat qo'shish" qo'shish
      const ovqatSet = new Set(this.recipes.map((r) => r.ovqat));
      return [...ovqatSet, "new"];
    },
  },
  methods: {
    addRecipe() {
      this.newRecipe.ovqat = this.newRecipe.ovqat.trim();
      this.newRecipe.maxsulot = this.newRecipe.maxsulot.trim();
      this.newRecipe.birlik = this.newRecipe.birlik.trim();

      if (
        !this.newRecipe.ovqat ||
        !this.newRecipe.maxsulot ||
        !this.newRecipe.birlik ||
        this.newRecipe.miqdori <= 0
      ) {
        alert("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring.");
        return;
      }

      this.recipes.push({ ...this.newRecipe });

      // Yangi ovqat nomi inputini va formani tozalash
      this.newRecipe = { ovqat: "", maxsulot: "", miqdori: 0, birlik: "" };
      this.newOvqatNomi = "";
    },
    deleteRecipe(index) {
      if (confirm("Haqiqatan o‘chirmoqchimisiz?")) {
        this.recipes.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.recipe-page {
  max-width: 1200px;
  margin: 20px auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgb(0 0 0 / 0.1);
}

h2 {
  margin-bottom: 25px;
  text-align: center;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 1px;
}

.recipe-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
  font-size: 16px;
}

.recipe-table th,
.recipe-table td {
  border: 1px solid #ccc;
  padding: 12px 15px;
  text-align: left;
}

.recipe-table th {
  background-color: #16a085;
  color: white;
  text-transform: uppercase;
}

input[type="number"],
select,
input[type="text"] {
  width: 170px;
  padding: 6px 8px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 15px;
}

.add-form {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.add-form input,
.add-form select {
  min-width: 170px;
}

.add-form button {
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 25px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-form button:hover {
  background-color: #1e874b;
}
</style>
