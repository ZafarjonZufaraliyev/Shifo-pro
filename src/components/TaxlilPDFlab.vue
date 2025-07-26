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
                         :disabled="labTestData.results.length === 1">
                         &times;
                    </button>
               </div>
               <button @click="addResult" type="button" class="btn-add">+ Parametr qo‘shish</button>
          </div>

          <!-- Tugmalar -->
          <div class="actions">
               <button @click="saveLabTest" type="button" class="btn-save">Saqlash</button>
               <button @click="downloadPDF" type="button" :disabled="!savedTestId" class="btn-pdf"
                    title="Avval saqlang, keyin PDF yuklab olish mumkin">
                    PDF olish
               </button>
          </div>
     </div>
</template>

<script>
import axios from "axios";

export default {
     name: "TaxlilVaroghi",

     data() {
          return {
               clients: [],           // Bemorlar ro'yxati
               testTypes: [],         // Tahlil turlari ro'yxati
               selectedClientId: "",  // Tanlangan bemor IDsi
               selectedClient: null,  // Tanlangan bemor obyekti
               selectedTestType: null,// Tanlangan tahlil turi obyekti
               savedTestId: null,     // Saqlangan tahlil natijasi IDsi
               labTestData: {         // Tahlil ma'lumotlari formasi
                    client_id: null,
                    test_type_id: null,
                    test_date: "",       // YYYY-MM-DD formatdagi sana
                    doctor_comment: "",
                    results: [
                         {
                              parametr_name: "",
                              parametr_value: "",
                              parametr_norma: "",
                         },
                    ],
               },
          };
     },

     created() {
          // Bemorlar va tahlil turlarini yuklash
          this.fetchClients();
          this.fetchTestTypes();
     },

     methods: {
          // Bemorlar ro'yxatini API dan olish
          async fetchClients() {
               try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get("/api/v1/clients", {
                         headers: { Authorization: `Bearer ${token}` },
                    });
                    this.clients = res.data;
               } catch (error) {
                    console.error("❌ Bemorlar ro'yxatini olishda xatolik:", error);
               }
          },

          // Tahlil turlarini API dan olish
          async fetchTestTypes() {
               try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get("/api/v1/lab-test-types", {
                         headers: { Authorization: `Bearer ${token}` },
                    });
                    this.testTypes = res.data;
               } catch (error) {
                    console.error("❌ Tahlil turlarini olishda xatolik:", error);
               }
          },

          // Bemor tanlanganda tegishli obyekti aniqlash va saqlash
          onClientSelect() {
               const clientIdNum = Number(this.selectedClientId);
               this.selectedClient = this.clients.find((c) => c.id === clientIdNum) || null;
               this.labTestData.client_id = clientIdNum;
          },

          // Tahlil turi tanlanganda obyekti aniqlash va saqlash
          onTestTypeSelect() {
               const testTypeIdNum = Number(this.labTestData.test_type_id);
               this.selectedTestType = this.testTypes.find((t) => t.id === testTypeIdNum) || null;
               this.labTestData.test_type_id = testTypeIdNum;
          },

          // Yangi parametr qo'shish
          addResult() {
               this.labTestData.results.push({
                    parametr_name: "",
                    parametr_value: "",
                    parametr_norma: "",
               });
          },

          // Parametrni o'chirish (agar bitta qoldirmasa)
          removeResult(index) {
               if (this.labTestData.results.length > 1) {
                    this.labTestData.results.splice(index, 1);
               }
          },

          // Sanani o'zbek tilida formatlash
          formatDate(dateStr) {
               if (!dateStr) return "-";
               const d = new Date(dateStr);
               return d.toLocaleDateString("uz-UZ");
          },

          // Tahlil natijasini saqlash
          async saveLabTest() {
               // Formani tekshirish
               if (!this.labTestData.client_id) {
                    alert("Iltimos, bemorni tanlang!");
                    return;
               }
               if (!this.labTestData.test_type_id) {
                    alert("Iltimos, tahlil turini tanlang!");
                    return;
               }
               if (!this.labTestData.test_date) {
                    alert("Iltimos, test sanasini kiriting!");
                    return;
               }
               if (this.labTestData.results.length === 0) {
                    alert("Kamida bitta parametr kiritilishi kerak.");
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

                    // Backend API ga yuboriladigan payload (results array of objects)
                    const payload = {
                         client_id: this.labTestData.client_id,
                         test_type_id: this.labTestData.test_type_id,
                         test_date: this.labTestData.test_date,
                         doctor_comment: this.labTestData.doctor_comment,
                         results: this.labTestData.results.map(r => JSON.stringify({
                              parametr_name: r.parametr_name.trim(),
                              parametr_value: r.parametr_value.trim(),
                              parametr_norma: r.parametr_norma.trim()
                         })),
                    };

                    console.log("Yuborilayotgan payload:", payload);

                    // POST so'rov yuborish
                    const response = await axios.post("/api/v1/lab-test-results", payload, {
                         headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                         },
                    });

                    // Saqlangan test natijasi ID sini olish
                    this.savedTestId = response.data.id || response.data.lab_test_result?.id;
                    alert("✅ Ma'lumotlar muvaffaqiyatli saqlandi!");
               } catch (error) {
                    console.error("❌ Saqlashda xatolik:", error);
                    if (error.response?.data) {
                         console.error("Server javobi:", error.response.data);
                    }
                    alert("❌ Ma'lumotlarni saqlashda xatolik yuz berdi");
               }
          },

          // PDFni yuklab olish
          async downloadPDF() {
               if (!this.savedTestId) {
                    alert("Iltimos, avval ma'lumotlarni saqlang!");
                    return;
               }

               try {
                    const token = localStorage.getItem("token");

                    const pdfResponse = await axios.get(
                         `/api/v1/lab-test-results/${this.savedTestId}/pdf`,
                         {
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: "blob",
                         }
                    );

                    // Faylni yaratish va yuklab olishni boshlash
                    const fileURL = window.URL.createObjectURL(
                         new Blob([pdfResponse.data], { type: "application/pdf" })
                    );

                    const link = document.createElement("a");
                    link.href = fileURL;
                    link.setAttribute(
                         "download",
                         `Bemor_${this.selectedClient?.familiya || "NOMA'LUM"}_tahlil_natijalari.pdf`
                    );
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    window.URL.revokeObjectURL(fileURL);
               } catch (error) {
                    console.error("❌ PDF olishda xatolik:", error);
                    if (error.response?.data) {
                         console.error("Server xatolik tafsiloti:", error.response.data);
                    }
                    alert("❌ PDF olishda xatolik yuz berdi");
               }
          },
     },
};
</script>





<style scoped>
.container {
     max-width: 600px;
     margin: 20px auto;
     padding: 0 15px;
     font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
     color: #222;
}

h2 {
     text-align: center;
     margin-bottom: 25px;
}

.form-group {
     margin-bottom: 20px;
}

label {
     font-weight: 600;
     display: block;
     margin-bottom: 6px;
     font-size: 15px;
     color: #333;
}

select,
input[type="text"],
input[type="date"],
textarea {
     width: 100%;
     padding: 10px 14px;
     font-size: 15px;
     border: 1.5px solid #ccc;
     border-radius: 6px;
     transition: border-color 0.3s ease, box-shadow 0.3s ease;
     box-sizing: border-box;
     font-family: inherit;
     color: #333;
}

select:focus,
input[type="text"]:focus,
input[type="date"]:focus,
textarea:focus {
     border-color: #0069d9;
     box-shadow: 0 0 5px rgba(0, 105, 217, 0.5);
     outline: none;
}

.results-section {
     margin-top: 25px;
     margin-bottom: 15px;
}

.result-row {
     display: flex;
     gap: 10px;
     margin-bottom: 10px;
     align-items: center;
}

.result-input {
     flex: 1;
}

.btn-remove {
     background-color: #dc3545;
     padding: 6px 12px;
     font-weight: 700;
     border: none;
     color: white;
     border-radius: 6px;
     cursor: pointer;
     transition: background-color 0.3s ease;
}

.btn-remove:hover:not(:disabled) {
     background-color: #a71d2a;
}

.btn-remove:disabled {
     background-color: #aaa;
     cursor: not-allowed;
}

.btn-add {
     padding: 8px 16px;
     font-size: 15px;
     border-radius: 6px;
     background-color: #007bff;
     color: white;
     border: none;
     cursor: pointer;
     transition: background-color 0.3s ease;
     user-select: none;
}

.btn-add:hover {
     background-color: #0056b3;
}

.actions {
     display: flex;
     gap: 10px;
     justify-content: flex-end;
     margin-top: 30px;
}

.btn-save,
.btn-pdf {
     cursor: pointer;
     padding: 10px 18px;
     font-size: 15px;
     border-radius: 6px;
     border: none;
     color: white;
     user-select: none;
     transition: background-color 0.3s ease, transform 0.15s ease;
}

.btn-save {
     background-color: #28a745;
}

.btn-save:hover {
     background-color: #1e7e34;
}

.btn-pdf {
     background-color: #17a2b8;
}

.btn-pdf:disabled {
     background-color: #6c757d;
     cursor: not-allowed;
}

.btn-pdf:hover:enabled {
     background-color: #117a8b;
}

.client-info,
.test-type-info {
     margin-bottom: 20px;
     padding: 12px 16px;
     background-color: #f8f9fa;
     border-radius: 6px;
     color: #444;
     font-size: 14px;
}

@media (max-width: 480px) {
     .result-row {
          flex-direction: column;
          align-items: stretch;
     }

     .btn-remove {
          width: 100%;
     }

     .actions {
          flex-direction: column;
          gap: 15px;
     }
}
</style>
