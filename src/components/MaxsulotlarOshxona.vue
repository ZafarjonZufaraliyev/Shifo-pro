<template>
  <div class="oshpaz-page">
    <h2>👨‍🍳 Oshxona: Maxsulotlar holati</h2>

    <div class="filter">
      <label>📅 Sanani tanlang: </label>
      <input type="date" v-model="filterDate" />
      <button @click="clearFilter" class="btn-clear">Filterni tozalash</button>
    </div>

    <div v-if="filteredProducts.length === 0" class="no-data">
      Hech qanday mahsulot topilmadi.
    </div>

    <div v-for="(items, sana) in groupedProducts" :key="sana" class="group">
      <h3>📅 {{ sana }}</h3>
      <table class="product-table">
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Miqdori</th>
            <th>Birlik</th>
            <th>Vaqt</th>
            <th>Holat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ item.nomi }}</td>
            <td>{{ item.miqdori }}</td>
            <td>{{ item.birlik }}</td>
            <td>{{ item.time }}</td>
            <td>
              <span :class="item.status === 'tasdiqlandi' ? 'confirmed' : 'pending'">
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "OshpazSahifa",
  data() {
    return {
      filterDate: "",
      products: [
        {
          nomi: "Un",
          miqdori: 10,
          birlik: "kg",
          date: "2025-07-10",
          time: "10:00",
          status: "tasdiqlandi",
        },
        {
          nomi: "Yog'",
          miqdori: 5,
          birlik: "liter",
          date: "2025-07-10",
          time: "10:00",
          status: "tasdiqlandi",
        },
        {
          nomi: "Non",
          miqdori: 50,
          birlik: "ta",
          date: "2025-07-10",
          time: "10:00",
          status: "Tasdiqlanmagan",
        },
        {
          nomi: "Tuxum",
          miqdori: 10,
          birlik: "ta",
          date: "2025-07-10",
          time: "10:00",
          status: "Tasdiqlanmagan",
        },
        {
          nomi: "Sut",
          miqdori: 20,
          birlik: "litr",
          date: "2025-07-09",
          time: "08:30",
          status: "tasdiqlandi",
        },
        {
          nomi: "Tuxum",
          miqdori: 50,
          birlik: "dona",
          date: "2025-07-08",
          time: "15:45",
          status: "tasdiqlandi",
        },
        {
          nomi: "Shakar",
          miqdori: 30,
          birlik: "kg",
          date: "2025-07-09",
          time: "12:00",
          status: "Tasdiqlanmagan",
        },
      ],
    };
  },
  computed: {
    filteredProducts() {
      let prods = this.products;
      if (this.filterDate) {
        prods = prods.filter((p) => p.date === this.filterDate);
      }
      return prods; // hammasi chiqadi: kutilmoqda va tasdiqlandi
    },
    groupedProducts() {
      const groups = {};
      this.filteredProducts.forEach((p) => {
        if (!groups[p.date]) groups[p.date] = [];
        groups[p.date].push(p);
      });
      return groups;
    },
  },
  methods: {
    clearFilter() {
      this.filterDate = "";
    },
  },
};
</script>

<style scoped>
.oshpaz-page {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 1px;
}

.filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter label {
  font-weight: 600;
  color: #34495e;
  user-select: none;
}

.filter input[type="date"] {
  padding: 6px 10px;
  font-size: 16px;
  border: 2px solid #2980b9;
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

.filter input[type="date"]:focus {
  outline: none;
  border-color: #1abc9c;
}

.btn-clear {
  padding: 7px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-clear:hover {
  background-color: #c0392b;
}

.group {
  margin-bottom: 35px;
  border-left: 5px solid #1abc9c;
  padding-left: 15px;
  background: #ecf0f1;
  border-radius: 8px;
}

.group h3 {
  margin-bottom: 12px;
  font-weight: 600;
  color: #16a085;
  letter-spacing: 0.6px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 7px rgb(0 0 0 / 0.1);
}

.product-table th,
.product-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.product-table thead th {
  background-color: #16a085;
  color: white;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.product-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.product-table tbody tr:hover {
  background-color: #d1f0e7;
  transition: background-color 0.3s ease;
  cursor: default;
}

.confirmed {
  color: #27ae60;
  font-weight: 700;
  background-color: #d5f5e3;
  padding: 4px 10px;
  border-radius: 15px;
  display: inline-block;
  text-transform: capitalize;
}

.pending {
  color: rgb(222, 149, 149);
  font-weight: 700;
  background-color: red;
  padding: 4px 10px;
  border-radius: 15px;
  display: inline-block;
  text-transform: capitalize;
}

.no-data {
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 40px;
}
</style>
