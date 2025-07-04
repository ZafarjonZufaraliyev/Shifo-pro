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
      // Filtrlash uchun
      startDate: '',
      endDate: '',
      filterKimdan: '',
      filterKimga: '',

      // Kirimlar
      kirimlar: [
        { id: 1, sana: '2025-07-04', soat: '09:30:00', kimdan: 'Homiylar jamg‘armasi', naqd: 100000, karta: 50000, click: 0, humo: 0, kassir: 'Ali', izoh: 'Loyiha uchun' },
        { id: 2, sana: '2025-07-04', soat: '11:00:00', kimdan: 'Mahalla qo‘mitasi', naqd: 200000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Qo‘shimcha mablag‘' },
        { id: 2, sana: '2025-07-04', soat: '11:00:00', kimdan: 'Mahalla qo‘mitasi', naqd: 200000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Qo‘shimcha mablag‘' },
        { id: 2, sana: '2025-07-04', soat: '11:00:00', kimdan: 'Mahalla qo‘mitasi', naqd: 200000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Qo‘shimcha mablag‘' },
        { id: 2, sana: '2025-07-04', soat: '11:00:00', kimdan: 'Mahalla qo‘mitasi', naqd: 200000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Qo‘shimcha mablag‘' },
        { id: 2, sana: '2025-07-04', soat: '11:00:00', kimdan: 'Mahalla qo‘mitasi', naqd: 200000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Qo‘shimcha mablag‘' }
      ],
      optionsKimdan: ['Homiylar jamg‘armasi', 'Mahalla qo‘mitasi', 'Shaxsiy donor'],
      toggleKimdanList: false,
      newKimdan: '',

      // Chiqimlar
      chiqimlar: [
        { id: 1, sana: '2025-07-04', vaqt: '10:00:00', qayerga: 'Rustam aka', naqd: 50000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Xarajat' }, { id: 1, sana: '2025-07-04', vaqt: '10:00:00', qayerga: 'Rustam aka', naqd: 50000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Xarajat' }, { id: 1, sana: '2025-07-04', vaqt: '10:00:00', qayerga: 'Rustam aka', naqd: 50000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Xarajat' }, { id: 1, sana: '2025-07-04', vaqt: '10:00:00', qayerga: 'Rustam aka', naqd: 50000, karta: 0, click: 0, humo: 0, kassir: 'Ali', izoh: 'Xarajat' }
      ],

      // Bemorlar
      bemorlar: [
        { id: 1, sana: '2025-07-03', vaqt: '14:00:00', ismFam: 'Jamshid Islomov', tel: '+998901234567', qayerdan: 'Toshkent', naqd: 100000, karta: 20000, click: 0, humo: 0, kassir: 'Ali', qarz: 50000 },
        { id: 2, sana: '2025-07-02', vaqt: '09:30:00', ismFam: 'Nigora Rahimova', tel: '+998901112233', qayerdan: 'Samarqand', naqd: 300000, karta: 0, click: 0, humo: 0, kassir: 'Ali', qarz: 0 },
        { id: 2, sana: '2025-07-02', vaqt: '09:30:00', ismFam: 'Nigora Rahimova', tel: '+998901112233', qayerdan: 'Samarqand', naqd: 300000, karta: 0, click: 0, humo: 0, kassir: 'Ali', qarz: 0 },
        { id: 2, sana: '2025-07-02', vaqt: '09:30:00', ismFam: 'Nigora Rahimova', tel: '+998901112233', qayerdan: 'Samarqand', naqd: 300000, karta: 0, click: 0, humo: 0, kassir: 'Ali', qarz: 0 },
        { id: 2, sana: '2025-07-02', vaqt: '09:30:00', ismFam: 'Nigora Rahimova', tel: '+998901112233', qayerdan: 'Samarqand', naqd: 300000, karta: 0, click: 0, humo: 0, kassir: 'Ali', qarz: 0 }
      ],

      // Modal va form boshqaruvi
      showKirimModal: false,
      showChiqimModal: false,
      form: { sana: '', soat: '', kimdan: '', naqd: 0, karta: 0, click: 0, humo: 0, izoh: '' },
      currentKassir: 'Ali',

      // Bemor to'lov modal
      showPaymentModal: false,
      selectedBemor: null,
      paymentForm: { tur: 'kirim', naqd: 0, karta: 0, click: 0, humo: 0 }
    };
  },
  computed: {
    todayDate() {
      return new Date().toISOString().slice(0, 10);
    },
    todayTime() {
      return new Date().toTimeString().slice(0, 8);
    },
    // Kirimlarni filterlash
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
      const total = arr.reduce((sum, i) => sum + (i.naqd||0) + (i.karta||0) + (i.click||0) + (i.humo||0), 0);
      return { count, total };
    },
    // Chiqimlarni filterlash
    filteredChiqimlar() {
      return this.chiqimlar.filter(item => {
        const s = this.startDate ? item.sana >= this.startDate : true;
        const e = this.endDate ? item.sana <= this.endDate : true;
        const f = this.filterKimga ? item.qayerga.toLowerCase().includes(this.filterKimga.toLowerCase()) : true;
        return s && e && f;
      });
    },
    summaryData() {
      if (!this.filterKimga) return [];
      const map = {};
      this.filteredChiqimlar.forEach(i => {
        if (!map[i.qayerga]) map[i.qayerga] = { kimdan: i.qayerga, count: 0, total: 0 };
        map[i.qayerga].count++;
        map[i.qayerga].total += (i.naqd||0) + (i.karta||0) + (i.click||0) + (i.humo||0);
      });
      return Object.values(map);
    },
    // Bemorlar
    qarzdorlar() { return this.bemorlar.filter(b => b.qarz > 0); },
    qarzsizlar() { return this.bemorlar.filter(b => b.qarz === 0); },
    // Statistika
    todayKirim() { return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s,k)=>s+(k.naqd||0)+(k.karta||0)+(k.click||0),0); },
    todayNaqdKirim() { return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s,k)=>s+(k.naqd||0),0); },
    todayKartaKirim() { return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s,k)=>s+(k.karta||0),0); },
    todayClickKirim() { return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s,k)=>s+(k.click||0),0); },
    todayChiqim() { return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s,c)=>s+(c.naqd||0)+(c.karta||0)+(c.click||0),0); },
    todayNaqdChiqim() { return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s,c)=>s+(c.naqd||0),0); },
    todayKartaChiqim() { return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s,c)=>s+(c.karta||0),0); },
    todayClickChiqim() { return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s,c)=>s+(c.click||0),0); },
    totalQarz() { return this.bemorlar.reduce((s,b)=>s+(b.qarz||0),0); },
    qarzQoshildi() { return this.kirimlar.filter(k => k.sana === this.todayDate).reduce((s,k)=>s+(k.naqd||0),0); },
    tolandiSumma() { return this.chiqimlar.filter(c => c.sana === this.todayDate).reduce((s,c)=>s+(c.naqd||0),0); }
  },
  methods: {
    showStat() { this.currentView = 'stat'; },
    showKirim() { this.currentView = 'kirim'; },
    showChiqim() { this.currentView = 'chiqim'; },
    showBemorlar() { this.currentView = 'bemorlar'; },
    openAddModal() {
      if (this.currentView === 'kirim') this.showKirimModal = true;
      else if (this.currentView === 'chiqim') this.showChiqimModal = true;
      this.form.sana = this.todayDate;
      this.form.soat = this.todayTime;
      this.form.kimdan = '';
      this.form.naqd = this.form.karta = this.form.click = this.form.humo = 0;
      this.form.izoh = '';
    },
    closeModal() {
      this.showKirimModal = this.showChiqimModal = false;
    },
    addKimdan() {
      const v = this.newKimdan.trim();
      if (v && !this.optionsKimdan.includes(v)) {
        this.optionsKimdan.push(v);
        this.newKimdan = '';
      }
    },
    removeKimdan(i) { this.optionsKimdan.splice(i,1); },
    saveKirim() {
      this.kirimlar.push({
        id: Date.now(),
        sana: this.form.sana,
        soat: this.form.soat,
        kimdan: this.form.kimdan,
        naqd: this.form.naqd,
        karta: this.form.karta,
        click: this.form.click,
        humo: this.form.humo,
        kassir: this.currentKassir,
        izoh: this.form.izoh
      });
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
    openPaymentModal(b) { this.selectedBemor = b; this.showPaymentModal = true; },
    closePaymentModal() { this.showPaymentModal = false; this.paymentForm = { tur: 'kirim', naqd:0, karta:0, click:0, humo:0}; }
  }
};
</script>




<style scoped>
/* Asosiy konteyner */
.section {
  max-width: 1200px;
  margin: 20px 20px 20px 290px;
  padding: 20px;
  background: #f9f9ff;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0,0,0,0.05);
  font-family: "Segoe UI", sans-serif;
}

/* Navigatsiya tugmalari */
.top-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.top-navigation button {
  padding: 10px 16px;
  background-color: #e0e0f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}
.top-navigation button.active,
.top-navigation button:hover {
  background-color: #3c5eff;
  color: #fff;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}
.header h3 {
  margin: 0;
}

/* Jadval */
.kirim-table, .bemor-table, .summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.kirim-table th, .kirim-table td,
.bemor-table th, .bemor-table td,
.summary-table th, .summary-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
.kirim-table th, .bemor-table th {
  background-color: #f0f4ff;
}
.kirim-table tbody tr:hover,
.bemor-table tbody tr:hover {
  background-color: #f9fbff;
}

/* Filterlar */
.date-range, .filter-by-person {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-range input,
.filter-by-person input {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

/* Qo‘shish tugmasi */
.add-btn {
  padding: 8px 14px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.add-btn:hover {
  background-color: #45a049;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal1 {
  background: white;
  padding: 25px 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
}
.modal1 h3 {
  margin-top: 0;
  color: #333;
}
.modal1 .form-group,
.modal1 label,
.modal1 input,
.modal1 textarea,
.modal1 select {
  width: 100%;
  margin-bottom: 10px;
}
.modal1 input,
.modal1 textarea,
.modal1 select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.modal1 textarea {
  resize: vertical;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* Saqlash va bekor tugmalari */
.save-btn {
  background-color: #3c5eff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.save-btn:hover {
  background-color: #2c3ed9;
}
.cancel-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.cancel-btn:hover {
  background-color: #d9322c;
}

/* Qarzga qizil rang */
.qarzdor-row td:nth-child(5) {
  font-weight: bold;
}
.qarzdor-row:hover {
  background-color: #fff0f0;
}

/* Select va option list */
.select-group-vertical {
  margin-bottom: 10px;
}
.select-group {
  display: flex;
  gap: 5px;
}
.option-list ul {
  padding: 0;
  margin: 5px 0;
  list-style: none;
}
.option-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f3f3;
  padding: 6px 10px;
  border-radius: 5px;
  margin-bottom: 5px;
}
.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 4px 6px;
  cursor: pointer;
}

/* Responsiv dizayn */
@media (max-width: 768px) {
  .header,
  .date-range,
  .filter-by-person {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal1 {
    padding: 20px;
  }

  .top-navigation {
    flex-direction: column;
    gap: 8px;
  }

  .kirim-table th,
  .kirim-table td {
    font-size: 14px;
    padding: 8px;
  }
}
</style>
