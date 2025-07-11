<template>
     <div class="calculate-page">
          <h2>📊 Ovqat va porsiya bo‘yicha mahsulot hisoblash</h2>

          <!-- Sana filtri -->
          <div class="form-row single">
               <label>📅 Sana:</label>
               <input type="date" v-model="filterDate" />
               <button @click="resetFilter">♻️ Tozalash</button>
          </div>

          <!-- 3 ta maydon bitta qatorda -->
          <div class="form-row triple">
               <!-- Taom -->
               <div class="field">
                    <label>🍛 Taom:</label>
                    <select v-model="selectedTaom">
                         <option disabled value="">-- Tanlang --</option>
                         <option v-for="taom in uniqueOvqatlar" :key="taom">{{ taom }}</option>
                    </select>
               </div>

               <!-- Ovqat vaqti -->
               <div class="field">
                    <label>🕰 Vaqt:</label>
                    <select v-model="selectedVaqt">
                         <option disabled value="">-- Tanlang --</option>
                         <option value="abet">Nonushta</option>
                         <option value="tushlik">Tushlik</option>
                         <option value="kechki">Kechki ovqat</option>
                    </select>
               </div>

               <!-- Porsiya -->
               <div class="field">
                    <label>👥 Porsiya:</label>
                    <input type="number" v-model.number="porsiyaSoni" min="1" />
               </div>
          </div>

          <button class="btn-main" :disabled="!canCalculate" @click="calculate">Hisoblash</button>

          <!-- Natijalar jadvali -->
          <div v-if="filteredResultsByDate.length" class="results">
               <h3>📅 {{ filterDate }} natijalari</h3>

               <div v-for="vaqt in vaqtlarWithResults" :key="vaqt" class="section">
                    <h4>
                         {{
                              vaqt === 'abet' ? '🍞 Nonushta' :
                                   vaqt === 'tushlik' ? '🍲 Tushlik' :
                         '🌙 Kechki ovqat'
                         }}
                    </h4>

                    <div v-for="group in filteredResultsByDate.filter(r => r.vaqt === vaqt)"
                         :key="group.time + group.taom" class="card">
                         <header>
                              ⏰ {{ group.time }} – 🍽 <strong>{{ group.taom }}</strong>
                              ({{ group.porsiya }} porsiya)
                              <button class="remove" @click="removeEntry(group)">✖</button>
                         </header>

                         <table>
                              <thead>
                                   <tr>
                                        <th>Mahsulot</th>
                                        <th>Miqdor</th>
                                        <th>Birlik</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   <tr v-for="item in group.items" :key="item.maxsulot">
                                        <td>{{ item.maxsulot }}</td>
                                        <td>{{ item.jamiMiqdori.toFixed(2) }}</td>
                                        <td>{{ item.birlik }}</td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>

          <p v-else class="no-data">
               🔍 Tanlangan sanaga mos maʼlumot yo‘q.
          </p>
     </div>
</template>

<script>
export default {
     name: 'CalculatePage',

     data() {
          const pad = n => String(n).padStart(2, '0');
          const today = () => {
               const d = new Date();
               return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          };

          return {
               /* Form holati */
               selectedTaom: '',
               selectedVaqt: '',
               porsiyaSoni: 1,

               /* Filtr va konstantalar */
               filterDate: today(),
               vaqtlar: ['abet', 'tushlik', 'kechki'],

               /* Natijalar */
               results: [],

               /* Retseptlar */
               recipes: [
                    { ovqat: 'Osh', maxsulot: 'Guruch', miqdori: 0.25, birlik: 'kg' },
                    { ovqat: 'Osh', maxsulot: 'Go‘sht', miqdori: 0.15, birlik: 'kg' },
                    { ovqat: 'Osh', maxsulot: 'Sabzi', miqdori: 0.1, birlik: 'kg' },
                    { ovqat: 'Osh', maxsulot: 'Piyoz', miqdori: 0.05, birlik: 'kg' },
                    { ovqat: 'Shorva', maxsulot: 'Go‘sht', miqdori: 0.1, birlik: 'kg' },
                    { ovqat: 'Shorva', maxsulot: 'Kartoshka', miqdori: 0.2, birlik: 'kg' },
                    { ovqat: 'Shorva', maxsulot: 'Piyoz', miqdori: 0.05, birlik: 'kg' },
                    { ovqat: 'Shorva', maxsulot: 'Sabzi', miqdori: 0.05, birlik: 'kg' },
                    { ovqat: 'Mastava', maxsulot: 'Guruch', miqdori: 0.15, birlik: 'kg' },
                    { ovqat: 'Mastava', maxsulot: 'Go‘sht', miqdori: 0.1, birlik: 'kg' },
                    { ovqat: 'Mastava', maxsulot: 'Sabzi', miqdori: 0.05, birlik: 'kg' },
                    { ovqat: 'Mastava', maxsulot: 'Piyoz', miqdori: 0.05, birlik: 'kg' },
                    { ovqat: 'Tuxumli lag‘mon', maxsulot: 'Un', miqdori: 0.2, birlik: 'kg' },
                    { ovqat: 'Tuxumli lag‘mon', maxsulot: 'Tuxum', miqdori: 1, birlik: 'dona' },
                    { ovqat: 'Tuxumli lag‘mon', maxsulot: 'Yog‘', miqdori: 0.03, birlik: 'litr' },
               ],
          };
     },

     computed: {
          uniqueOvqatlar() {
               return [...new Set(this.recipes.map(r => r.ovqat))];
          },
          canCalculate() {
               return this.selectedTaom && this.selectedVaqt && this.porsiyaSoni > 0;
          },
          filteredResultsByDate() {
               return this.results.filter(r => r.date === this.filterDate);
          },
          /* Faqat natijasi bor vaqtlar */
          vaqtlarWithResults() {
               return this.vaqtlar.filter(v => this.filteredResultsByDate.some(r => r.vaqt === v));
          },
     },

     created() {
          const saved = localStorage.getItem('calculateResults');
          if (saved) {
               try { this.results = JSON.parse(saved); } catch { /* ignore */ }
          }
     },

     watch: {
          results: {
               deep: true,
               handler(val) {
                    localStorage.setItem('calculateResults', JSON.stringify(val));
               },
          },
     },

     methods: {
          resetFilter() {
               this.filterDate = this.$data.filterDate = this.filterDate || (new Date()).toISOString().slice(0, 10);
          },
          /* Formani va tanlovlarni tozalash (filtrga tegmaydi) */
          resetForm() {
               this.selectedTaom = '';
               this.selectedVaqt = '';
               this.porsiyaSoni = 1;
          },
          calculate() {
               const date = this.filterDate;
               const defaultTimes = { abet: '08:00', tushlik: '13:00', kechki: '19:00' };
               const now = new Date();
               const realTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
               const time = defaultTimes[this.selectedVaqt] || realTime;

               const items = this.recipes
                    .filter(r => r.ovqat === this.selectedTaom)
                    .map(r => ({
                         maxsulot: r.maxsulot,
                         jamiMiqdori: r.miqdori * this.porsiyaSoni,
                         birlik: r.birlik,
                    }));

               this.results.push({ taom: this.selectedTaom, porsiya: this.porsiyaSoni, vaqt: this.selectedVaqt, date, time, items });
               this.sortResults();
               this.resetForm();
          },
          sortResults() {
               const order = { abet: 0, tushlik: 1, kechki: 2 };
               this.results.sort((a, b) => {
                    if (a.date !== b.date) return a.date.localeCompare(b.date);
                    if (a.vaqt !== b.vaqt) return order[a.vaqt] - order[b.vaqt];
                    return (a.time || '').localeCompare(b.time || '');
               });
          },
          removeEntry(group) {
               const idx = this.results.findIndex(r =>
                    r.taom === group.taom && r.date === group.date &&
                    r.vaqt === group.vaqt && r.time === group.time
               );
               if (idx !== -1) this.results.splice(idx, 1);
          },
     },
};
</script>

<style scoped>
/* ───────── Layout ───────── */
.calculate-page {
     max-width: 1200px;
     margin: 20px 20px 20px 290px;
     padding: 20px;
     background: linear-gradient(135deg, #f7f9fc, #eef1f5);
     border-radius: 20px;
     box-shadow: 0 10px 25px rgba(0, 0, 0, .06);
     font-family: 'Segoe UI', sans-serif;
     color: #333;
}

h2 {
     text-align: center;
     margin-bottom: 25px;
     color: #2c3e50;
}

h3 {
     margin: 30px 0 15px;
     font-size: 22px;
     color: #2c3e50;
}

h4 {
     margin: 15px 0 10px;
     font-size: 19px;
     color: #1f4788;
}

.no-data {
     margin-top: 25px;
     color: #888;
     text-align: center;
     font-style: italic;
}

/* ───────── Form rows ───────── */
.form-row {
     margin-bottom: 15px;
     display: flex;
     flex-wrap: wrap;
     gap: 12px;
}

.form-row.single {
     align-items: center;
}

.form-row.triple .field {
     flex: 1 1 200px;
     display: flex;
     flex-direction: column;
}

label {
     font-weight: 600;
     margin-bottom: 4px;
}

input,
select {
     padding: 8px 10px;
     border: 1px solid #ccc;
     border-radius: 10px;
     font-size: 15px;
     background: #fff;
     transition: .3s;
}

input:focus,
select:focus {
     border-color: #3498db;
     box-shadow: 0 0 6px rgba(52, 152, 219, .4);
}

/* ───────── Buttons ───────── */
button {
     cursor: pointer;
     border: none;
     border-radius: 10px;
     font-weight: 600;
}

.btn-main {
     padding: 10px 22px;
     font-size: 16px;
     color: #fff;
     background: linear-gradient(45deg, #3498db, #2980b9);
     transition: .3s;
}

.btn-main:disabled {
     opacity: .4;
     cursor: not-allowed;
}

.btn-main:not(:disabled):hover {
     transform: scale(1.04);
     box-shadow: 0 6px 18px rgba(52, 152, 219, .25);
}

button.remove {
     background: #e74c3c;
     color: #fff;
     padding: 0 8px;
     border-radius: 6px;
     font-size: 14px;
}

/* ───────── Results ───────── */
.section {
     margin-bottom: 25px;
}

.card {
     padding: 15px;
     border-radius: 15px;
     background: #fff;
     box-shadow: 0 4px 12px rgba(0, 0, 0, .05);
     transition: .25s;
}

.card:hover {
     transform: scale(1.015);
     background: #f9fcff;
}

.card header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 8px;
     font-weight: 600;
}

table {
     width: 100%;
     border-collapse: collapse;
}

th,
td {
     padding: 8px 10px;
     border: 1px solid #e1e1e1;
     text-align: left;
}

th {
     background: #ecf0f1;
     color: #333;
}

td {
     background: #fbfbfb;
}

/* ───────── Responsive ───────── */
@media (max-width:600px) {
     .calculate-page {
          padding: 20px;
     }

     h2 {
          font-size: 22px;
     }

     .form-row.triple {
          flex-direction: column;
     }
}
</style>
