<template>
  <div class="register-container">
    <h2>Ro'yxatdan O'tkazish</h2>
    <form @submit.prevent="registerClient" class="form">
      <!-- F.I.Sh -->
      <div class="form-group">
        <label>Familiya, Ism, Sharif</label>
        <div class="ismfamilya">
          <input v-model="form.familiya" placeholder="Familiya" required />
          <input v-model="form.ism" placeholder="Ism" required />
          <input v-model="form.sharif" placeholder="Sharif (otasining ismi)" required />
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
          <label>Pasport</label>
          <input v-model="form.pasport" placeholder="AA1234567" pattern="[A-Z]{2}[0-9]{7}" required />
        </div>
        <div class="form-group">
          <label>Tug‘ilgan sana</label>
          <input v-model="form.tugulgan_sana" type="date" required />
        </div>
      </div>

      <!-- Viloyat -->
      <div class="form-group">
        <label>Viloyat</label>
        <template v-if="form.davlat === 'O‘zbekiston'">
          <select v-model="form.viloyat" required>
            <option disabled value="">Tanlang</option>
            <option v-for="v in viloyatlar" :key="v" :value="v">{{ v }}</option>
          </select>
        </template>
        <template v-else-if="form.davlat === 'Xorijiy'">
          <input v-model="form.viloyat" placeholder="Viloyatni kiriting" required />
        </template>
      </div>

     
      <!-- Telefon -->
      <div class="form-group">
        <label>Telefon raqamlari</label>
        <div class="ismfamilya">
          <input v-model="form.tel1" type="tel" placeholder="Asosiy: +998901234567" required />
          <input v-model="form.tel2" type="tel" placeholder="Qo‘shimcha: +998901234568" />
        </div>
      </div>

      <!-- Uy manzili -->
      <div class="form-group">
        <label>Uy manzili</label>
        <input v-model="form.manzil" placeholder="Manzilni kiriting" required />
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

      <!-- Parhez -->
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
      viloyatlar: [
        'Toshkent', 'Andijon', 'Farg‘ona', 'Namangan', 'Samarqand', 'Buxoro',
        'Xorazm', 'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo', 'Navoiy',
        'Qoraqalpog‘iston Respublikasi'
      ],
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
        parhez: '',
        create_user_id: null,
        create_user_name: '',
      },
    };
  },

  mounted() {
    this.fetchCurrentUser();
  },

  methods: {
    async fetchCurrentUser() {
      try {
        const res = await api.get('/api/v1/user_data');
        const user = res.data?.user || res.data;
        if (user?.id && user?.name) {
          this.form.create_user_id = user.id;
          this.form.create_user_name = user.name;
        }
      } catch (err) {
        console.error('Foydalanuvchi maʼlumotlari olinmadi:', err);
      }
    },

    async registerClient() {
      try {
        const res = await api.post('/api/v1/clients', this.form);
        const client = res.data?.data;
        if (!client?.id) {
          alert('Ro‘yxatdan o‘tishda ID topilmadi!');
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
          console.error('Ro‘yxatdan o‘tishda xato:', err);
          alert('❌ Server xatoligi yuz berdi!');
        }
      }
    },
  },
};
</script>
<style scoped>
/* Umumiy konteyner */
.register-container {
  max-width: 1200px;
  margin: 20px auto;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
}

/* Sarlavha */
h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #111827;
  font-weight: 700;
}

/* Forma guruhi */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 15px;
  color: #374151;
}

/* 3ta yonma-yon input (F.I.SH va telefon) */
.ismfamilya {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ismfamilya input {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background-color: #f9fafb;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

/* Boshqa input va selectlar */
input[type="text"],
input[type="tel"],
input[type="date"],
select {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background-color: #f9fafb;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background-color: #ffffff;
}

/* Pasport va Tug‘ilgan sana bir qatorda */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

/* Uy manzili inputi */
input[v-model="form.manzil"] {
  background-color: #fefefe;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

/* Submit tugmasi */
button[type="submit"] {
  width: 100%;
  padding: 14px;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #1e40af;
}
</style>
