<template>
  <div class="xodimlar-container">
    <div class="header">
      <h2>🧑‍💼 Xodimlar ro‘yxati</h2>
      <button @click="toggleView" class="toggle-btn">
        {{ tableView ? '🔳 Card ko‘rinishi' : '📋 Jadval ko‘rinishi' }}
      </button>
      <button @click="openModal()" class="add-btn">➕ Yangi xodim qo'shish</button>
    </div>

    <!-- JADVAL KO‘RINISHI -->
    <table v-if="tableView" class="xodim-table">
      <thead>
        <tr>
          <th>F.I.Sh</th>
          <th>Roli</th>
          <th>Telefon</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="xodim in xodimlar" 
          :key="xodim.id" 
          @click="openModal(xodim)" 
          class="xodim-row"
        >
          <td>{{ xodim.ism }} {{ xodim.familiya }}</td>
          <td>
            <span class="badge" :class="getRoleClass(xodim.rol)">
              {{ xodim.rol }}
            </span>
          </td>
          <td>{{ xodim.telefon }}</td>
          <td>{{ xodim.email }}</td>
        </tr>
      </tbody>
    </table>

    <!-- CARD KO‘RINISHI -->
    <div v-else class="xodimlar-list">
      <div
        v-for="xodim in xodimlar"
        :key="xodim.id"
        class="xodim-card"
        @click="openModal(xodim)"
      >
        <div class="xodim-info">
          <h3>{{ xodim.ism }} {{ xodim.familiya }}</h3>
          <span class="badge" :class="getRoleClass(xodim.rol)">
            {{ xodim.rol }}
          </span>
        </div>
        <p>📞 {{ xodim.telefon }}</p>
        <p>✉️ {{ xodim.email }}</p>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? "Xodim ma'lumotlarini tahrirlash" : "Yangi xodim qo‘shish" }}</h3>
        <form @submit.prevent="saveXodim">
          <div class="row">
            <label class="half-width">
              Ism:
              <input v-model="form.ism" type="text" required />
            </label>

            <label class="half-width">
              Familiya:
              <input v-model="form.familiya" type="text" required />
            </label>
          </div>

          <label>
            Rol:
            <select v-model="form.rol" required>
              <option disabled value="">Rolni tanlang</option>
              <option>Qabulxona</option>
              <option>Mini admin</option>
              <option>Laborant</option>
              <option>Boshqa</option>
            </select>
          </label>

          <label>
            Telefon:
            <input v-model="form.telefon" type="tel" required />
          </label>

          <label>
            Email:
            <input v-model="form.email" type="email" required />
          </label>

          <div v-if="!isEditing" class="row">
            <label class="half-width">
              Parol:
              <input v-model="form.parol" type="password" required />
            </label>
            <label class="half-width">
              Parolni tasdiqlash:
              <input v-model="form.parol2" type="password" required />
            </label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditing ? "Saqlash" : "Qo'shish" }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">Bekor qilish</button>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Xodimlar",
  data() {
    return {
      tableView: false,
      showModal: false,
      isEditing: false,
      formError: null,
      xodimlar: [
        { id: 1, ism: "Zafarjon", familiya: "Zufaraliyev", rol: "Qabulxona", telefon: "+998901234567", email: "zafar@example.com" },
        { id: 2, ism: "Dilshod", familiya: "Karimov", rol: "Mini admin", telefon: "+998901112233", email: "dilshod@example.com" },
        { id: 3, ism: "Gulnoza", familiya: "Toshpulatova", rol: "Laborant", telefon: "+998909998877", email: "gulnoza@example.com" },
      ],
      form: {
        ism: "",
        familiya: "",
        rol: "",
        telefon: "",
        email: "",
        parol: "",
        parol2: "",
      },
    };
  },
  methods: {
    toggleView() {
      this.tableView = !this.tableView;
    },
    openModal(xodim = null) {
      this.formError = null;
      if (xodim) {
        // Tahrirlash uchun modal
        this.isEditing = true;
        this.form = { ...xodim, parol: "", parol2: "" };
      } else {
        // Yangi xodim qo'shish
        this.isEditing = false;
        this.resetForm();
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    resetForm() {
      this.form = {
        ism: "",
        familiya: "",
        rol: "",
        telefon: "",
        email: "",
        parol: "",
        parol2: "",
      };
    },
    getRoleClass(role) {
      switch ((role || "").toLowerCase()) {
        case "qabulxona":
          return "badge-qabulxona";
        case "mini admin":
          return "badge-mini";
        case "laborant":
          return "badge-lab";
        default:
          return "badge-default";
      }
    },
    saveXodim() {
      this.formError = null;

      // Validatsiyalar
      if (!this.form.ism || !this.form.familiya || !this.form.rol || !this.form.telefon || !this.form.email) {
        this.formError = "Iltimos, barcha maydonlarni to‘ldiring!";
        return;
      }
      if (!this.form.email.includes("@")) {
        this.formError = "Iltimos, to‘g‘ri email kiriting!";
        return;
      }
      if (this.form.telefon.length < 9) {
        this.formError = "Telefon raqamingiz noto‘g‘ri!";
        return;
      }

      if (this.isEditing) {
        // Tahrirlash - faqat mavjud xodimni yangilash
        const idx = this.xodimlar.findIndex(x => x.id === this.form.id);
        if (idx !== -1) {
          this.xodimlar.splice(idx, 1, { ...this.form });
          this.closeModal();
        } else {
          this.formError = "Xodim topilmadi!";
        }
      } else {
        // Qo'shish - yangi ID avtomatik beriladi
        if (this.form.parol !== this.form.parol2) {
          this.formError = "Parollar mos emas!";
          return;
        }
        const yangiId = this.xodimlar.length ? Math.max(...this.xodimlar.map(x => x.id)) + 1 : 1;
        const yangiXodim = { ...this.form, id: yangiId };
        delete yangiXodim.parol;
        delete yangiXodim.parol2;
        this.xodimlar.push(yangiXodim);
        this.closeModal();
      }
    },
  },
};
</script>



<style>
     .xodimlar-container {
  padding: 20px;
  margin: 20px 20px 20px 290px;
  max-width: 1300px;
  font-family: 'Segoe UI', sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}
.toggle-btn, .add-btn {
  background: linear-gradient(135deg, #2980b9, #6dd5fa);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.toggle-btn:hover, .add-btn:hover {
  background: linear-gradient(135deg, #2471a3, #58b7f4);
  transform: scale(1.03);
}
.add-btn {
  margin-left: 10px;
}

/* CARD KO‘RINISH */
.xodimlar-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 10px;
}
.xodim-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  padding: 20px;
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}
.xodim-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}
.xodim-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.xodim-info h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}
.badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  color: #fff;
  white-space: nowrap;
}
.badge-qabulxona {
  background-color: #2980b9;
}
.badge-mini {
  background-color: #27ae60;
}
.badge-lab {
  background-color: #8e44ad;
}
.badge-default {
  background-color: #7f8c8d;
}

/* JADVAL KO‘RINISH */
.xodim-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  cursor: pointer;
}
.xodim-table th,
.xodim-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 15px;
  color: #34495e;
}
.xodim-table th {
  background-color: #f8f9fa;
}
.xodim-table tr:hover {
  background-color: #f2f8fc;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal {
  background: white;
  padding: 30px 40px;
  border-radius: 20px;
  width: 550px; /* kengaytirildi */
  max-width: 95%;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  max-height: 90vh;
  overflow-y: auto;
}
.modal h3 {
  margin-top: 0;
  margin-bottom: 25px;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
}
.modal form label {
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: #34495e;
}
.modal form input,
.modal form select {
  width: 100%;
  padding: 10px 12px;
  margin-top: 6px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}
.modal form input:focus,
.modal form select:focus {
  border-color: #2980b9;
  outline: none;
}

/* Ism va Familiya bitta qatorda */
.row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}
.half-width {
  flex: 1;
}

/* MODAL TUGMALAR */
.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
.save-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 6px 14px rgba(39,174,96,0.6);
  transition: background-color 0.3s ease;
}
.save-btn:hover {
  background-color: #1e8449;
}
.cancel-btn {
  background: #c0392b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 6px 14px rgba(192,57,43,0.6);
  transition: background-color 0.3s ease;
}
.cancel-btn:hover {
  background-color: #922b21;
}
.form-error {
  margin-top: 20px;
  color: #c0392b;
  font-weight: 700;
  text-align: center;
}

/* Responsive */
@media (max-width: 620px) {
  .modal {
    width: 95%;
    padding: 25px 20px;
  }
  .row {
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 12px;
  }
  .toggle-btn, .add-btn {
    width: 100%;
    margin-left: 0 !important;
  }
}

</style>
