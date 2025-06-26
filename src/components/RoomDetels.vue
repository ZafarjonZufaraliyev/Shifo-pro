<template>
  <div class="room-details">
    <h2 class="title">Xona haqida ma'lumot</h2>

    <div v-if="room" class="info-wrapper">

      <!-- Qabulxonaga ogohlantirish: navbatdagi mehmon bugun kelishi -->
      <div v-if="showArrivalTodayAlert" class="notification alert-booking">
        Diqqat! <strong>{{ nextBooking.name }}</strong> ismli mijoz bugun <strong>{{ today }}</strong> kuni kelishi kerak!
        Iltimos, unga telefon qiling: <strong>{{ nextBooking.phone }}</strong>
      </div>

      <!-- Hozirgi mehmon -->
      <div v-if="currentBooking" class="info-block current-guest">
        <h3 class="section-title">Hozirgi mehmon</h3>
        <p><strong>Ismi:</strong> {{ currentBooking.name }}</p>
        <p><strong>Telefon:</strong> {{ currentBooking.phone }}</p>
        <p><strong>Kelgan sana:</strong> {{ currentBooking.arrival }}</p>
        <p><strong>Ketadigan sana:</strong> {{ currentBooking.departure }}</p>
      </div>

      <!-- Navbatdagi mehmon -->
      <div v-if="nextBooking" class="info-block next-guest">
        <h3 class="section-title">Navbatdagi mehmon</h3>
        <p><strong>Ismi:</strong> {{ nextBooking.name }}</p>
        <p><strong>Telefon:</strong> {{ nextBooking.phone }}</p>
        <p><strong>Kelish sanasi:</strong> {{ nextBooking.arrival }}</p>
        <p><strong>Ketish sanasi:</strong> {{ nextBooking.departure }}</p>
      </div>

      <!-- Xona tafsilotlari -->
      <div class="info-block">
        <h3 class="section-title">Xona tafsilotlari</h3>
        <p><strong>Raqami:</strong> {{ room.number }}</p>
        <p><strong>Turi:</strong> {{ room.type }}</p>
        <p><strong>Narxi:</strong> {{ formatPrice(room.price) }}</p>
        <p><strong>Joylashuvi:</strong> {{ room.floor }}</p>
        <p><strong>Sig‘imi:</strong> {{ room.capacity }} kishi</p>
        <p><strong>Holati:</strong>
          <span :class="['badge', isRoomFreeToday ? 'free' : 'busy']">
            {{ isRoomFreeToday ? 'Bo‘sh' : 'Band' }}
          </span>
        </p>
      </div>

      <!-- Band qilish formasi -->
      <div class="form-block">
        <h3 class="section-title">Yangi band qilish</h3>

        <form @submit.prevent="assignGuest" novalidate>
          <input
            v-model.trim="guest.name"
            type="text"
            placeholder="Ism Familiya"
            :class="{ invalid: errors.name }"
            required
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>

          <input
            v-model.trim="guest.phone"
            type="tel"
            placeholder="Telefon raqam (+998901234567)"
            pattern="^\+998\d{9}$"
            :class="{ invalid: errors.phone }"
            required
          />
          <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>

          <label for="arrival">Kelish sanasi:</label>
          <input
            v-model="guest.arrival"
            type="date"
            id="arrival"
            :min="today"
            :class="{ invalid: errors.arrival }"
            required
          />
          <span v-if="errors.arrival" class="error-msg">{{ errors.arrival }}</span>

          <label for="departure">Ketish sanasi:</label>
          <input
            v-model="guest.departure"
            type="date"
            id="departure"
            :min="guest.arrival || today"
            :class="{ invalid: errors.departure }"
            required
          />
          <span v-if="errors.departure" class="error-msg">{{ errors.departure }}</span>

          <button type="submit">Band qilish</button>

          <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
        </form>
      </div>
    </div>

    <router-link to="/" class="back-link">Orqaga qaytish</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      room: null,
      guest: {
        name: '',
        phone: '',
        arrival: '',
        departure: ''
      },
      errors: {},
      formError: '',
      successMessage: ''
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    currentBooking() {
      return this.room?.bookings.find(
        b => b.arrival <= this.today && b.departure >= this.today
      ) || null;
    },
    nextBooking() {
      return this.room?.bookings
        .filter(b => b.arrival > this.today)
        .sort((a, b) => new Date(a.arrival) - new Date(b.arrival))[0] || null;
    },
    isRoomFreeToday() {
      return !this.room?.bookings.some(
        b => b.arrival <= this.today && b.departure >= this.today
      );
    },
    showArrivalTodayAlert() {
      return this.nextBooking?.arrival === this.today;
    }
  },
  created() {
    const allRooms = [
      {
        id: 1,
        number: 107,
        type: 'LUX',
        price: 250000,
        floor: '2-qavat',
        capacity: 2,
        bookings: [
          {
            name: 'Azimjon Jo‘rayev',
            phone: '+998901234567',
            arrival: '2025-06-24',
            departure: '2025-06-29'
          },
          {
            name: 'Navbatdagi Mehmon',
            phone: '+998912345678',
            arrival: '2025-06-30',
            departure: '2025-07-05'
          }
        ]
      }
    ];

    const roomId = this.$route.params.id;
    this.room = allRooms.find(r => r.id == roomId);
  },
  methods: {
    assignGuest() {
      this.clearMessages();

      if (!this.validateForm()) return;

      // Sana oralig‘ida bandlik tekshiruvi
      const overlap = this.room.bookings.some(b =>
        this.dateOverlap(this.guest.arrival, this.guest.departure, b.arrival, b.departure)
      );
      if (overlap) {
        this.formError = 'Ushbu sana oralig‘ida xona allaqachon band qilingan.';
        return;
      }

      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(this.guest.phone)) {
        this.errors.phone = 'Telefon raqam +998XXXXXXXXX formatida bo‘lishi kerak.';
        return;
      }

      this.room.bookings.push({ ...this.guest });
      this.successMessage = 'Xona muvaffaqiyatli band qilindi!';
      this.resetGuestForm();
    },
    validateForm() {
      this.errors = {};

      if (!this.guest.name) this.errors.name = "Ism Familiya kiritilishi shart.";
      if (!this.guest.phone) this.errors.phone = "Telefon raqam kiritilishi shart.";
      if (!this.guest.arrival) this.errors.arrival = "Kelish sanasi kiritilishi shart.";
      if (!this.guest.departure) this.errors.departure = "Ketish sanasi kiritilishi shart.";
      if (this.guest.arrival && this.guest.departure && this.guest.arrival > this.guest.departure) {
        this.errors.departure = "Ketish sanasi kelish sanasidan oldin bo‘lishi mumkin emas.";
      }

      return Object.keys(this.errors).length === 0;
    },
    clearMessages() {
      this.formError = '';
      this.successMessage = '';
      this.errors = {};
    },
    resetGuestForm() {
      this.guest = { name: '', phone: '', arrival: '', departure: '' };
    },
    dateOverlap(start1, end1, start2, end2) {
      return !(end1 < start2 || start1 > end2);
    },
    formatPrice(val) {
      return val.toLocaleString('uz-UZ') + ' soʻm';
    }
  }
};
</script>

<style scoped>
.room-details {
  max-width: 1200px;
  margin-left:270px;
  padding: 30px;
  background: #f9fcff;
  border-radius: 14px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #1a6291;
  margin-bottom: 30px;
}

.info-wrapper {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.info-block {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.07);
  flex: 1 1 320px;
  max-width: 400px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #1a6291;
  font-weight: 700;
  border-bottom: 2px solid #1a6291;
  padding-bottom: 6px;
}

p {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.free {
  background-color: #28a745;
}

.busy {
  background-color: #dc3545;
}

.notification.alert-booking {
  background-color: #fff3cd;
  color: #856404;
  border: 1.5px solid #856404;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 16px;
}

form input,
form label {
  width: 100%;
  font-size: 16px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

form input {
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: border-color 0.3s ease;
}

form input:focus {
  outline: none;
  border-color: #1a6291;
  box-shadow: 0 0 8px rgba(26, 98, 145, 0.4);
}

.invalid {
  border-color: #dc3545 !important;
}

.error-msg {
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 600;
}

.success-msg {
  color: #28a745;
  font-size: 15px;
  font-weight: 700;
  margin-top: 10px;
  text-align: center;
}

form button {
  width: 100%;
  padding: 14px 0;
  background-color: #1a6291;
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  margin-top: 10px;
}

form button:hover {
  background-color: #144d6d;
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  color: #1a6291;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  width: 100%;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 950px) {
  .info-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .info-block {
    max-width: 100%;
  }
}
</style>
