<template>
  <div class="container">
    <h2>Tahlil varog‘i to‘ldirish va PDF olish</h2>

    <!-- Bemorni tanlash -->
    <div class="form-group">
      <label for="clientSelect">Bemor:</label>
      <select id="clientSelect" v-model="selectedClientId" @change="onClientSelect">
        <option value="" disabled>-- Bemorni tanlang --</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.familiya }} {{ client.ism }} {{ client.sharif || '' }}
        </option>
      </select>
    </div>

    <!-- Tanlangan bemor ma'lumotlari -->
    <div v-if="selectedClient" class="client-info">
      <p><strong>Familiya:</strong> {{ selectedClient.familiya }}</p>
      <p><strong>Ism:</strong> {{ selectedClient.ism }}</p>
      <p><strong>Sharif:</strong> {{ selectedClient.sharif || '-' }}</p>
      <p><strong>Tug‘ilgan sana:</strong> {{ formatDate(selectedClient.tugilgan_sana) }}</p>
    </div>

    <!-- Tahlil turini tanlash -->
    <div class="form-group">
      <label for="testTypeSelect">Tahlil turi:</label>
      <select id="testTypeSelect" v-model="labTestData.test_type_id" @change="onTestTypeSelect">
        <option value="" disabled>-- Tahlil turini tanlang --</option>
        <option v-for="testType in testTypes" :key="testType.id" :value="testType.id">
          {{ testType.name }}
        </option>
      </select>
    </div>

    <!-- Tanlangan tahlil turi nomi va ta'rif -->
    <div v-if="selectedTestType" class="test-type-info">
      <p><strong>Tahlil nomi:</strong> {{ selectedTestType.name }}</p>
      <p><strong>Ta'rif:</strong> {{ selectedTestType.description || '-' }}</p>
    </div>

    <!-- Test sanasi -->
    <div class="form-group">
      <label for="testDate">Test sanasi:</label>
      <input id="testDate" v-model="labTestData.test_date" type="date" />
    </div>

    <!-- Shifokor kommentariyasi -->
    <div class="form-group">
      <label for="doctorComment">Shifokor kommentariyasi:</label>
      <textarea id="doctorComment" v-model="labTestData.doctor_comment" placeholder="Kommentariyani kiriting"
        rows="3"></textarea>
    </div>

    <!-- Natijalar -->
    <div class="results-section">
      <h3>Tahlil natijalari</h3>
      <div v-for="(result, index) in labTestData.results" :key="index" class="result-row">
        <input v-model="result.parametr_name" placeholder="Parametr nomi" class="result-input" />
        <input v-model="result.parametr_value" placeholder="Natija" class="result-input" />
        <input v-model="result.parametr_norma" placeholder="Norma" class="result-input" />
        <button @click="removeResult(index)" type="button" class="btn-remove" title="O‘chirish"
          :disabled="labTestData.results.length === 1">&times;</button>
      </div>
      <button @click="addResult" type="button" class="btn-add">+ Parametr qo‘shish</button>
    </div>

    <!-- Tugmalar -->
    <div class="actions">
      <button @click="saveLabTest" type="button" class="btn-save">Saqlash</button>
      <button @click="generatePDF" type="button" :disabled="!selectedClient || !selectedTestType || !labTestData.test_date"
        class="btn-pdf" title="PDF yaratish va yuklab olish">
        PDF olish
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from "jspdf";
import logo from "@/assets/image/logo.png";  // Rasmni import qilish
import api from "@/api";
export default {
  name: "TaxlilVaroghi",
  data() {
    return {
      clients: [],
      testTypes: [],
      selectedClientId: "",
      selectedClient: null,
      selectedTestType: null,
      labTestData: {
        client_id: null,
        test_type_id: null,
        test_date: "",
        doctor_comment: "",
        results: [{
          parametr_name: "",
          parametr_value: "",
          parametr_norma: "",
        }, ],
      },
    };
  },
  created() {
    this.fetchClients();
    this.fetchTestTypes();
  },
  methods: {
    // Bemorlar ro'yxatini olish
    async fetchClients() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.clients = res.data;
      } catch (error) {
        console.error("❌ Bemorlar ro'yxatini olishda xatolik:", error);
      }
    },
    // Tahlil turlarini olish
    async fetchTestTypes() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/lab-test-types", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.testTypes = res.data;
      } catch (error) {
        console.error("❌ Tahlil turlarini olishda xatolik:", error);
      }
    },
    // Bemorni tanlash
    onClientSelect() {
      const clientIdNum = Number(this.selectedClientId);
      this.selectedClient = this.clients.find((c) => c.id === clientIdNum) || null;
      this.labTestData.client_id = clientIdNum;
    },
    // Tahlil turini tanlash
    onTestTypeSelect() {
      const testTypeIdNum = Number(this.labTestData.test_type_id);
      this.selectedTestType = this.testTypes.find((t) => t.id === testTypeIdNum) || null;
      this.labTestData.test_type_id = testTypeIdNum;
    },
    // Parametr qo'shish
    addResult() {
      this.labTestData.results.push({
        parametr_name: "",
        parametr_value: "",
        parametr_norma: "",
      });
    },
    // Parametr o'chirish
    removeResult(index) {
      if (this.labTestData.results.length > 1) {
        this.labTestData.results.splice(index, 1);
      }
    },
    // Sanani formatlash
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ");
    },
    // Tahlilni saqlash
    async saveLabTest() {
      if (!this.labTestData.client_id || !this.labTestData.test_type_id || !this.labTestData.test_date || this.labTestData.results.length === 0) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }
      for (const [i, r] of this.labTestData.results.entries()) {
        if (!r.parametr_name.trim() || !r.parametr_value.trim()) {
          alert(`${i + 1}-parametr to‘liq kiritilmagan.`);
          return;
        }
      }

      try {
        const token = localStorage.getItem("token");
        const payload = {
          client_id: this.labTestData.client_id,
          test_type_id: this.labTestData.test_type_id,
          test_date: this.labTestData.test_date,
          doctor_comment: this.labTestData.doctor_comment,
          results: this.labTestData.results.map((r) => ({
            parametr_name: r.parametr_name.trim(),
            parametr_value: r.parametr_value.trim(),
            parametr_norma: r.parametr_norma.trim(),
          })),
        };
        await axios.post("/api/v1/lab-test-results", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        alert("✅ Ma'lumotlar muvaffaqiyatli saqlandi!");
      } catch (error) {
        console.error("❌ Saqlashda xatolik:", error);
        alert("❌ Ma'lumotlarni saqlashda xatolik yuz berdi");
      }
    },
    // PDF yaratish
    async generatePDF() {
      if (!this.selectedClient || !this.selectedTestType || !this.labTestData.test_date) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }

      const testDateTime = new Date(this.labTestData.test_date).toLocaleString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const htmlContent = `
        <div style="max-width: 800px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif; background-color: #fdfdfd;">
          <div style="display: flex; justify-content: space-between; gap:300px align-items: flex-start; margin-bottom: 15px;">
            <div style="font-size: 24px; font-weight: bold; color: #004c97; display: flex; align-items: center;">
              <img src="${logo}" alt="Logo" style="height:40px; margin-right:8px;" />
              Koinot Kavsari
            </div>
            <div style="font-size: 14px; text-align: right; line-height: 1.4;">
              <strong>Manzil:</strong><br />
              Farg‘ona tuman, Chimyon,<br />
              Yangi zamon ko‘chasi 1-uy<br />
              <strong>Telefon:</strong>
              <span style="color:green;">+998 73 240 00 03</span>, 
              <span style="color:green;">+998 99 240 00 03</span>
            </div>
          </div>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <th style="padding: 10px; background-color: #f0f0f0;">Bemor</th>
              <td>${this.selectedClient.familiya} ${this.selectedClient.ism}</td>
            </tr>
            <tr>
              <th style="padding: 10px; background-color: #f0f0f0;">Tahlil olingan sana</th>
              <td>${testDateTime}</td>
            </tr>
            <tr>
              <th style="padding: 10px; background-color: #f0f0f0;">Shifokor</th>
              <td>Qodirov Anzabek</td>
            </tr>
          </table>
          <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
            <caption>${this.selectedTestType.name.toUpperCase()}</caption>
            <tr>
              <th style="padding: 10px;">Tahlil turi</th>
              <th style="padding: 10px;">Natija</th>
              <th style="padding: 10px;">Norma</th>
            </tr>
            ${this.labTestData.results
              .map(
                (r) => `
                  <tr>
                    <td style="padding: 10px;">${r.parametr_name}</td>
                    <td style="padding: 10px;">${r.parametr_value}</td>
                    <td style="padding: 10px;">${r.parametr_norma || "-"}</td>
                  </tr>`
              )
              .join("")}
          </table>
        </div>
      `;

      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      // HTMLni jsPDFga qo'shish
      doc.html(htmlContent, {
        callback: function (doc) {
          doc.save(`Bemor_${this.selectedClient.familiya}_tahlil_natijalari.pdf`);
        }.bind(this),
        x: 10,
        y: 10,
        html2canvas: {
          scale: 0.2,
        },
      });
    },
  },
};
</script>

<style scoped>
/* Simplified and optimised styles */
.container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
}

select, input[type="text"], input[type="date"], textarea {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

textarea {
  resize: vertical;
}

.btn-add, .btn-remove, .btn-save, .btn-pdf {
  padding: 10px 15px;
  font-size: 15px;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
}

.results-section {
  margin-top: 20px;
}

.result-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

@media (max-width: 480px) {
  .result-row {
    flex-direction: column;
  }
}
</style>
