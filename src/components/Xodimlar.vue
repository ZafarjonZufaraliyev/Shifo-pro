<template>
  <div class="xodimlar-container">
    <div class="header">
      <h2>🧑‍💼 Xodimlar ro‘yxati</h2>
      <div class="header-buttons">
        <button @click="toggleView" class="toggle-btn">
          {{ tableView ? '🔳 Card ko‘rinishi' : '📋 Jadval ko‘rinishi' }}
        </button>
        <button @click="openModal()" class="add-btn">➕ Yangi xodim qo‘shish</button>
      </div>
    </div>

    <!-- Spinner -->
    <div v-if="loading" class="spinner">⏳ Yuklanmoqda...</div>

    <!-- Jadval -->
    <table v-if="!loading && tableView" class="xodim-table">
      <thead>
        <tr>
          <th>F.I.Sh</th>
          <th>Roli</th>
          <th>Telefon</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="xodim in xodimlar" :key="xodim.id" @click="openModal(xodim)" style="cursor:pointer">
          <td>{{ xodim.ism }} {{ xodim.familiya }}</td>
          <td><span class="badge" :class="getRoleClass(xodim.rol)">{{ xodim.rol }}</span></td>
          <td>{{ xodim.telefon }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Card -->
    <div v-if="!loading && !tableView" class="xodimlar-list">
      <div v-for="xodim in xodimlar" :key="xodim.id" class="xodim-card" @click="openModal(xodim)">
        <div class="xodim-info">
          <h3>{{ xodim.ism }} {{ xodim.familiya }}</h3>
          <span class="badge" :class="getRoleClass(xodim.rol)">{{ xodim.rol }}</span>
        </div>
        <p>📞 {{ xodim.telefon }}</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? "Xodimni tahrirlash" : "Yangi xodim qo‘shish" }}</h3>
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
            Roli:
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

          <label>
            Login:
            <input v-model="form.login" type="text" required />
          </label>

          <button type="button" class="toggle-security" @click="showSecurity = !showSecurity">
            🔐 Parolni o‘zgartirish
          </button>

          <div class="row" v-if="!isEditing || showSecurity">
            <label class="half-width">
              Parol:
              <input v-model="form.parol" type="password" :required="!isEditing" />
            </label>
            <label class="half-width">
              Parolni tasdiqlash:
              <input v-model="form.parol2" type="password" :required="!isEditing" />
            </label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditing ? "Saqlash" : "Qo‘shish" }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">Bekor qilish</button>
            <button v-if="isEditing" type="button" @click="deleteXodim(form.id)" class="delete-btn">
              ❌ O‘chirish
            </button>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      loading: false,
      tableView: true,
      showModal: false,
      isEditing: false,
      showSecurity: false,
      formError: null,
      xodimlar: [],
      form: {
        id: null,
        ism: "",
        familiya: "",
        rol: "",
        telefon: "",
        email: "",
        login: "",
        parol: "",
        parol2: "",
      },
    };
  },
  mounted() {
    this.fetchXodimlar();
  },
  methods: {
    toggleView() {
      this.tableView = !this.tableView;
    },
    async fetchXodimlar() {
      this.loading = true;
      try {
        const response = await api.get("/api/v1/users");
        this.xodimlar = response.data.map((user) => {
          const nameParts = user.name.trim().split(" ");
          return {
            id: user.id,
            ism: nameParts[0] || "",
            familiya: nameParts.slice(1).join(" "),
            rol: this.mapRole(user.section_id),
            telefon: user.phone,
            email: user.email,
            login: user.username,
          };
        });
      } catch (err) {
        this.formError = "Xodimlarni yuklashda xatolik.";
      } finally {
        this.loading = false;
      }
    },
    mapRole(id) {
      const roles = { 1: "Qabulxona", 2: "Mini admin", 3: "Laborant" };
      return roles[id] || "Boshqa";
    },
    getRoleClass(role) {
      switch ((role || "").toLowerCase()) {
        case "qabulxona": return "badge-qabulxona";
        case "mini admin": return "badge-mini";
        case "laborant": return "badge-lab";
        default: return "badge-default";
      }
    },
    openModal(xodim = null) {
      this.formError = null;
      this.showSecurity = false;
      if (xodim) {
        this.isEditing = true;
        this.form = { ...xodim, parol: "", parol2: "" };
      } else {
        this.isEditing = false;
        this.resetForm();
        this.showSecurity = true;
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
      this.formError = null;
      this.isEditing = false;
      this.showSecurity = false;
    },
    resetForm() {
      this.form = {
        id: null,
        ism: "",
        familiya: "",
        rol: "",
        telefon: "",
        email: "",
        login: "",
        parol: "",
        parol2: "",
      };
    },
    async saveXodim() {
      this.formError = null;

      // Valids
      if (
        !this.form.ism || !this.form.familiya || !this.form.rol ||
        !this.form.telefon || !this.form.email || !this.form.login
      ) return this.formError = "Barcha maydonlarni to‘ldiring!";
      if (!this.form.email.includes("@")) return this.formError = "Email noto‘g‘ri!";
      if (this.form.telefon.length < 9) return this.formError = "Telefon noto‘g‘ri!";
      if (!this.isEditing || this.showSecurity) {
        if (!this.form.parol || !this.form.parol2) return this.formError = "Parollar kerak!";
        if (this.form.parol !== this.form.parol2) return this.formError = "Parollar mos emas!";
      }

      const payload = {
        name: `${this.form.ism} ${this.form.familiya}`,
        email: this.form.email,
        phone: this.form.telefon,
        username: this.form.login,
        password: this.form.parol,
        password_confirmation: this.form.parol2,
        role: this.form.rol,
      };

      try {
        if (this.isEditing) {
          await api.put(`/api/v1/users/${this.form.id}`, payload);
        } else {
          await api.post("/api/v1/register", payload);
        }
        await this.fetchXodimlar();
        this.closeModal();
      } catch (e) {
        this.formError = e.response?.data?.message || "Xatolik yuz berdi.";
      }
    },
    async deleteXodim(id) {
      try {
        await api.delete(`/api/v1/users/${id}`);
        await this.fetchXodimlar();
        this.closeModal();
      } catch (err) {
        this.formError = "O‘chirishda xatolik.";
      }
    },
  },
};
</script>




<style scoped>
/* Umumiy konteyner */
.xodimlar-container {
  padding: 20px;
  margin: 20px 20px 20px 290px;
  max-width: 1300px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f8fb;
  color: #2c3e50;
}
.spinner {
  text-align: center;
  margin: 30px;
  font-size: 18px;
  color: #2980b9;
  font-weight: bold;
  animation: spin 1s infinite linear;
}
@keyframes spin {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}
/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.header h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #34495e;
}

/* Tugmalar */
.toggle-btn,
.add-btn,
.save-btn,
.cancel-btn,
.delete-btn,
.toggle-security {
  cursor: pointer;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
  transition: all 0.25s ease;
  user-select: none;
}

.toggle-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: #fff;
}
.toggle-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1c5980);
  transform: scale(1.05);
}

.add-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: #fff;
  margin-left: 10px;
}
.add-btn:hover {
  background: linear-gradient(135deg, #219150, #27ae60);
  transform: scale(1.05);
}

.save-btn {
  background-color: #27ae60;
  color: #fff;
  box-shadow: 0 6px 14px rgba(39, 174, 96, 0.6);
}
.save-btn:hover {
  background-color: #1e8449;
}

.cancel-btn {
  background-color: #e74c3c;
  color: #fff;
  box-shadow: 0 6px 14px rgba(231, 76, 60, 0.6);
}
.cancel-btn:hover {
  background-color: #c0392b;
}

.delete-btn {
  background-color: #c0392b;
  color: #fff;
  box-shadow: 0 6px 14px rgba(192, 57, 43, 0.8);
  margin-left: auto;
}
.delete-btn:hover {
  background-color: #922b21;
}

.toggle-security {
  background-color: #34495e;
  color: #fff;
  margin-top: 10px;
  width: 100%;
}
.toggle-security:hover {
  background-color: #2c3e50;
}

/* Badge */
.badge {
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-transform: capitalize;
  white-space: nowrap;
  user-select: none;
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

/* Jadval ko‘rinishi */
.xodim-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 15px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.07);
  cursor: pointer;
}
.xodim-table thead tr th {
  background: #ecf0f1;
  font-weight: 700;
  padding: 14px 18px;
  text-align: left;
  color: #34495e;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  user-select: none;
}
.xodim-table tbody tr {
  background: #fff;
  transition: background-color 0.3s ease;
  border-radius: 14px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.xodim-table tbody tr:hover {
  background-color: #f0f8ff;
}
.xodim-table tbody tr td {
  padding: 14px 18px;
  border-bottom: none;
  color: #2c3e50;
  font-size: 15px;
}

/* Card ko‘rinishi */
.xodimlar-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 15px;
}
.xodim-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.07);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}
.xodim-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 14px 40px rgba(0,0,0,0.12);
}
.xodim-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.xodim-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1100;
}
.modal {
  background-color: #fff;
  border-radius: 20px;
  width: 560px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px 40px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.25);
  user-select: none;
}
.modal h3 {
  margin: 0 0 25px 0;
  font-weight: 800;
  color: #34495e;
  text-align: center;
}

/* Form */
.modal form label {
  display: block;
  margin-bottom: 14px;
  font-weight: 600;
  color: #34495e;
}
.modal form input,
.modal form select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #ccc;
  font-size: 15px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}
.modal form input:focus,
.modal form select:focus {
  outline: none;
  border-color: #2980b9;
}

/* Ism va Familiya bitta qatorda */
.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.half-width {
  flex: 1;
}

/* Modal tugmalar joylashuvi */
.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  flex-wrap: wrap;
}

.modal-actions button {
  min-width: 120px; /* Tugma minimal kengligi */
  padding: 10px 24px;
  font-size: 15px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

@media (max-width: 480px) {
  .modal-actions {
    justify-content: center;
  }
  .modal-actions button {
    flex: 1 1 100%;
    max-width: 100%;
    margin-bottom: 10px;
  }
  .modal-actions button:last-child {
    margin-bottom: 0;
  }
}
</style>