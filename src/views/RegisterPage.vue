<template>
  <div class="register-container">
    <h2>Ro'yxatdan O'tkazish</h2>
    <form @submit.prevent="registerClient" class="form">
      <!-- Familiya, Ism, Sharif -->
      <div class="form-group">
        <label>Familiya, Ism, Sharif</label>
        <div class="ismfamilya">
          <input v-model="form.familiya" type="text" placeholder="Familiya" required />
          <input v-model="form.ism" type="text" placeholder="Ism" required />
          <input v-model="form.sharif" type="text" placeholder="Sharif (otasining ismi)" required />
        </div>
      </div>

      <!-- Fuqarolik -->
      <div class="form-group">
        <label>Fuqaroligi</label>
        <select v-model="form.davlat" required>
          <option disabled value="">Tanlang</option>
          <option>O‘zbekiston</option>
          <option>Xorijiy</option>
        </select>
      </div>

      <!-- Pasport va Tug‘ilgan sana -->
      <div class="form-row">
        <div class="form-group">
          <label>Pasport seriyasi va raqami</label>
          <input v-model="form.pasport" type="text" placeholder="AA1234567" pattern="[A-Z]{2}[0-9]{7}" required />
        </div>
        <div class="form-group">
          <label>Tug‘ilgan sana</label>
          <input v-model="form.tugulgan_sana" type="date" required />
        </div>
      </div>

      <!-- Viloyat -->
      <div v-if="form.davlat === 'O‘zbekiston'" class="form-group">
        <label>Viloyat</label>
        <select v-model="form.viloyat" required>
          <option disabled value="">Tanlang</option>
          <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat.name">{{ viloyat.name }}</option>
        </select>
      </div>
      <div v-else-if="form.davlat === 'Xorijiy'" class="form-group">
        <label>Viloyat (yozma)</label>
        <input v-model="form.viloyat" type="text" placeholder="Viloyatni kiriting" required />
      </div>

      <!-- Tuman -->
      <div v-if="form.davlat" class="form-group">
        <label>Tuman (yozma)</label>
        <input v-model="form.tuman" type="text" placeholder="Tuman nomini kiriting" required />
      </div>

      <!-- Telefonlar -->
      <div class="form-group">
        <label>Telefon raqamlari</label>
        <div class="ismfamilya">
          <input v-model="form.tel1" type="tel" placeholder="Asosiy: +998901234567" 
            required />
          <input v-model="form.tel2" type="tel" placeholder="Qo‘shimcha: +998901234568" />
        </div>
      </div>

      <!-- Uy manzili -->
      <div class="form-group">
        <label>Uy manzili</label>
        <input v-model="form.manzil" type="text" placeholder="Manzilni kiriting" required />
      </div>

      <!-- Qayerdan eshitgan -->
      <div class="form-group">
        <label>Biz haqimizda qayerdan eshitdingiz?</label>
        <select v-model="form.referral" required>
          <option disabled value="">Tanlang</option>
          <option>Do‘stdan</option>
          <option>Reklama</option>
          <option>Ijtimoiy tarmoq</option>
          <option>Vrach tavsiyasi</option>
          <option>Boshqa</option>
        </select>
      </div>

      <!-- Parhez (ixtiyoriy) -->
      <div class="form-group">
        <label>Parhez (ixtiyoriy)</label>
        <select v-model="form.parhez">
          <option disabled value="">Tanlang</option>
          <option>Diabetik</option>
          <option>Allergik</option>
          <option>Davleniya</option>
        </select>
      </div>

      <button type="submit">Yuborish</button>
    </form>
  </div>
</template>

<script>
import api from '@/api';
export default {
  name: 'RegisterPage',
  data() {
    return {
      viloyatlar: [],
      form: {
        familiya: '',
        ism: '',
        sharif: '',
        davlat: '',
        pasport: '',
        tugulgan_sana: '',
        viloyat: '',
        tuman: '',
        manzil: '',
        tel1: '',
        tel2: '',
        referral: '',
        parhez: '', // <- qo‘shildi
        create_user_id: null,
        create_user_name: '',
      },
    };
  },
  watch: {
    'form.davlat'(val) {
      if (val === 'O‘zbekiston') {
        this.loadViloyatlar();
      } else {
        this.viloyatlar = [];
        this.form.viloyat = '';
      }
    },
  },
  mounted() {
    this.fetchCurrentUser();
  },
  methods: {
    async loadViloyatlar() {
      try {
        const res = await fetch(
          'https://thingproxy.freeboard.io/fetch/https://uzbekistan-regions.vercel.app/api/regions'
        );
        this.viloyatlar = await res.json();
      } catch (err) {
        console.error('Viloyatlarni yuklashda xatolik:', err);
      }
    },
    async fetchCurrentUser() {
      try {
        const res = await api.get('/api/v1/user_data');
        const user = res.data?.user || res.data;
        if (user?.id && user?.name) {
          this.form.create_user_id = user.id;
          this.form.create_user_name = user.name;
        }
      } catch (err) {
        console.error('Foydalanuvchini olishda xatolik:', err);
      }
    },
    async registerClient() {
      try {
        const res = await api.post('/api/v1/clients', this.form);
        const client = res.data?.data;
        if (!client?.id) {
          alert('Ro‘yxatdan o‘tishda mijoz ID topilmadi!');
          return;
        }
        this.$router.push({ name: 'adminTakliflar', params: { clientId: client.id } });
      } catch (err) {
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          let msg = '❗ Xatoliklar:\n';
          for (let key in errors) {
            msg += `- ${key}: ${errors[key].join(', ')}\n`;
          }
          alert(msg);
        } else {
          console.error(err);
          alert('❌ Ro‘yxatdan o‘tishda server xatoligi yuz berdi!');
        }
      }
    },
  },
};
</script>

<style scoped>
/***** Stil fayli o‘zgarishsiz qoldirildi *****/
.register-container {
  max-width: 1200px;
  margin: 20px auto;
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #111827
}

.form-group {
  margin-bottom: 18px
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151
}

.ismfamilya {
  display: flex;
  gap: 10px
}

.ismfamilya input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 15px
}

input[type=text],
input[type=tel],
input[type=date],
select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 15px
}

button[type=submit] {
  width: 100%;
  padding: 14px;
  background-color: #2563eb;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color .3s
}

button[type=submit]:hover {
  background-color: #1e40af
}








.register-container {
  max-width: 1200px;
  margin: 20px auto;
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #111827;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
}

.ismfamilya input {
  width: calc(33% - 10px);
  margin-right: 15px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 15px;
}

.ismfamilya input:last-child {
  margin-right: 0;
}

input[type="text"],
input[type="tel"],
input[type="date"],
select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 15px;
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background-color: #2563eb;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #1e40af;
}
</style>
