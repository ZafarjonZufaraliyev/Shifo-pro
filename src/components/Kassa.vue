<template>
  <div class="section kirim-section">
    <!-- Yuqori navigatsiya tugmalari -->
    <div>
      <div class="top-navigation">
        <button :class="{ active: currentView === 'stat' }" @click="showStat()">📊 Statistika</button>
        <button :class="{ active: currentView === 'kirim' }" @click="showKirim()">📥 Kirim</button>
        <button :class="{ active: currentView === 'chiqim' }" @click="showChiqim()">📤 Chiqim</button>
        <button :class="{ active: currentView === 'bemorlar' }" @click="showBemorlar()">👤 Bemorlar</button>
      </div>

      <!-- Statistika bo'limi -->
      <div v-if="currentView === 'stat'" class="stat-box">
        <h4>📥 Bugungi Kirim</h4>
        <table class="kirim-table">
          <thead>
            <tr>
              <th>Jami</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
              <th>Humo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ todayKirim.toLocaleString() }} so'm</td>
              <td>{{ todayNaqdKirim.toLocaleString() }} so'm</td>
              <td>{{ todayKartaKirim.toLocaleString() }} so'm</td>
              <td>{{ todayClickKirim.toLocaleString() }} so'm</td>
              <td>{{ todayHumoKirim.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
        </table>

        <h4>📤 Bugungi Chiqim</h4>
        <table class="kirim-table">
          <thead>
            <tr>
              <th>Jami</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
              <th>Humo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ todayChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayNaqdChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayKartaChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayClickChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayHumoChiqim.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
        </table>

        <h4>👤 Bemorlar</h4>
        <table class="kirim-table">
          <thead>
            <tr>
              <th>Jami Qarzdorlik</th>
              <th>Bugun Qo‘shildi</th>
              <th>Bugun Berildi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ totalQarz.toLocaleString() }} so'm</td>
              <td>{{ qarzQoshildi.toLocaleString() }} so'm</td>
              <td>{{ tolandiSumma.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Kirimlar -->
    <div v-if="currentView === 'kirim'">
      <div class="header">
        <h3>📥 Kirimlar</h3>

        <div class="date-range">
          <label>📅 Sana oralig‘i:</label>
          <input type="date" v-model="startDate" />
          <span>dan</span>
          <input type="date" v-model="endDate" />
        </div>

        <div class="filter-by-person">
          <label>👤 Kimdan (qayerdan):</label>
          <input type="text" v-model="filterKimdan" placeholder="Masalan: Homiylar jamg‘armasi" />
        </div>

        <button class="add-btn" @click="openAddModal('kirim')">➕ Kirim qo‘shish</button>
      </div>

      <table class="kirim-table">
        <thead>
          <tr>
            <th>Sana / Vaqt</th>
            <th>Qayerdan (Kimdan)</th>
            <th>Naqd</th>
            <th>Karta</th>
            <th>Click</th>
            <th>Humo</th>
            <th>Kassir (login)</th>
            <th>Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kirim in filteredKirimlar" :key="kirim.id">
            <td>{{ kirim.sana }} {{ kirim.soat }}</td>
            <td>{{ kirim.kimdan }}</td>
            <td>{{ (kirim.naqd || 0).toLocaleString() }}</td>
            <td>{{ (kirim.karta || 0).toLocaleString() }}</td>
            <td>{{ (kirim.click || 0).toLocaleString() }}</td>
            <td>{{ (kirim.humo || 0).toLocaleString() }}</td>
            <td>{{ kirim.kassir }}</td>
            <td>{{ kirim.izoh }}</td>
          </tr>
          <tr v-if="filteredKirimlar.length === 0">
            <td colspan="8">🔍 Ma'lumot topilmadi.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="filterKimdan || startDate || endDate" class="summary-block">
        <h4>📊 Xulosa:</h4>
        <p>Necha marta: <strong>{{ summary.count }}</strong></p>
        <p>Jami summa: <strong>{{ summary.total.toLocaleString() }}</strong> so‘m</p>
      </div>

      <!-- Kirim Qo‘shish Modal -->
      <div v-if="showModal && modalType === 'kirim'" class="modal-overlay" @click.self="closeModal">
        <div class="modal1 chiqim-modal wide-modal">
          <h3>➖ Yangi Kirim qo‘shish</h3>

         

          <label>👤 Kimdan kelmoqda:</label>
          <div class="select-group-vertical">
            <div class="select-group">
              <select v-model="form.kimdan">
                <option disabled value="">-- Tanlang --</option>
                <option v-for="(item, idx) in optionsKimdan" :key="idx" :value="item">{{ item }}</option>
              </select>
              <button @click="toggleKimdanList = !toggleKimdanList">📋</button>
            </div>

            <div v-if="toggleKimdanList" class="option-list">
              <ul>
                <li v-for="(item, idx) in optionsKimdan" :key="idx">
                  {{ item }}
                  <button class="remove-btn" @click="removeKimdan(idx)">➖</button>
                </li>
              </ul>
              <div class="select-group add-new">
                <input v-model="newKimdan" placeholder="Yangi kimdan..." />
                <button @click="addKimdan">➕</button>
              </div>
            </div>
          </div>

          <label>Naqd (so'm):</label>
          <input type="number" min="0" v-model.number="form.naqd" placeholder="Naqd summasi" />

          <label>Karta (so'm):</label>
          <input type="number" min="0" v-model.number="form.karta" placeholder="Karta summasi" />

          <label>Click (so'm):</label>
          <input type="number" min="0" v-model.number="form.click" placeholder="Click summasi" />

          <label>Humo (so'm):</label>
          <input type="number" min="0" v-model.number="form.humo" placeholder="Humo summasi" />

          

          <label>Izoh:</label>
          <textarea v-model="form.izoh" rows="2" placeholder="Qo‘shimcha izoh..."></textarea>

          <div class="modal-buttons">
            <button class="save-btn" @click="saveKirim">💾 Saqlash</button>
            <button class="cancel-btn" @click="closeModal">❌ Bekor qilish</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chiqimlar -->
    <div v-if="currentView === 'chiqim'">
      <div class="header">
        <h3>📤 Chiqimlar</h3>

        <div class="date-range">
          <label>🔍 Sana oralig‘i:</label>
          <input type="date" v-model="startDate" />
          <span>dan</span>
          <input type="date" v-model="endDate" />
        </div>

        <div class="filter-by-person">
          <label>👤 Kimga berilganini qidirish:</label>
          <input type="text" v-model="filterKimga" placeholder="Masalan: Rustam aka" />
        </div>

        <button class="add-btn" @click="openAddModal('chiqim')">➕ Chiqim qo‘shish</button>
      </div>

      <table class="kirim-table">
        <thead>
          <tr>
            <th>Sana</th>
            <th>Soat</th>
            <th>Qayerga</th>
            <th>Naqd</th>
            <th>Karta</th>
            <th>Click</th>
            <th>Humo</th>
            <th>Kimdan</th>
            <th>Kassir (login)</th>
            <th>Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chiqim in filteredChiqimlar" :key="chiqim.id">
            <td>{{ chiqim.sana }}</td>
            <td>{{ chiqim.vaqt }}</td>
            <td>{{ chiqim.qayerga }}</td>
            <td>{{ (chiqim.naqd || 0).toLocaleString() }}</td>
            <td>{{ (chiqim.karta || 0).toLocaleString() }}</td>
            <td>{{ (chiqim.click || 0).toLocaleString() }}</td>
            <td>{{ (chiqim.humo || 0).toLocaleString() }}</td>
            <td>{{ chiqim.kimdan }}</td>
            <td>{{ chiqim.kassir }}</td>
            <td>{{ chiqim.izoh }}</td>
          </tr>
          <tr v-if="filteredChiqimlar.length === 0">
            <td colspan="10">🔍 Belgilangan sanada chiqimlar topilmadi.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="filterKimga && summaryData.length" class="summary-block">
        <h4>📋 "{{ filterKimga }}" uchun chiqimlar xulosasi ({{ startDate || 'boshi' }} - {{ endDate || 'oxiri' }})</h4>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Kimga</th>
              <th>Necha marta</th>
              <th>Jami summa (so'm)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summaryData" :key="item.kimdan">
              <td>{{ item.kimdan }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.total.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Chiqim Qo‘shish Modal -->
      <div v-if="showModal && modalType === 'chiqim'" class="modal-overlay" @click.self="closeModal">
        <div class="modal1 chiqim-modal wide-modal">
          <h3>➖ Yangi Chiqim qo‘shish</h3>

          

          <label>👤 Kimga berilmoqda:</label>
          <div class="select-group-vertical">
            <div class="select-group">
              <select v-model="form.kimdan">
                <option disabled value="">-- Tanlang --</option>
                <option v-for="(item, idx) in optionsKimdan" :key="idx" :value="item">{{ item }}</option>
              </select>
              <button @click="toggleKimdanList = !toggleKimdanList">📋</button>
            </div>

            <div v-if="toggleKimdanList" class="option-list">
              <ul>
                <li v-for="(item, idx) in optionsKimdan" :key="idx">
                  {{ item }}
                  <button class="remove-btn" @click="removeKimdan(idx)">➖</button>
                </li>
              </ul>
              <div class="select-group add-new">
                <input v-model="newKimdan" placeholder="Yangi kimga..." />
                <button @click="addKimdan">➕</button>
              </div>
            </div>
          </div>

          <label>Naqd (so'm):</label>
          <input type="number" min="0" v-model.number="form.naqd" placeholder="Naqd summasi" />

          <label>Karta (so'm):</label>
          <input type="number" min="0" v-model.number="form.karta" placeholder="Karta summasi" />

          <label>Click (so'm):</label>
          <input type="number" min="0" v-model.number="form.click" placeholder="Click summasi" />

          <label>Humo (so'm):</label>
          <input type="number" min="0" v-model.number="form.humo" placeholder="Humo summasi" />

          <label>Kimdan:</label>
          <input type="text" v-model="form.kimdan" />

          

          <label>Izoh:</label>
          <textarea v-model="form.izoh" rows="2" placeholder="Qo‘shimcha izoh..."></textarea>

          <div class="modal-buttons">
            <button class="save-btn" @click="saveChiqim">💾 Saqlash</button>
            <button class="cancel-btn" @click="closeModal">❌ Bekor qilish</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bemorlar -->
    <div v-if="currentView === 'bemorlar'">
      <div class="header">
        <h3>👤 Bemorlar</h3>
      </div>

      <h4>Qarzdorlar ro'yxati:</h4>
      <table class="bemor-table">
        <thead>
          <tr>
            <th>Sana va Vaqt</th>
            <th>Ism Familiya</th>
            <th>Telefon</th>
            <th>Qayerdan</th>
            <th>Naqd</th>
            <th>Haqqi (Qarz)</th>
            <th>Karta</th>
            <th>Click</th>
            <th>Humo</th>
            <th>Kassir</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bemor in qarzdorlar"
            :key="bemor.id"
            class="qarzdor-row"
            @click="openPaymentModal(bemor)"
            style="cursor:pointer"
          >
            <td>{{ bemor.sana }} {{ bemor.vaqt }}</td>
            <td>{{ bemor.ismFam }}</td>
            <td>{{ bemor.tel }}</td>
            <td>{{ bemor.qayerdan }}</td>
            <td
              :style="{ color: bemor.qarz > 0 ? 'red' : 'inherit', fontWeight: bemor.qarz > 0 ? 'bold' : 'normal' }"
              @click.stop="openTolovModal(bemor)"
            >
              {{ bemor.naqd.toLocaleString() }}
              <span v-if="bemor.qarz > 0"> (Qarz: {{ bemor.qarz.toLocaleString() }})</span>
            </td>
            <td>{{ bemor.karta.toLocaleString() }}</td>
            <td>{{ bemor.click.toLocaleString() }}</td>
            <td>{{ (bemor.humo || 0).toLocaleString() }}</td>
            <td>{{ bemor.kassir }}</td>
          </tr>
        </tbody>
      </table>

      <h4>Bemorlar ro'yxati (qarzsizlar):</h4>
      <table class="bemor-table">
        <thead>
          <tr>
            <th>Sana va Vaqt</th>
            <th>Ism Familiya</th>
            <th>Telefon</th>
            <th>Qayerdan</th>
            <th>Naqd</th>
            <th>Karta</th>
            <th>Click</th>
            <th>Humo</th>
            <th>Kassir</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bemor in qarzsizlar" :key="bemor.id">
            <td>{{ bemor.sana }} {{ bemor.vaqt }}</td>
            <td>{{ bemor.ismFam }}</td>
            <td>{{ bemor.tel }}</td>
            <td>{{ bemor.qayerdan }}</td>
            <td>{{ bemor.naqd.toLocaleString() }}</td>
            <td>{{ bemor.karta.toLocaleString() }}</td>
            <td>{{ bemor.click.toLocaleString() }}</td>
            <td>{{ (bemor.humo || 0).toLocaleString() }}</td>
            <td>{{ bemor.kassir }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- To‘lov qilish modali -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal1">
        <h3>💰 To‘lov qilish - {{ selectedBemor.ismFam }}</h3>

        

        

       

        <div class="form-group">
          <label>To‘lovchi:</label>
          <input type="text" :value="selectedBemor.ismFam" readonly />
        </div>

        <div class="form-group">
          <label>Tur:</label>
          <select v-model="paymentForm.tur">
            <option value="kirim">Kirim</option>
            <option value="chiqim">Chiqim</option>
          </select>
        </div>

        <div class="form-group">
          <label>Naqd (so'm):</label>
          <input type="number" v-model.number="paymentForm.naqd" min="0" />
        </div>
        <div class="form-group">
          <label>Karta (so'm):</label>
          <input type="number" v-model.number="paymentForm.karta" min="0" />
        </div>
        <div class="form-group">
          <label>Click (so'm):</label>
          <input type="number" v-model.number="paymentForm.click" min="0" />
        </div>
        <div class="form-group">
          <label>Humo (so'm):</label>
          <input type="number" v-model.number="paymentForm.humo" min="0" />
        </div>

        <div class="modal-buttons" style="justify-content: flex-end;">
          <button class="save-btn" @click="savePayment">💾 Saqlash</button>
          <button class="add-btn" @click="closePaymentModal">Bekor qilish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentView: "stat", // 'stat', 'kirim', 'chiqim', 'bemorlar'

      // Sana filterlari
      startDate: "",
      endDate: "",

      // Kirimlar va chiqimlar ro'yxati (namuna ma'lumotlar)
      kirimlar: [
        {
          id: 1,
          sana: "2025-07-07",
          soat: "10:30:00",
          kimdan: "Homiylar jamg‘armasi",
          naqd: 100000,
          karta: 20000,
          click: 5000,
          humo: 10000,
          kassir: "admin",
          izoh: "Xayriya",
        },
        {
          id: 2,
          sana: "2025-07-06",
          soat: "14:15:00",
          kimdan: "Davlat grant",
          naqd: 150000,
          karta: 0,
          click: 0,
          humo: 0,
          kassir: "user1",
          izoh: "",
        },
      ],
      chiqimlar: [
        {
          id: 1,
          sana: "2025-07-07",
          vaqt: "11:00:00",
          qayerga: "Rustam aka",
          naqd: 50000,
          karta: 10000,
          click: 0,
          humo: 0,
          kimdan: "admin",
          kassir: "admin",
          izoh: "Xarajat",
        },
        {
          id: 2,
          sana: "2025-07-06",
          vaqt: "15:00:00",
          qayerga: "Tadbirkorlar fondi",
          naqd: 70000,
          karta: 0,
          click: 0,
          humo: 0,
          kimdan: "user1",
          kassir: "user1",
          izoh: "",
        },
      ],

      // Bemorlar ma'lumotlari
      bemorlar: [
        {
          id: 1,
          sana: "2025-07-07",
          vaqt: "09:00:00",
          ismFam: "Aliyev Ali",
          tel: "+998901234567",
          qayerdan: "Toshkent",
          naqd: 100000,
          qarz: 20000,
          karta: 15000,
          click: 0,
          humo: 0,
          kassir: "admin",
        },
        {
          id: 2,
          sana: "2025-07-06",
          vaqt: "10:00:00",
          ismFam: "Karimova Nodira",
          tel: "+998912345678",
          qayerdan: "Samarqand",
          naqd: 120000,
          qarz: 0,
          karta: 0,
          click: 0,
          humo: 0,
          kassir: "user1",
        },
      ],

      filterKimdan: "",
      filterKimga: "",

      optionsKimdan: [
        "Homiylar jamg‘armasi",
        "Davlat grant",
        "Tadbirkorlar fondi",
        "Rustam aka",
        "admin",
      ],

      toggleKimdanList: false,
      newKimdan: "",

      showModal: false,
      modalType: "", // 'kirim' yoki 'chiqim'
      form: {
        kimdan: "",
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
        izoh: "",
      },

      selectedBemor: null,
      showPaymentModal: false,
      paymentForm: {
        tur: "kirim",
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
      },

      currentKassir: "admin", // amaldagi kassir login
    };
  },
  computed: {
    // Hozirgi sana string formatda (YYYY-MM-DD)
    todayDate() {
      return new Date().toISOString().slice(0, 10);
    },
    // Hozirgi vaqt (hh:mm:ss)
    todayTime() {
      return new Date().toTimeString().slice(0, 8);
    },

    filteredKirimlar() {
      return this.kirimlar.filter((item) => {
        const sanaMatch =
          (!this.startDate || item.sana >= this.startDate) &&
          (!this.endDate || item.sana <= this.endDate);
        const kimdanMatch =
          !this.filterKimdan ||
          item.kimdan.toLowerCase().includes(this.filterKimdan.toLowerCase());
        return sanaMatch && kimdanMatch;
      });
    },

    summary() {
      let count = 0,
        total = 0;
      this.filteredKirimlar.forEach((item) => {
        count++;
        total +=
          (item.naqd || 0) + (item.karta || 0) + (item.click || 0) + (item.humo || 0);
      });
      return { count, total };
    },

    filteredChiqimlar() {
      return this.chiqimlar.filter((item) => {
        const sanaMatch =
          (!this.startDate || item.sana >= this.startDate) &&
          (!this.endDate || item.sana <= this.endDate);
        const kimgaMatch =
          !this.filterKimga ||
          item.qayerga.toLowerCase().includes(this.filterKimga.toLowerCase());
        return sanaMatch && kimgaMatch;
      });
    },

    summaryData() {
      if (!this.filterKimga) return [];

      // Chiqimlar bo‘yicha 'kimdan' bo‘yicha guruhlash
      const grouped = {};
      this.filteredChiqimlar.forEach((item) => {
        const key = item.kimdan || "Noma'lum";
        if (!grouped[key]) grouped[key] = { kimdan: key, count: 0, total: 0 };
        grouped[key].count++;
        grouped[key].total +=
          (item.naqd || 0) + (item.karta || 0) + (item.click || 0) + (item.humo || 0);
      });
      return Object.values(grouped);
    },

    qarzdorlar() {
      return this.bemorlar.filter((b) => b.qarz > 0);
    },

    qarzsizlar() {
      return this.bemorlar.filter((b) => b.qarz === 0);
    },

    todayKirim() {
      return this.kirimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce(
          (sum, k) =>
            sum +
            (k.naqd || 0) +
            (k.karta || 0) +
            (k.click || 0) +
            (k.humo || 0),
          0
        );
    },
    todayNaqdKirim() {
      return this.kirimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.naqd || 0), 0);
    },
    todayKartaKirim() {
      return this.kirimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.karta || 0), 0);
    },
    todayClickKirim() {
      return this.kirimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.click || 0), 0);
    },
    todayHumoKirim() {
      return this.kirimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.humo || 0), 0);
    },

    todayChiqim() {
      return this.chiqimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce(
          (sum, k) =>
            sum +
            (k.naqd || 0) +
            (k.karta || 0) +
            (k.click || 0) +
            (k.humo || 0),
          0
        );
    },
    todayNaqdChiqim() {
      return this.chiqimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.naqd || 0), 0);
    },
    todayKartaChiqim() {
      return this.chiqimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.karta || 0), 0);
    },
    todayClickChiqim() {
      return this.chiqimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.click || 0), 0);
    },
    todayHumoChiqim() {
      return this.chiqimlar
        .filter((k) => k.sana === this.todayDate)
        .reduce((sum, k) => sum + (k.humo || 0), 0);
    },

    totalQarz() {
      return this.bemorlar.reduce((sum, b) => sum + (b.qarz || 0), 0);
    },
    qarzQoshildi() {
      // Hozircha namuna uchun 0
      return 0;
    },
    tolandiSumma() {
      // Hozircha namuna uchun 0
      return 0;
    },
  },
  methods: {
    showStat() {
      this.currentView = "stat";
    },
    showKirim() {
      this.currentView = "kirim";
    },
    showChiqim() {
      this.currentView = "chiqim";
    },
    showBemorlar() {
      this.currentView = "bemorlar";
    },

    openAddModal(type) {
      this.modalType = type;
      this.resetForm();
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.toggleKimdanList = false;
      this.newKimdan = "";
    },

    resetForm() {
      this.form = {
        kimdan: "",
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
        izoh: "",
      };
    },

    addKimdan() {
      if (this.newKimdan.trim() !== "") {
        if (!this.optionsKimdan.includes(this.newKimdan.trim())) {
          this.optionsKimdan.push(this.newKimdan.trim());
          this.newKimdan = "";
        }
      }
    },

    removeKimdan(idx) {
      this.optionsKimdan.splice(idx, 1);
    },

    saveKirim() {
      if (!this.form.kimdan) {
        alert("Kimdan qayerdan ma'lumotini kiriting!");
        return;
      }
      // Yangi kirimni qo'shish
      this.kirimlar.push({
        id: this.kirimlar.length + 1,
        sana: this.todayDate,
        soat: this.todayTime,
        kimdan: this.form.kimdan,
        naqd: this.form.naqd,
        karta: this.form.karta,
        click: this.form.click,
        humo: this.form.humo,
        kassir: this.currentKassir,
        izoh: this.form.izoh,
      });
      this.closeModal();
    },

    saveChiqim() {
      if (!this.form.kimdan) {
        alert("Kimga qayerga ma'lumotini kiriting!");
        return;
      }
      this.chiqimlar.push({
        id: this.chiqimlar.length + 1,
        sana: this.todayDate,
        vaqt: this.todayTime,
        qayerga: this.form.kimdan,
        naqd: this.form.naqd,
        karta: this.form.karta,
        click: this.form.click,
        humo: this.form.humo,
        kimdan: this.currentKassir,
        kassir: this.currentKassir,
        izoh: this.form.izoh,
      });
      this.closeModal();
    },

    // Bemorlar bo‘limi uchun:
    openPaymentModal(bemor) {
      this.selectedBemor = bemor;
      this.paymentForm = {
        tur: "kirim",
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
      };
      this.showPaymentModal = true;
    },
    closePaymentModal() {
      this.showPaymentModal = false;
      this.selectedBemor = null;
      this.paymentForm = {
        tur: "kirim",
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
      };
    },

    savePayment() {
      if (!this.selectedBemor) return;
      const pf = this.paymentForm;

      // Namuna uchun faqat konsolga chiqaramiz
      console.log("To‘lov saqlanmoqda:", pf);

      // To‘lovni hisobga olishni qo‘shish kerak

      alert("To‘lov saqlandi (namuna).");

      this.closePaymentModal();
    },
  },
};
</script>

<style scoped>
/* Umumiy konteyner */
.section {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f8fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.1);
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  color: #333;
}

/* --- Top Navigation Buttons --- */
.top-navigation {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  justify-content: center;
  flex-wrap: wrap;
}

.top-navigation button {
  background: #e0e7ff;
  border: none;
  padding: 10px 18px;
  font-size: 16px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgb(80 95 255 / 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.top-navigation button:hover {
  background: #4f46e5;
  color: white;
  box-shadow: 0 6px 15px rgb(79 70 229 / 0.6);
}

.top-navigation button.active {
  background: #4338ca;
  color: #fff;
  box-shadow: 0 6px 20px rgb(67 56 202 / 0.8);
  font-weight: 700;
}

/* --- Statistika bo‘limi jadval dizayni --- */
.stat-box h4 {
  font-weight: 700;
  margin: 20px 0 10px 0;
  color: #4f46e5;
  text-align: center;
  letter-spacing: 0.04em;
}

.kirim-table,
.bemor-table,
.summary-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.05);
  border-radius: 10px;
  overflow: hidden;
  background: white;
  margin-bottom: 25px;
}

.kirim-table thead tr,
.bemor-table thead tr,
.summary-table thead tr {
  background: #4338ca;
  color: white;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.kirim-table th,
.kirim-table td,
.bemor-table th,
.bemor-table td,
.summary-table th,
.summary-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  font-size: 14.5px;
}

.kirim-table tbody tr:hover,
.bemor-table tbody tr:hover,
.summary-table tbody tr:hover {
  background: #f0f4ff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.kirim-table tbody tr:last-child td,
.bemor-table tbody tr:last-child td,
.summary-table tbody tr:last-child td {
  border-bottom: none;
}

/* Xulosa bloki */
.summary-block {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 16px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgb(67 56 202 / 0.15);
  margin-top: 20px;
  font-size: 15px;
  color: #4338ca;
}

/* --- Filter va sarlavhalar --- */
.header {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.header h3 {
  font-weight: 700;
  font-size: 24px;
  color: #4338ca;
  flex-grow: 1;
  min-width: 200px;
}

.date-range,
.filter-by-person {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #4b5563;
  min-width: 220px;
}

.date-range label,
.filter-by-person label {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.date-range input[type="date"],
.filter-by-person input[type="text"] {
  padding: 6px 10px;
  border: 1.8px solid #c7d2fe;
  border-radius: 8px;
  font-size: 14px;
  outline-offset: 2px;
  transition: border-color 0.3s ease;
}

.date-range input[type="date"]:focus,
.filter-by-person input[type="text"]:focus {
  border-color: #4338ca;
  box-shadow: 0 0 6px rgb(67 56 202 / 0.5);
}

/* --- Tugmalar --- */
.add-btn,
.save-btn,
.cancel-btn,
.remove-btn {
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 22px;
  font-size: 15px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.add-btn {
  background-color: #4338ca;
  color: white;
  box-shadow: 0 6px 15px rgb(67 56 202 / 0.7);
}

.add-btn:hover {
  background-color: #5c4dd9;
  box-shadow: 0 8px 20px rgb(92 77 217 / 0.8);
}

.save-btn {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 5px 14px rgb(37 99 235 / 0.7);
}

.save-btn:hover {
  background-color: #3b82f6;
  box-shadow: 0 6px 18px rgb(59 130 246 / 0.8);
}

.cancel-btn {
  background-color: #ef4444;
  color: white;
  margin-left: 12px;
  box-shadow: 0 5px 14px rgb(239 68 68 / 0.7);
}

.cancel-btn:hover {
  background-color: #f87171;
  box-shadow: 0 6px 18px rgb(248 113 113 / 0.8);
}

.remove-btn {
  background-color: #dc2626;
  color: white;
  padding: 3px 9px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 4px 10px rgb(220 38 38 / 0.7);
  transition: background-color 0.25s ease;
}

.remove-btn:hover {
  background-color: #b91c1c;
}

/* --- Modal oynalar --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.7);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  animation: fadeInOverlay 0.3s ease forwards;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal1 {
  background: white;
  border-radius: 16px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 25px 30px 30px 30px;
  box-shadow: 0 10px 35px rgb(0 0 0 / 0.15);
  animation: slideDown 0.35s ease forwards;
  color: #1f2937;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wide-modal {
  max-width: 800px;
}

.modal1 h3 {
  margin-bottom: 20px;
  font-weight: 700;
  color: #4338ca;
  text-align: center;
  letter-spacing: 0.04em;
}

/* --- Forma elementlari --- */
.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #374151;
}

.form-group label {
  margin-bottom: 6px;
  font-size: 14px;
}

input[type='text'],
input[type='number'],
input[type='date'],
input[type='time'],
textarea,
select {
  border: 1.8px solid #c7d2fe;
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  outline-offset: 3px;
  resize: vertical;
}

input[type='text']:focus,
input[type='number']:focus,
input[type='date']:focus,
input[type='time']:focus,
textarea:focus,
select:focus {
  border-color: #4338ca;
  box-shadow: 0 0 10px rgb(67 56 202 / 0.5);
}

/* --- Select group with toggle list --- */
.select-group-vertical {
  position: relative;
  max-width: 350px;
}

.select-group {
  display: flex;
  gap: 8px;
}

.select-group select {
  flex-grow: 1;
  cursor: pointer;
}

.select-group button {
  background: #4338ca;
  color: white;
  border-radius: 8px;
  padding: 5px 12px;
  font-weight: 600;
  font-size: 16px;
  transition: background-color 0.3s ease;
  user-select: none;
  border: none;
  cursor: pointer;
}

.select-group button:hover {
  background-color: #5c4dd9;
}

/* --- Option list dropdown --- */
.option-list {
  position: absolute;
  top: 42px;
  left: 0;
  right: 0;
  max-height: 160px;
  overflow-y: auto;
  background: white;
  border: 1.6px solid #4338ca;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(67 56 202 / 0.15);
  padding: 8px 12px;
  z-index: 10;
  font-weight: 600;
  font-size: 14px;
  color: #4338ca;
}

.option-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.option-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-bottom: 1px solid #e0e7ff;
  cursor: default;
  user-select: none;
}

.option-list li:last-child {
  border-bottom: none;
}

.option-list li:hover {
  background-color: #ede9fe;
}

.add-new {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.add-new input {
  flex-grow: 1;
  border-radius: 8px;
  border: 1.8px solid #c7d2fe;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
}

.add-new input:focus {
  border-color: #4338ca;
  box-shadow: 0 0 8px rgb(67 56 202 / 0.4);
}

.add-new button {
  background-color: #4338ca;
  color: white;
  padding: 6px 14px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 18px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  border: none;
}

.add-new button:hover {
  background-color: #5c4dd9;
}

/* --- Qarzli bemorlar qatori --- */
.qarzdor-row:hover {
  background-color: #ffeded;
  transition: background-color 0.3s ease;
}

.qarzdor-row td {
  transition: color 0.3s ease, font-weight 0.3s ease;
}

/* --- Responsive for smaller devices --- */
@media (max-width: 900px) {
  .header {
    flex-direction: column;
    gap: 12px;
  }

  .date-range,
  .filter-by-person {
    width: 100%;
    justify-content: flex-start;
  }

  .top-navigation {
    justify-content: center;
  }

  .kirim-table th,
  .kirim-table td,
  .bemor-table th,
  .bemor-table td {
    font-size: 13px;
    padding: 8px 10px;
  }

  .modal1 {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .top-navigation button {
    font-size: 14px;
    padding: 8px 14px;
  }
}



</style>
