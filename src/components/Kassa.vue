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
        <input type="date" v-model="filterDate" />
        <button class="add-btn" @click="showModal = true">➕ Kirim qo‘shish</button>
      </div>

      <table class="kirim-table">
        <thead>
          <tr>
            <th>Sana</th>
            <th>Soat</th>
            <th>Qayerdan</th>
            <th>Miqdor</th>
            <th>To‘lov usuli</th>
            <th>Kassir</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kirim in filteredKirimlar" :key="kirim.id">
            <td>{{ kirim.sana }}</td>
            <td>{{ kirim.soat }}</td>
            <td>{{ kirim.kimdan }}</td>
            <td>{{ kirim.miqdor.toLocaleString() }} so'm</td>
            <td>{{ kirim.usul }}</td>
            <td>{{ kirim.kassir }}</td>
          </tr>
          <tr v-if="filteredKirimlar.length === 0">
            <td colspan="6">Ma'lumot yo'q</td>
          </tr>
        </tbody>
      </table>

      <!-- Modal (faqat kirim qo‘shishda) -->
     <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
  <div class="modal1 kirim-modal wide-modal">
    <h3>➕ Yangi Kirim</h3>

    <!-- Kassir -->
    <h5>👤 Kassir: {{ form.kassir }}</h5>

    <!-- Sana va vaqt -->
    <div class="row-group">
      <div class="form-group">
        <label>Sana:</label>
        <input type="date" v-model="form.sana" />
      </div>
      <div class="form-group">
        <label>Soat (hh:mm:ss):</label>
        <input type="time" step="1" v-model="form.vaqt" />
      </div>
    </div>

    <!-- Kimdan -->
    <label>Qayerdan (Kimdan):</label>
    <div class="select-group-vertical">
      <div class="select-group">
        <select v-model="form.kimdan">
          <option disabled value="">-- Kimdan tanlang --</option>
          <option v-for="(name, idx) in optionsKimdan" :key="idx" :value="name">{{ name }}</option>
        </select>
        <button @click="toggleList = !toggleList">📋</button>
      </div>

      <div v-if="toggleList" class="kimdan-list">
        <ul>
          <li v-for="(name, idx) in optionsKimdan" :key="idx">
            {{ name }}
            <button @click="removeSpecificKimdan(idx)" title="O'chirish">➖</button>
          </li>
        </ul>

        <div class="select-group add-new">
          <input v-model="newKimdan" placeholder="Yangi nom..." />
          <button @click="addKimdan">➕ Qo‘shish</button>
        </div>
      </div>
    </div>

    <!-- Izoh -->
    <label>📝 Izoh:</label>
    <textarea v-model="form.izoh" placeholder="Qo‘shimcha ma’lumot..." rows="2"></textarea>

    <!-- To‘lovlar -->
    <label>Naqd pul (so'm):</label>
    <input type="number" v-model.number="form.naqd" min="0" placeholder="Naqd miqdori" />

    <label>Karta (so'm):</label>
    <input type="number" v-model.number="form.karta" min="0" placeholder="Karta orqali miqdor" />

    <label>Click (so'm):</label>
    <input type="number" v-model.number="form.click" min="0" placeholder="Click orqali miqdor" />

    <!-- Saqlash -->
    <button class="save-btn" @click="saveKirim">💾 Saqlash</button>
  </div>
</div>


    </div>



    <!-- 3. Chiqim jadvali -->
    <div v-if="currentView === 'chiqim'">
      <div class="header">
        <h3>📤 Chiqimlar</h3>
        <input type="date" v-model="filterDate" />
        <button class="add-btn" @click="showModal = true">➕ Chiqim qo‘shish</button>
      </div>

      <table class="kirim-table">
        <thead>
          <tr>
            <th>Sana va Vaqt</th>
            <th>Qayerga ketdi</th>
            <th>Kimdan</th>
            <th>Naqd</th>
            <th>Karta</th>
            <th>Click</th>
            <th>Kassir</th>
            <th>Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chiqim in filteredChiqimlar" :key="chiqim.id">
            <td>{{ chiqim.sana }} {{ chiqim.vaqt }}</td>
            <td>{{ chiqim.qayerga }}</td>
            <td>{{ chiqim.kimdan }}</td>
            <td>{{ chiqim.naqd.toLocaleString() }}</td>
            <td>{{ chiqim.karta.toLocaleString() }}</td>
            <td>{{ chiqim.click.toLocaleString() }}</td>
            <td>{{ chiqim.kassir }}</td>
            <td>{{ chiqim.izoh }}</td>
          </tr>
          <tr v-if="filteredChiqimlar.length === 0">
            <td colspan="8">Ma'lumot yo'q</td>
          </tr>
        </tbody>
      </table>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
  <div class="modal1 chiqim-modal wide-modal">
    <h3>➖ Yangi Chiqim</h3>

    <!-- Kassir -->
    <h5>👤 Kassir: {{ form.kassir }}</h5>

    <!-- Sana va vaqt -->
    <div class="row-group">
      <div class="form-group">
        <label>Sana:</label>
        <input type="date" v-model="form.sana" />
      </div>
      <div class="form-group">
        <label>Soat (hh:mm:ss):</label>
        <input type="time" step="1" v-model="form.vaqt" />
      </div>
    </div>

    <!-- Qayerga ketdi -->
    <label>Qayerga ketdi:</label>
    <div class="select-group-vertical">
      <div class="select-group">
        <select v-model="form.qayerga">
          <option disabled value="">-- Tanlang --</option>
          <option v-for="(item, idx) in optionsQayerga" :key="idx" :value="item">{{ item }}</option>
        </select>
        <button @click="toggleQayergaList = !toggleQayergaList">📋</button>
      </div>

      <div v-if="toggleQayergaList" class="option-list">
        <ul>
          <li v-for="(item, idx) in optionsQayerga" :key="idx">
            {{ item }} <button @click="removeQayerga(idx)">➖</button>
          </li>
        </ul>
        <div class="select-group add-new">
          <input v-model="newQayerga" placeholder="Yangi joy..." />
          <button @click="addQayerga">➕</button>
        </div>
      </div>
    </div>

    <!-- Kimdan -->
    <label>👤 Kimdan:</label>
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
            {{ item }} <button @click="removeKimdan(idx)">➖</button>
          </li>
        </ul>
        <div class="select-group add-new">
          <input v-model="newKimdan" placeholder="Yangi ism..." />
          <button @click="addKimdan">➕</button>
        </div>
      </div>
    </div>
<!-- Izoh -->
    <label> Izoh:</label>
    <textarea v-model="form.izoh" placeholder="Qo‘shimcha izoh..." rows="2"></textarea>
    <!-- To‘lov turlari -->
    <label> Naqd (so'm):</label>
    <input type="number" min="0" v-model.number="form.naqd" placeholder="Naqd summasi" />

    <label> Karta (so'm):</label>
    <input type="number" min="0" v-model.number="form.karta" placeholder="Karta summasi" />

    <label>Click (so'm):</label>
    <input type="number" min="0" v-model.number="form.click" placeholder="Click summasi" />

    

    <!-- Saqlash tugmasi -->
    <button class="save-btn" @click="saveChiqim">💾 Saqlash</button>
  </div>
      </div>


    </div>


    <div v-if="currentView === 'bemorlar'">
    <div class="header">
      <h3>👤 Bemorlar</h3>
      <button class="add-btn" @click="showAddModal = true">➕ Bemor qo‘shish</button>
    </div>

    <!-- Qarzdorlar ro'yxati -->
    <h4>Qarzdorlar ro'yxati:</h4>
    <table class="bemor-table">
      <thead>
        <tr>
          <th>Ism Familiya</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>Qarz (so'm)</th>
          <th>Naqd</th>
          <th>Karta</th>
          <th>Click</th>
          <th>Kassir</th>
          <th>Sana va Vaqt</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="bemor in qarzdorlar"
          :key="bemor.id"
          class="qarzdor-row"
          @click="openDetails(bemor)"
        >
          <td>{{ bemor.ismFam }}</td>
          <td>{{ bemor.tel }}</td>
          <td>{{ bemor.qayerdan }}</td>
          <td @click.stop="openTolovModal(bemor)">{{ bemor.qarz.toLocaleString() }}</td>
          <td>{{ bemor.naqd.toLocaleString() }}</td>
          <td>{{ bemor.karta.toLocaleString() }}</td>
          <td>{{ bemor.click.toLocaleString() }}</td>
          <td>{{ bemor.kassir }}</td>
          <td>{{ bemor.sana }} {{ bemor.vaqt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Qarzsizlar -->
    <h4>Bemorlar ro'yxati (qarzsizlar):</h4>
    <table class="bemor-table">
      <thead>
        <tr>
          <th>Ism Familiya</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>Qarz (so'm)</th>
          <th>Naqd</th>
          <th>Karta</th>
          <th>Click</th>
          <th>Kassir</th>
          <th>Sana va Vaqt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bemor in qarzsizlar" :key="bemor.id">
          <td>{{ bemor.ismFam }}</td>
          <td>{{ bemor.tel }}</td>
          <td>{{ bemor.qayerdan }}</td>
          <td>{{ bemor.qarz.toLocaleString() }}</td>
          <td>{{ bemor.naqd.toLocaleString() }}</td>
          <td>{{ bemor.karta.toLocaleString() }}</td>
          <td>{{ bemor.click.toLocaleString() }}</td>
          <td>{{ bemor.kassir }}</td>
          <td>{{ bemor.sana }} {{ bemor.vaqt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 🧾 Bemor tafsilotlari modali -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
      <div class="modal1">
        <h3>{{ selectedBemor.ismFam }} - Maʼlumotlar</h3>
        <p><strong>Telefon:</strong> {{ selectedBemor.tel }}</p>
        <p><strong>Qayerdan:</strong> {{ selectedBemor.qayerdan }}</p>
        <p><strong>Qarz:</strong> {{ selectedBemor.qarz.toLocaleString() }} so'm</p>
        <p><strong>Kassir:</strong> {{ selectedBemor.kassir }}</p>
        <p><strong>Sana:</strong> {{ selectedBemor.sana }} {{ selectedBemor.vaqt }}</p>
        <button class="save-btn" @click="showDetailsModal = false">Yopish</button>
      </div>
    </div>

    <!-- 💰 To‘lov qilish modali -->
    <div v-if="showTolovModal" class="modal-overlay" @click.self="showTolovModal = false">
      <div class="modal1">
        <h3>💳 To‘lov qilish - {{ selectedBemor.ismFam }}</h3>

        <div class="form-group">
          <label>Naqd:</label>
          <input type="number" v-model.number="tolov.naqd" />
        </div>
        <div class="form-group">
          <label>Karta:</label>
          <input type="number" v-model.number="tolov.karta" />
        </div>
        <div class="form-group">
          <label>Click:</label>
          <input type="number" v-model.number="tolov.click" />
        </div>

        <div class="row-group" style="justify-content: flex-end">
          <button class="save-btn" @click="saqlash()">💾 Saqlash</button>
          <button class="add-btn" @click="showTolovModal = false">Bekor qilish</button>
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

      // YANGI QO‘SHILGAN
      selectedBemor: null,
      showDetailsModal: false,
      showTolovModal: false,
      tolov: {
        naqd: 0,
        karta: 0,
        click: 0,
      },

      // Mavjud ma'lumotlar
      kirimlar: [
        { id: 1, sana: '2025-07-02', soat: '09:30:00', kimdan: 'Firma A', miqdor: 500000, usul: 'Naqd', kassir: 'Ali', izoh: '' },
        { id: 2, sana: '2025-07-02', soat: '11:00:00', kimdan: 'Firma B', miqdor: 300000, usul: 'Karta', kassir: 'Vali', izoh: '' },
        { id: 3, sana: '2025-07-01', soat: '14:15:00', kimdan: 'Firma C', miqdor: 200000, usul: 'Click', kassir: 'Ali', izoh: '' },
      ],

      chiqimlar: [
        { id: 1, sana: '2025-07-02', vaqt: '10:00:00', qayerga: 'Xarid', kimdan: 'Firma A', naqd: 200000, karta: 100000, click: 50000, kassir: 'Ali', izoh: 'Xarajat' },
        { id: 2, sana: '2025-07-01', vaqt: '15:00:00', qayerga: 'Xodim', kimdan: 'Firma B', naqd: 100000, karta: 50000, click: 0, kassir: 'Vali', izoh: 'Maosh' },
      ],

      bemorlar: [
        { id: 1, ismFam: 'Ali Valiyev', tel: '+998901234567', qayerdan: 'Toshkent', qarz: 500000, naqd: 200000, karta: 100000, click: 50000, kassir: 'Ali', sana: '2025-07-01', vaqt: '09:00:00' },
        { id: 2, ismFam: 'Gulbahor Xolmatova', tel: '+998909876543', qayerdan: 'Samarqand', qarz: 0, naqd: 300000, karta: 0, click: 0, kassir: 'Vali', sana: '2025-07-02', vaqt: '10:30:00' },
      ],

      filterDate: new Date().toISOString().slice(0, 10),
      showModal: false,

      form: {
        sana: '',
        vaqt: '',
        kimdan: '',
        qayerga: '',
        izoh: '',
        naqd: 0,
        karta: 0,
        click: 0,
        kassir: 'Admin',
      },

      optionsKimdan: ['Firma A', 'Firma B', 'Firma C'],
      optionsQayerga: ['Xarid', 'Xodim', 'Xizmatlar'],
      toggleList: false,
      toggleKimdanList: false,
      toggleQayergaList: false,
      newKimdan: '',
      newQayerga: '',
      qarzQoshildi: 0,
      tolandiSumma: 0,
    }
  },

  computed: {
    filteredKirimlar() {
      return this.kirimlar.filter(k => k.sana === this.filterDate)
    },
    filteredChiqimlar() {
      return this.chiqimlar.filter(c => c.sana === this.filterDate)
    },
    qarzdorlar() {
      return this.bemorlar.filter(b => b.qarz > 0)
    },
    qarzsizlar() {
      return this.bemorlar.filter(b => b.qarz === 0)
    },
    todayKirim() {
      return this.filteredKirimlar.reduce((sum, k) => sum + k.miqdor, 0)
    },
    todayNaqdKirim() {
      return this.filteredKirimlar.filter(k => k.usul === 'Naqd').reduce((sum, k) => sum + k.miqdor, 0)
    },
    todayKartaKirim() {
      return this.filteredKirimlar.filter(k => k.usul === 'Karta').reduce((sum, k) => sum + k.miqdor, 0)
    },
    todayClickKirim() {
      return this.filteredKirimlar.filter(k => k.usul === 'Click').reduce((sum, k) => sum + k.miqdor, 0)
    },
    todayChiqim() {
      return this.filteredChiqimlar.reduce((sum, c) => sum + c.naqd + c.karta + c.click, 0)
    },
    todayNaqdChiqim() {
      return this.filteredChiqimlar.reduce((sum, c) => sum + c.naqd, 0)
    },
    todayKartaChiqim() {
      return this.filteredChiqimlar.reduce((sum, c) => sum + c.karta, 0)
    },
    todayClickChiqim() {
      return this.filteredChiqimlar.reduce((sum, c) => sum + c.click, 0)
    },
    totalQarz() {
      return this.bemorlar.reduce((sum, b) => sum + b.qarz, 0)
    }
  },

  methods: {
    showStat() {
      this.currentView = 'stat'
      this.showModal = false
    },
    showKirim() {
      this.currentView = 'kirim'
      this.showModal = false
      this.clearForm()
    },
    showChiqim() {
      this.currentView = 'chiqim'
      this.showModal = false
      this.clearForm()
    },
    showBemorlar() {
      this.currentView = 'bemorlar'
      this.showModal = false
      this.clearForm()
    },
    clearForm() {
      this.form = {
        sana: this.filterDate,
        vaqt: '',
        kimdan: '',
        qayerga: '',
        izoh: '',
        naqd: 0,
        karta: 0,
        click: 0,
        kassir: 'Admin',
      }
      this.newKimdan = ''
      this.newQayerga = ''
      this.toggleList = false
      this.toggleKimdanList = false
      this.toggleQayergaList = false
    },
    saveKirim() {
      if (!this.form.sana || !this.form.vaqt || !this.form.kimdan) {
        alert('Iltimos, barcha majburiy maydonlarni to‘ldiring!')
        return
      }
      const miqdor = Number(this.form.naqd) + Number(this.form.karta) + Number(this.form.click)
      if (miqdor <= 0) {
        alert('Iltimos, kamida bir to‘lov turida miqdor kiriting!')
        return
      }
      const usul = this.form.naqd > 0 ? 'Naqd' : this.form.karta > 0 ? 'Karta' : 'Click'
      this.kirimlar.push({
        id: Date.now(),
        sana: this.form.sana,
        soat: this.form.vaqt,
        kimdan: this.form.kimdan,
        miqdor: miqdor,
        usul: usul,
        kassir: this.form.kassir,
        izoh: this.form.izoh,
      })
      alert('Kirim muvaffaqiyatli qo‘shildi!')
      this.showModal = false
      this.clearForm()
    },
    saveChiqim() {
      if (!this.form.sana || !this.form.vaqt || !this.form.kimdan || !this.form.qayerga) {
        alert('Iltimos, barcha majburiy maydonlarni to‘ldiring!')
        return
      }
      const naqd = Number(this.form.naqd)
      const karta = Number(this.form.karta)
      const click = Number(this.form.click)
      if (naqd + karta + click <= 0) {
        alert('Iltimos, kamida bir to‘lov turida miqdor kiriting!')
        return
      }
      this.chiqimlar.push({
        id: Date.now(),
        sana: this.form.sana,
        vaqt: this.form.vaqt,
        qayerga: this.form.qayerga,
        kimdan: this.form.kimdan,
        naqd,
        karta,
        click,
        kassir: this.form.kassir,
        izoh: this.form.izoh,
      })
      alert('Chiqim muvaffaqiyatli qo‘shildi!')
      this.showModal = false
      this.clearForm()
    },
    openDetails(bemor) {
      this.selectedBemor = bemor
      this.showDetailsModal = true
    },
    openTolovModal(bemor) {
      this.selectedBemor = bemor
      this.tolov = { naqd: 0, karta: 0, click: 0 }
      this.showTolovModal = true
    },
    saqlash() {
      const jami = this.tolov.naqd + this.tolov.karta + this.tolov.click
      if (jami <= 0) {
        alert("Iltimos, to'lov miqdorini kiriting.")
        return
      }

      this.selectedBemor.qarz -= jami
      if (this.selectedBemor.qarz < 0) this.selectedBemor.qarz = 0

      this.selectedBemor.naqd += this.tolov.naqd
      this.selectedBemor.karta += this.tolov.karta
      this.selectedBemor.click += this.tolov.click

      alert("To‘lov saqlandi!")
      this.showTolovModal = false
    },
    addKimdan() {
      if (this.newKimdan && !this.optionsKimdan.includes(this.newKimdan)) {
        this.optionsKimdan.push(this.newKimdan)
        this.newKimdan = ''
      }
    },
    removeSpecificKimdan(index) {
      this.optionsKimdan.splice(index, 1)
    },
    addQayerga() {
      if (this.newQayerga && !this.optionsQayerga.includes(this.newQayerga)) {
        this.optionsQayerga.push(this.newQayerga)
        this.newQayerga = ''
      }
    },
    removeQayerga(index) {
      this.optionsQayerga.splice(index, 1)
    },
    removeKimdan(index) {
      this.optionsKimdan.splice(index, 1)
    }
  },
  created() {
    this.clearForm()
  }
}
</script>


<style>
 /* ======================= */
/* --- Umumiy konteyner --- */
/* ======================= */
.section {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* ======================= */
/* --- Top Navigation Buttons --- */
.top-navigation {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  justify-content: center;
}

.top-navigation button {
  padding: 10px 22px;
  border: 2px solid #1A6291;
  background-color: transparent;
  color: #1A6291;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  box-shadow: inset 0 0 0 0 #1A6291;
}

.top-navigation button:hover,
.top-navigation button.active {
  background-color: #1A6291;
  color: #fff;
  box-shadow: inset 100px 0 0 0 #1A6291;
}

/* ======================= */
/* --- Jadval Dizayni --- */
.kirim-table, .bemor-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
}

.kirim-table thead tr,
.bemor-table thead tr {
  background-color: #1A6291;
  color: white;
  font-weight: 700;
}

.kirim-table th, .kirim-table td,
.bemor-table th, .bemor-table td {
  padding: 10px 14px;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
  word-break: break-word;
}

.kirim-table tbody tr:nth-child(even),
.bemor-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.kirim-table tbody tr:hover,
.bemor-table tbody tr:hover {
  background-color: #d7e6f8; /* biroz ochroq rang */
}

/* Qarzdorlar uchun maxsus qizil rang */
.qarzdor-row {
  background-color: #ffe5e5 !important;
  color: #b00020;
  font-weight: 600;
}

/* ======================= */
/* --- Header va Inputlar --- */
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.header h3 {
  font-weight: 700;
  color: #1A6291;
}

.header input[type="date"] {
  padding: 6px 10px;
  border: 1.5px solid #1A6291;
  border-radius: 5px;
  font-size: 14px;
  max-width: 160px;
  transition: border-color 0.3s ease;
}

.header input[type="date"]:focus {
  outline: none;
  border-color: #134b6a; /* biroz qoraroq */
}

/* ======================= */
/* --- Tugmalar --- */
.add-btn, .save-btn {
  background-color: #1A6291;
  border: none;
  color: white;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  box-shadow: 0 3px 6px rgba(26, 98, 145, 0.4);
  user-select: none;
}

.add-btn:hover, .save-btn:hover {
  background-color: #134b6a;
  box-shadow: 0 5px 10px rgba(19, 75, 106, 0.6);
}

/* ======================= */
/* --- Modal Overlay --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center; /* markazlash */
  z-index: 1100;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* ======================= */
/* --- Modal Box --- */
.modal1 {
  background: white;
  padding: 35px 40px; /* kengroq padding */
  border-radius: 14px;
  width: 800px; /* kattaroq modal */
  max-width: 95%;
  max-height: 90vh; /* maksimal balandlik - ekran 90% */
  overflow-y: auto; /* uzun forma uchun scroll */
  box-shadow: 0 14px 35px rgba(0,0,0,0.3);
  font-size: 16px;
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px; /* elementlar orasida bo‘shliq */
  color: #1A6291;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Modal sarlavha */
.modal1 h3 {
  margin: 0 0 20px 0;
  font-weight: 800;
  font-size: 28px;
  color: #1A6291;
  text-align: center;
}

/* ======================= */
/* --- Form elementlari --- */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-group label {
  font-weight: 700;
  margin-bottom: 8px;
  color: #1A6291;
  font-size: 15px;
}

input[type="date"],
input[type="time"],
input[type="number"],
select,
textarea {
  padding: 10px 14px;
  font-size: 16px;
  border: 2px solid #1A6291;
  border-radius: 10px;
  transition: border-color 0.3s ease;
  color: #222;
  font-weight: 600;
}

input[type="date"]:focus,
input[type="time"]:focus,
input[type="number"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #134b6a;
  box-shadow: 0 0 6px rgba(26, 98, 145, 0.6);
}

/* Textarea */
textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Row guruhlari (sana + vaqt yonma-yon) */
.row-group {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Select guruhlari */
.select-group-vertical {
  margin-bottom: 20px;
}

.select-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.select-group select {
  flex-grow: 1;
  font-weight: 600;
}

.select-group button {
  background: #1A6291;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 17px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
  box-shadow: 0 3px 8px rgba(26,98,145,0.5);
}

.select-group button:hover {
  background-color: #134b6a;
  box-shadow: 0 5px 15px rgba(19,75,106,0.7);
}

/* ======================= */
/* --- Ro'yxatlar uchun (kimdan/qayerga) --- */
.kimdan-list, .option-list {
  background: #f0f6fa;
  border: 2px solid #1A6291;
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.kimdan-list ul,
.option-list ul {
  list-style: none;
  padding-left: 0;
  margin: 0 0 10px 0;
}

.kimdan-list ul li,
.option-list ul li {
  display: flex;
  justify-content: space-between;
  padding: 8px 6px;
  border-bottom: 1.5px solid #9bbadf;
  font-weight: 700;
  color: #1A6291;
  user-select: none;
}

.kimdan-list ul li button,
.option-list ul li button {
  background: transparent;
  border: none;
  color: #b00020;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.kimdan-list ul li button:hover,
.option-list ul li button:hover {
  color: #ff3b3b;
}

/* ======================= */
/* --- Yangi qo‘shish input + tugma --- */
.select-group.add-new {
  display: flex;
  gap: 12px;
}

.select-group.add-new input {
  flex-grow: 1;
  border: 2px solid #1A6291;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 16px;
  font-weight: 600;
}

.select-group.add-new button {
  background: #1A6291;
  border: none;
  padding: 9px 16px;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.25s ease;
  box-shadow: 0 3px 8px rgba(26,98,145,0.5);
}

.select-group.add-new button:hover {
  background-color: #134b6a;
  box-shadow: 0 5px 15px rgba(19,75,106,0.7);
}

/* ======================= */
/* --- Matnlar uchun maxsus ranglar --- */
h4 {
  margin-top: 36px;
  color: #134b6a;
  font-weight: 700;
  font-size: 20px;
  text-align: left;
}

/* ======================= */
/* --- Xatolik uchun umumiy alert o‘rniga CSS --- */
.alert-message {
  background: #ffebee;
  border: 1.5px solid #f44336;
  color: #b00020;
  padding: 14px 18px;
  margin-bottom: 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
}

/* ======================= */
/* --- Responsive dizayn --- */
@media (max-width: 900px) {
  .modal1 {
    width: 95%;
    padding: 30px 25px;
  }
  .row-group {
    flex-direction: column;
    gap: 16px;
  }
  .select-group, .select-group.add-new {
    flex-direction: column;
    gap: 10px;
  }
  .select-group button, .select-group.add-new button {
    width: 100%;
    font-size: 16px;
  }
}

@media (max-width: 450px) {
  .section {
    margin-left: 20px;
    margin-right: 20px;
  }
  .modal1 {
    padding: 25px 20px;
  }
  .modal1 h3 {
    font-size: 22px;
  }
  input[type="date"],
  input[type="time"],
  input[type="number"],
  select,
  textarea {
    font-size: 14px;
  }
}
/* ======================= */
/* --- Qarzdor qator interaktiv --- */
.qarzdor-row.bemor-row-clickable td {
  cursor: default;
  transition: background-color 0.2s ease;
}

/* Bemor ismiga bosish uchun */
.qarzdor-row.bemor-row-clickable td:first-child {
  cursor: pointer;
  color: #1A6291;
  text-decoration: underline;
}

/* Qarzni bosish uchun */
.qarzdor-row.bemor-row-clickable td:nth-child(4),
.qarz-cell {
  cursor: pointer;
  font-weight: 700;
  color: #d32f2f;
  transition: background-color 0.2s ease;
}

.qarz-cell:hover {
  background-color: #fce4ec;
  border-radius: 6px;
}

/* Qator hover */
.qarzdor-row.bemor-row-clickable:hover {
  background-color: #ffecec !important;
}

/* ======================= */
/* --- Modal pastki qismi (footer) --- */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Tugmalar */
.modal-footer button {
  padding: 10px 18px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 15px;
}

/* Saqlash tugmasi */
.modal-footer .save-btn {
  background-color: #1A6291;
  border: none;
  color: white;
  box-shadow: 0 3px 8px rgba(26,98,145,0.4);
}

.modal-footer .save-btn:hover {
  background-color: #134b6a;
}

/* Bekor qilish tugmasi */
.modal-footer .cancel-btn {
  background-color: #f0f0f0;
  color: #444;
  border: 1px solid #ccc;
}

.modal-footer .cancel-btn:hover {
  background-color: #e0e0e0;
}

</style>
