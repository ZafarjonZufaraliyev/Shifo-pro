  <template>
    <div class="containerr">
      <h2 class="title">To‘lov qo‘shish</h2>

      <!-- To‘lov turi -->
      <div class="form-group">
        <label class="label">To‘lov turi:</label>
        <select v-model="form.type" class="input">
          <option value="kirim">Kirim</option>
          <option value="chiqim">Chiqim</option>
        </select>
      </div>

      <!-- Kimdan -->
      <div class="form-group">
        <label class="label">Kimdan:</label>
        <select v-model="form.from" class="input">
          <option value="bemor-kassa">Bemor</option>
          <option value="tashqi">Tashqi</option>
        </select>
      </div>

      <!-- Bemor qidiruvi -->
      <div class="form-group" v-if="form.from === 'bemor-kassa'">
        <label class="label">Bemorni qidiring:</label>
        <input
          type="text"
          v-model="searchClient"
          placeholder="Ism, familiya, sharif yoki passport ID"
          class="input"
        />
        <ul class="client-list" v-if="searchClient && filteredClients.length">
          <li
            v-for="item in filteredClients"
            :key="item.id"
            @click="selectClient(item)"
            class="client-item"
          >
            <span v-if="typeof item.client === 'string'">{{ item.client }}</span>
            <span v-else>{{ item.client.familiya }} {{ item.client.ism }} {{ item.client.sharif }}</span>
            ({{ item.kelish_sanasi }} - {{ item.ketish_sanasi }})
            <span v-if="item.client?.passport"> - {{ item.client.passport }}</span>
          </li>
        </ul>
        <p v-else-if="searchClient">Hech narsa topilmadi</p>
      </div>

      <!-- Bemor ma'lumotlari -->
      <div v-if="client" class="info">
        <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }} {{ client.sharif }}</p>
        <p><strong>Telefon:</strong> {{ client.tel1 || client.phone }}</p>
        <p v-if="client.passport"><strong>Passport ID:</strong> {{ client.passport }}</p>
      </div>

      <!-- Qarzi yoki haqqi -->
      <div v-if="client">
        <p v-if="client.status === 'qarzdor'" style="color:red">
          Qarzi: {{ client.total_due?.toLocaleString() }} so‘m
        </p>
        <p v-else-if="client.status === 'haqdor'" style="color:green">
          Haqqi: {{ client.balance?.toLocaleString() }} so‘m
        </p>
        <p v-else style="color:blue">
          Qarzi yo‘q
        </p>
      </div>

      <!-- To‘lov summasi -->
      <form @submit.prevent="submitPayment">
        <div class="form-row">
          <div>
            <label class="label">Naqd:</label>
            <input v-model.number="form.cash" type="number" class="input" min="0" />
          </div>
          <div>
            <label class="label">Karta:</label>
            <input v-model.number="form.card" type="number" class="input" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div>
            <label class="label">Click:</label>
            <input v-model.number="form.click" type="number" class="input" min="0" />
          </div>
          <div>
            <label class="label">Humo:</label>
            <input v-model.number="form.humo" type="number" class="input" min="0" />
          </div>
        </div>

        <p class="total">
          Umumiy summa: <strong>{{ totalAmount.toLocaleString() }}</strong> so‘m
        </p>
        <textarea v-model="form.note" class="textarea" readonly></textarea>

        <button type="submit" class="btn" :disabled="!client || totalAmount === 0">
          Saqlash
        </button>
      </form>
    </div>
  </template>

  <script>
  import api from "@/api";
  import { useRouter } from "vue-router";

  export default {
    name: "KassaTolovQoshish",
    data() {
      return {
        router: useRouter(),
        davolanishlar: [],
        selectedDavolanishId: "",
        client: null,
        searchClient: "",
        form: {
          cash: 0,
          card: 0,
          click: 0,
          humo: 0,
          note: "",
          type: "kirim",
          from: "bemor-kassa",
          fromDetail: "",
          is_patient_payment: 1,
          user_id: null,
          cashier: "",
        },
      };
    },
    computed: {
      totalAmount() {
      if (!this.payments) return 0;
      return this.payments.reduce((sum, p) => sum + (p.room_total || 0) + (p.service_total || 0), 0);
    },
      balance() {
        if (!this.client) return 0;
        const paid = Number(this.client.paid || 0);
        const due = Number(this.client.total_due || 0);
        const bal = paid - due;
        console.log("Computed balance:", bal, "for client:", this.client);
        return bal;
      },
      filteredClients() {
        if (!this.searchClient) return [];
        const q = this.normalizeText(this.searchClient);
        const filtered = this.davolanishlar.filter((d) => {
          if (typeof d.client === "string") {
            return this.normalizeText(d.client).includes(q);
          } else {
            const name = this.normalizeText(`${d.client.familiya} ${d.client.ism} ${d.client.sharif}`);
            const passport = this.normalizeText(d.client.passport);
            return name.includes(q) || passport.includes(q);
          }
        });
        console.log("Filtered clients for search:", this.searchClient, filtered);
        return filtered;
      },
    },
    methods: {
      normalizeText(str) {
        return (str || "")
          .toString()
          .toLowerCase()
          .replace(/[ё]/g, "е")
          .replace(/[й]/g, "и")
          .replace(/[ъ]/g, "")
          .replace(/[ь]/g, "");
      },
      async fetchClients() {
        try {
          const res = await api.get("/api/v1/davolanish");
          this.davolanishlar = res.data?.data || [];
          console.log("Fetched clients:", this.davolanishlar);
        } catch (e) {
          console.error("Bemorlar ro‘yxatini olishda xatolik:", e);
        }
      },
      async fetchClientPayments(clientId) {
        try {
          const res = await api.get(`/api/v1/patient_payments?client_id=${clientId}`);
          const data = res.data?.data;
          console.log("Fetched client payments for clientId", clientId, ":", data);
          if (!data) return;
          this.client = {
            ...this.client,
            balance: data.balance || 0,
            status: data.status || "",
            total_due: data.total_due || 0,
            paid: Number(data.paid || 0),
            payments: data.payments || [],
          };
          console.log("Updated client after payments fetch:", this.client);
        } catch (e) {
          console.error("Bemorning kassa ma’lumotlarini olishda xatolik:", e);
        }
      },
      async selectClient(item) {
        console.log("Client selected:", item);
        this.selectedDavolanishId = item.id;

        if (typeof item.client === "string") {
          this.client = {
            familiya: item.client,
            ism: "",
            sharif: "",
            tel1: item.phone || "",
            passport: item.passport || "",
            id: item.id,
            balance: item.balance || 0,
            status: item.status || "",
            total_due: item.total_due || 0,
            paid: Number(item.paid) || 0,
            payments: [],
            create_user_id: null,
          };
        } else {
          this.client = { ...item.client };
          this.client.id = item.id;
        }

        this.form.user_id = this.client.create_user_id || null;

        console.log("Client before fetching payments:", this.client);

        await this.fetchClientPayments(this.client.id);

        this.updateNote();
        console.log("Client after fetching payments:", this.client);
      },
      updateNote() {
        if (this.client) {
          this.form.note = `Bemor to'lovi: ${this.client.familiya} ${this.client.ism} ${this.client.sharif} - ${this.totalAmount.toLocaleString()} so‘m`;
        } else if (this.form.from === "tashqi" && this.form.fromDetail) {
          this.form.note = `Tashqi to'lov: ${this.form.fromDetail} - ${this.totalAmount.toLocaleString()} so‘m`;
        } else {
          this.form.note = "";
        }
        console.log("Updated form.note:", this.form.note);
      },
      async submitPayment() {
        if (!this.client) return alert("Bemor tanlanmagan!");
        try {
          this.form.is_patient_payment = 1;
          const sign = this.form.type === "chiqim" ? -1 : 1;
          const payload = {
            ...this.form,
            cash: (this.form.cash || 0) * sign,
            card: (this.form.card || 0) * sign,
            click: (this.form.click || 0) * sign,
            humo: (this.form.humo || 0) * sign,
            client_id: this.client.id,
            davolanish_id: this.selectedDavolanishId,
            datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
          };
          console.log("Submitting payment with payload:", payload);
          await api.post("/api/v1/payments", payload);
          alert("To‘lov muvaffaqiyatli qo‘shildi");
          this.router.back();
        } catch (e) {
          alert("Xatolik: to‘lov yuborilmadi");
          console.error(e);
        }
      },
    },
    watch: {
      totalAmount() {
        this.updateNote();
        console.log("Watch totalAmount triggered");
      },
      "form.type"() {
        this.updateNote();
        console.log("Watch form.type triggered");
      },
      "form.from"() {
        this.updateNote();
        console.log("Watch form.from triggered");
      },
      selectedDavolanishId() {
        this.updateNote();
        console.log("Watch selectedDavolanishId triggered");
      },
    },
    mounted() {
      this.fetchClients();
      console.log("Component mounted, fetching clients...");
    },
  };
  </script>



<style scoped>
.containerr {
  max-width: 1200px;
  margin: 30px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  color: #2c3e50;
}

/* FORM GROUP */
.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s;
}

.input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.25);
}

/* CLIENT LIST */
.client-list {
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  padding: 0;
  list-style: none;
}

.client-list li {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.client-list li:hover {
  background: #f5f9ff;
}

.no-results {
  margin-top: 8px;
  font-style: italic;
  color: #999;
}

/* BEMOR INFO CARD */
.info {
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 18px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 15px;
}

.info p {
  margin: 5px 0;
  color: #444;
}

.info strong {
  color: #2c3e50;
}

/* FORM ROW (2ta input yonma-yon) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 18px;
}

.form-row .label {
  margin-bottom: 6px;
}

.textarea {
  width: 100%;
  height: 80px;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: none;
  font-size: 14px;
}

.total {
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 1.15em;
  color: #222;
}

/* BUTTON */
.btn {
  display: inline-block;
  width: 100%;
  padding: 12px 20px;
  background: #007bff;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s;
}

.btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 91, 187, 0.3);
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
