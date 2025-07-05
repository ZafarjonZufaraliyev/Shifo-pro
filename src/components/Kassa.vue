<template>
  <div class="section kirim-section">
    <!-- Yuqori navigatsiya tugmalari -->

   <div>
      <div class="top-navigation">
        <button :class="{ active: currentView === 'stat' }" @click="showStat()">📊 Statistika</button>
        <button :class="{ active: currentView === 'kirim' }" @click="showKirim()">📥 Kirim</button>
        <button :class="{ active: currentView === 'chiqim' }" @click="showChiqim()">📤 Chiqim</button>
        <button :class="{ active: currentView === 'bemorlar' }" @click="showBemorlar()">Bemorlar</button>
      </div>

      <!-- Statistika bo'limi -->
      <div v-if="currentView === 'stat'" class="stat-box">
        <!-- Jadval 1: Kirim -->
        <h4>📥 Bugungi Kirim</h4>
        <table class="kirim-table">
          <thead>
            <tr>
              <th>Jami</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ todayKirim.toLocaleString() }} so'm</td>
              <td>{{ todayNaqdKirim.toLocaleString() }} so'm</td>
              <td>{{ todayKartaKirim.toLocaleString() }} so'm</td>
              <td>{{ todayClickKirim.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
        </table>

        <!-- Jadval 2: Chiqim -->
        <h4>📤 Bugungi Chiqim</h4>
        <table class="kirim-table">
          <thead>
            <tr>
              <th>Jami</th>
              <th>Naqd</th>
              <th>Karta</th>
              <th>Click</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ todayChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayNaqdChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayKartaChiqim.toLocaleString() }} so'm</td>
              <td>{{ todayClickChiqim.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
        </table>

        <!-- Jadval 3: Bemorlar -->
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


    <!-- 2. Kirim jadvali -->
 <div v-if="currentView === 'kirim'">
  <div class="header">
    <h3>📥 Kirimlar</h3>

    <!-- Sana oralig‘i -->
    <div class="date-range">
      <label>📅 Sana oralig‘i:</label>
      <input type="date" v-model="startDate" />
      <span>dan</span>
      <input type="date" v-model="endDate" />
    </div>

    <!-- Kimdan filter -->
    <div class="filter-by-person">
      <label>👤 Kimdan (qayerdan):</label>
      <input type="text" v-model="filterKimdan" placeholder="Masalan: Homiylar jamg‘armasi" />
    </div>

    <button class="add-btn" @click="openAddModal">➕ Kirim qo‘shish</button>
  </div>

  <!-- Jadval -->
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
        <td>{{ kirim.naqd?.toLocaleString() || 0 }}</td>
        <td>{{ kirim.karta?.toLocaleString() || 0 }}</td>
        <td>{{ kirim.click?.toLocaleString() || 0 }}</td>
        <td>{{ kirim.humo?.toLocaleString() || 0 }}</td>
        <td>{{ kirim.kassir }}</td>
        <td>{{ kirim.izoh }}</td>
      </tr>
      <tr v-if="filteredKirimlar.length === 0">
        <td colspan="8">🔍 Ma'lumot topilmadi.</td>
      </tr>
    </tbody>
  </table>

  <!-- Xulosa -->
  <div v-if="filterKimdan || startDate || endDate" class="summary-block">
    <h4>📊 Xulosa:</h4>
    <p>Necha marta: <strong>{{ summary.count }}</strong></p>
    <p>Jami summa: <strong>{{ summary.total.toLocaleString() }}</strong> so‘m</p>
  </div>

  <!-- Kirim Qo‘shish Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal1 chiqim-modal wide-modal">
      <h3>➖ Yangi Kirim qo‘shish</h3>

      <!-- Sana va vaqt (readonly, bugungi sana va hozirgi vaqt) -->
      <div class="row-group">
        <div class="form-group">
          <label>Sana:</label>
          <input type="date" :value="todayDate" readonly />
        </div>
        <div class="form-group">
          <label>Soat (hh:mm:ss):</label>
          <input type="time" :value="todayTime" readonly />
        </div>
      </div>

      <!-- Kimdan (select + yangi qo‘shish) -->
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

      <!-- To‘lov summalari -->
      <label>Naqd (so'm):</label>
      <input type="number" min="0" v-model.number="form.naqd" placeholder="Naqd summasi" />

      <label>Karta (so'm):</label>
      <input type="number" min="0" v-model.number="form.karta" placeholder="Karta summasi" />

      <label>Click (so'm):</label>
      <input type="number" min="0" v-model.number="form.click" placeholder="Click summasi" />

      <label>Humo (so'm):</label>
      <input type="number" min="0" v-model.number="form.humo" placeholder="Humo summasi" />

      <!-- Kassir ismi (readonly) -->
      <label>Kassir (login):</label>
      <input type="text" :value="currentKassir" readonly />

      <!-- Izoh -->
      <label>Izoh:</label>
      <textarea v-model="form.izoh" rows="2" placeholder="Qo‘shimcha izoh..." />

      <!-- Saqlash tugmalari -->
      <div class="modal-buttons">
        <button class="save-btn" @click="saveKirim">💾 Saqlash</button>
        <button class="cancel-btn" @click="closeModal">❌ Bekor qilish</button>
      </div>
    </div>
  </div>
</div>





    <!-- 3. Chiqim jadvali -->

  <div v-if="currentView === 'chiqim'">
    <div class="header">
      <h3>📤 Chiqimlar</h3>

      <!-- Sana oralig‘i filtri -->
      <div class="date-range">
        <label>🔍 Sana oralig‘i:</label>
        <input type="date" v-model="startDate" />
        <span>dan</span>
        <input type="date" v-model="endDate" />
      </div>

      <!-- Kimga qidiruv -->
      <div class="filter-by-person">
        <label>👤 Kimga berilganini qidirish:</label>
        <input type="text" v-model="filterKimga" placeholder="Masalan: Rustam aka" />
      </div>

      <button class="add-btn" @click="openAddModal">➕ Chiqim qo‘shish</button>
    </div>

    <!-- Jadval -->
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
          <td>{{ chiqim.naqd?.toLocaleString() || 0 }}</td>
          <td>{{ chiqim.karta?.toLocaleString() || 0 }}</td>
          <td>{{ chiqim.click?.toLocaleString() || 0 }}</td>
          <td>{{ chiqim.humo?.toLocaleString() || 0 }}</td>
          <td>{{ chiqim.kimdan }}</td>
          <td>{{ chiqim.kassir }}</td>
          <td>{{ chiqim.izoh }}</td>
        </tr>
        <tr v-if="filteredChiqimlar.length === 0">
          <td colspan="10">🔍 Belgilangan sanada chiqimlar topilmadi.</td>
        </tr>
      </tbody>
    </table>

    <!-- 🔢 Hisobot chiqishi faqat filterKimga mavjud bo‘lsa -->
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
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal1 chiqim-modal wide-modal">
        <h3>➖ Yangi Chiqim qo‘shish</h3>

        <!-- Sana va vaqt (o‘zgartirib bo‘lmaydi) -->
        <div class="row-group">
          <div class="form-group">
            <label>Sana:</label>
            <input type="date" :value="todayDate" readonly />
          </div>
          <div class="form-group">
            <label>Soat (hh:mm:ss):</label>
            <input type="time" :value="todayTime" readonly />
          </div>
        </div>

        <!-- Kimga (select + qo‘shish va o‘chirish) -->
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

        <!-- To‘lov summalari -->
        <label>Naqd (so'm):</label>
        <input type="number" min="0" v-model.number="form.naqd" placeholder="Naqd summasi" />

        <label>Karta (so'm):</label>
        <input type="number" min="0" v-model.number="form.karta" placeholder="Karta summasi" />

        <label>Click (so'm):</label>
        <input type="number" min="0" v-model.number="form.click" placeholder="Click summasi" />

        <label>Humo (so'm):</label>
        <input type="number" min="0" v-model.number="form.humo" placeholder="Humo summasi" />

        <!-- Kassir ismi (readonly) -->
        <label>Kassir (login):</label>
        <input type="text" :value="currentKassir" readonly />

        <!-- Izoh -->
        <label>Izoh:</label>
        <textarea v-model="form.izoh" rows="2" placeholder="Qo‘shimcha izoh..." />

        <!-- Saqlash tugmasi -->
        <div class="modal-buttons">
          <button class="save-btn" @click="saveChiqim">💾 Saqlash</button>
          <button class="cancel-btn" @click="closeModal">❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  </div>




  <div v-if="currentView === 'bemorlar'">
    <div class="header">
      <h3>👤 Bemorlar</h3>
      
    </div>

    <!-- Qarzdorlar ro'yxati -->
    <h4>Qarzdorlar ro'yxati:</h4>
    <table class="bemor-table">
      <thead>
        <tr>
          <th>Sana va Vaqt</th>
          <th>Ism Familiya</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>Naqd</th>
          <th>Haqqi</th> <!-- Qarz shu yerda ko'rsatiladi -->
          <th>Karta</th>
          <th>Click</th>
          <th>Humo</th> <!-- Qo'shimcha ustun -->
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
            :style="{ color: bemor.qarz > 0 ? 'red' : 'inherit', 'font-weight': bemor.qarz > 0 ? 'bold' : 'normal' }"
            @click.stop="openTolovModal(bemor)"
          >
            {{ bemor.naqd.toLocaleString() }}
            <span v-if="bemor.qarz > 0"> (Qarz: {{ bemor.qarz.toLocaleString() }})</span>
          </td>
          <td>{{ bemor.karta.toLocaleString() }}</td>
          <td>{{ bemor.click.toLocaleString() }}</td>
          <td>{{ bemor.humo?.toLocaleString() || 0 }}</td>
          <td>{{ bemor.kassir }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Qarzsizlar -->
    <h4>Bemorlar ro'yxati (qarzsizlar):</h4>
    <table class="bemor-table">
      <thead>
        <tr>
          <th>Sana va Vaqt</th>
          <th>Ism Familiya</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>Naqd</th>
          <th>Haqqi</th>
          <th>Karta</th>
          <th>Click</th>
          <th>Humo</th> <!-- Qo'shimcha ustun -->
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
          <td>{{ bemor.humo?.toLocaleString() || 0 }}</td>
          <td>{{ bemor.kassir }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 🧾 Bemor tafsilotlari modali -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
      <div class="modal1">
        <h3>{{ selectedBemor.ismFam }} - Maʼlumotlar</h3>
        <p><strong>Telefon:</strong> {{ selectedBemor.tel }}</p>
        <p><strong>Qayerdan:</strong> {{ selectedBemor.qayerdan }}</p>
        <p><strong>Qarz:</strong> <span style="color:red; font-weight:bold">{{ selectedBemor.qarz.toLocaleString() }}</span> so'm</p>
        <p><strong>Kassir:</strong> {{ selectedBemor.kassir }}</p>
        <p><strong>Sana:</strong> {{ selectedBemor.sana }} {{ selectedBemor.vaqt }}</p>
        <button class="save-btn" @click="showDetailsModal = false">Yopish</button>
      </div>
    </div>

    <!-- 💳 To‘lov qilish modali (Yangi qo'shilgan) -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal1">
        <h3>💰 To‘lov qilish - {{ selectedBemor.ismFam }}</h3>

        <!-- Sana readonly (bugungi sana) -->
        <div class="form-group">
          <label>Sana:</label>
          <input type="date" :value="todayDate" readonly />
        </div>

        <!-- Vaqt readonly (00:00:00) -->
        <div class="form-group">
          <label>Vaqt:</label>
          <input type="time" value="00:00:00" readonly />
        </div>

        <!-- Kassir (readonly) -->
        <div class="form-group">
          <label>Kassir:</label>
          <input type="text" :value="currentKassir" readonly />
        </div>

        <!-- To‘lovchi (readonly) -->
        <div class="form-group">
          <label>To‘lovchi:</label>
          <input type="text" :value="selectedBemor.ismFam" readonly />
        </div>

        <!-- Kirim yoki Chiqim tanlash -->
        <div class="form-group">
          <label>Tur:</label>
          <select v-model="form.tur">
            <option value="kirim">Kirim</option>
            <option value="chiqim">Chiqim</option>
          </select>
        </div>

        <!-- To‘lov summalari -->
        <div class="form-group">
          <label>Naqd (so'm):</label>
          <input type="number" v-model.number="form.naqd" min="0" />
        </div>
        <div class="form-group">
          <label>Karta (so'm):</label>
          <input type="number" v-model.number="form.karta" min="0" />
        </div>
        <div class="form-group">
          <label>Click (so'm):</label>
          <input type="number" v-model.number="form.click" min="0" />
        </div>
        <div class="form-group">
          <label>Humo (so'm):</label>
          <input type="number" v-model.number="form.humo" min="0" />
        </div>

        <div class="row-group" style="justify-content: flex-end;">
          <button class="save-btn" @click="savePayment">💾 Saqlash</button>
          <button class="add-btn" @click="closePaymentModal">Bekor qilish</button>
        </div>
      </div>
    </div>

</div>

  </div>
</template>
<script>
export default {
  data() {
    return {
      currentView: 'stat',

      kirimlar: [],
      chiqimlar: [],
      bemorlar: [],

      // Modal holatlari
      showModal: false,
      showDetailsModal: false,
      showPaymentModal: false,

      // Filtirlar
      filterKimdan: '',
      filterKimga: '',
      startDate: '',
      endDate: '',

      // Kimdan ro‘yxati
      optionsKimdan: ['Homiylar jamg‘armasi', 'Mahalla qo‘mitasi', 'Shaxsiy donor'],
      newKimdan: '',
      toggleKimdanList: false,

      // Formlar
      form: {
        sana: '',
        soat: '',
        kimdan: '',
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
        izoh: ''
      },

      paymentForm: {
        tur: 'kirim',
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0
      },

      selectedBemor: null,
      currentKassir: 'Ali'
    };
  },

  computed: {
    todayDate() {
      return new Date().toISOString().slice(0, 10);
    },
    todayTime() {
      return new Date().toTimeString().slice(0, 8);
    },

    // Kirimlar
    filteredKirimlar() {
      return this.kirimlar.filter(item => {
        const s = this.startDate ? item.sana >= this.startDate : true;
        const e = this.endDate ? item.sana <= this.endDate : true;
        const f = this.filterKimdan ? item.kimdan.toLowerCase().includes(this.filterKimdan.toLowerCase()) : true;
        return s && e && f;
      });
    },
    summary() {
      const arr = this.filteredKirimlar;
      const count = arr.length;
      const total = arr.reduce((sum, i) => sum + (i.naqd || 0) + (i.karta || 0) + (i.click || 0) + (i.humo || 0), 0);
      return { count, total };
    },

    filteredChiqimlar() {
      return this.chiqimlar.filter(item => {
        const s = this.startDate ? item.sana >= this.startDate : true;
        const e = this.endDate ? item.sana <= this.endDate : true;
        const f = this.filterKimga ? item.qayerga.toLowerCase().includes(this.filterKimga.toLowerCase()) : true;
        return s && e && f;
      });
    },
    summaryData() {
      const map = {};
      this.filteredChiqimlar.forEach(i => {
        if (!map[i.qayerga]) map[i.qayerga] = { kimdan: i.qayerga, count: 0, total: 0 };
        map[i.qayerga].count++;
        map[i.qayerga].total += (i.naqd || 0) + (i.karta || 0) + (i.click || 0) + (i.humo || 0);
      });
      return Object.values(map);
    },

    qarzdorlar() {
      return this.bemorlar.filter(b => b.qarz > 0);
    },
    qarzsizlar() {
      return this.bemorlar.filter(b => b.qarz === 0);
    },

    todayKirim() {
      return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s, k) => s + (k.naqd || 0) + (k.karta || 0) + (k.click || 0), 0);
    },
    todayNaqdKirim() {
      return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s, k) => s + (k.naqd || 0), 0);
    },
    todayKartaKirim() {
      return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s, k) => s + (k.karta || 0), 0);
    },
    todayClickKirim() {
      return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s, k) => s + (k.click || 0), 0);
    },

    todayChiqim() {
      return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s, c) => s + (c.naqd || 0) + (c.karta || 0) + (c.click || 0), 0);
    },
    todayNaqdChiqim() {
      return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s, c) => s + (c.naqd || 0), 0);
    },
    todayKartaChiqim() {
      return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s, c) => s + (c.karta || 0), 0);
    },
    todayClickChiqim() {
      return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s, c) => s + (c.click || 0), 0);
    },

    totalQarz() {
      return this.bemorlar.reduce((s, b) => s + (b.qarz || 0), 0);
    },
    qarzQoshildi() {
      return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s, k) => s + (k.naqd || 0), 0);
    },
    tolandiSumma() {
      return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s, c) => s + (c.naqd || 0), 0);
    }
  },

  methods: {
    showStat() { this.currentView = 'stat'; },
    showKirim() { this.currentView = 'kirim'; },
    showChiqim() { this.currentView = 'chiqim'; },
    showBemorlar() { this.currentView = 'bemorlar'; },

    openAddModal() {
      this.form = {
        sana: this.todayDate,
        soat: this.todayTime,
        kimdan: '',
        naqd: 0,
        karta: 0,
        click: 0,
        humo: 0,
        izoh: ''
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },

    addKimdan() {
      const v = this.newKimdan.trim();
      if (v && !this.optionsKimdan.includes(v)) {
        this.optionsKimdan.push(v);
        this.newKimdan = '';
      }
    },
    removeKimdan(i) {
      this.optionsKimdan.splice(i, 1);
    },

    saveKirim() {
      this.kirimlar.push({ id: Date.now(), ...this.form, kassir: this.currentKassir });
      this.closeModal();
    },
    saveChiqim() {
      this.chiqimlar.push({
        id: Date.now(),
        sana: this.form.sana,
        vaqt: this.form.soat,
        qayerga: this.form.kimdan,
        naqd: this.form.naqd,
        karta: this.form.karta,
        click: this.form.click,
        humo: this.form.humo,
        kassir: this.currentKassir,
        izoh: this.form.izoh
      });
      this.closeModal();
    },

    openPaymentModal(bemor) {
      this.selectedBemor = bemor;
      this.showPaymentModal = true;
    },
    closePaymentModal() {
      this.showPaymentModal = false;
      this.paymentForm = { tur: 'kirim', naqd: 0, karta: 0, click: 0, humo: 0 };
    },
    openTolovModal(bemor) {
      this.openPaymentModal(bemor);
    },
    savePayment() {
      // TODO: Add logic to update bemor's qarz, log the payment, etc.
      this.closePaymentModal();
    }
  }
};
</script>





<style scoped>
/* Asosiy konteyner */
/* Umumiy konteyner */
.section {
  margin: 20px 20px 20px 290px;
  max-width: 1200px;
  padding: 20px;
  background: #fefefe;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}
.top-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f0f6fc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  justify-content: flex-start;
}

.top-navigation button {
  background-color: #ffffff;
  color: #1A6291;
  border: 2px solid #1A6291;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  font-size: 0.95rem;
}

.top-navigation button:hover {
  background-color: #e6f0fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(26, 98, 145, 0.15);
}

.top-navigation button.active {
  background-color: #1A6291;
  color: white;
  border-color: #1A6291;
  box-shadow: 0 3px 10px rgba(26, 98, 145, 0.2);
  transform: scale(1.03);
}
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #1A6291;
}

.header h3 {
  flex: 1 1 100%;
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Jadval */
.bemor-table, .kirim-table, .summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  font-size: 0.95rem;
}

.bemor-table thead, .kirim-table thead, .summary-table th {
  background-color: #1A6291;
  color: white;
}

.bemor-table th, .bemor-table td,
.kirim-table th, .kirim-table td,
.summary-table td {
  border: 1px solid #ccc;
  padding: 8px 10px;
  text-align: center;
}

.bemor-table tbody tr:nth-child(even),
.kirim-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.bemor-table tbody tr:hover,
.kirim-table tbody tr:hover {
  background-color: #e6f0fa;
}

.bemor-table td span {
  font-weight: bold;
  font-size: 0.9rem;
}

.qarzdor-row {
  background-color: #fff7f7;
}

.qarzdor-row:hover {
  background-color: #ffeaea;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 98, 145, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  z-index: 1000;
  overflow-y: auto;
}

/* Modal umumiy */
.modal1 {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  width: 700px;
  max-width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  color: #1A6291;
  font-family: 'Segoe UI', sans-serif;
}

.modal1 h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #1A6291;
  padding-bottom: 8px;
}

/* Formlar */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
  flex: 1 1 200px;
  font-weight: 600;
  color: #1A6291;
}

.form-group label {
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.modal1 textarea {
  padding: 8px 12px;
  font-size: 1rem;
  border: 2px solid #1A6291;
  border-radius: 8px;
  background-color: #f9fbff;
  transition: border-color 0.3s ease;
}

.form-group input[readonly],
.modal1 input[readonly] {
  background-color: #e6f0fa;
  cursor: default;
}

/* Tugmalar */
.save-btn, .add-btn, .cancel-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.save-btn {
  background-color: #1A6291;
  color: white;
}

.save-btn:hover {
  background-color: #14507a;
  transform: scale(1.05);
}

.add-btn {
  background-color: #28a745;
  color: white;
}

.add-btn:hover {
  background-color: #218838;
  transform: scale(1.05);
}

.cancel-btn {
  background-color: #d9534f;
  color: white;
}

.cancel-btn:hover {
  background-color: #b52b27;
  transform: scale(1.05);
}

.row-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

/* Payment grid 2 ustun */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px 20px;
  margin-bottom: 10px;
}

/* Summary block */
.summary-block {
  margin-top: 20px;
  background-color: #d8e6f6;
  border-left: 5px solid #1A6291;
  padding: 15px 20px;
  border-radius: 6px;
  color: #0f3f66;
}

.summary-block h4 {
  margin-bottom: 8px;
  font-weight: 700;
}

/* Responsiv */
@media (max-width: 768px) {
  .modal1, .form-group, .add-btn {
    width: 100%;
  }

  .row-group {
    flex-direction: column;
  }

  .payment-grid {
    grid-template-columns: 1fr !important;
  }

  .kirim-table thead {
    display: none;
  }

  .kirim-table, .kirim-table tbody, .kirim-table tr, .kirim-table td {
    display: block;
    width: 100%;
  }

  .kirim-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    top: 8px;
    font-weight: 600;
    color: #1A6291;
    font-size: 13px;
  }

  .kirim-table td:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
}

</style>
