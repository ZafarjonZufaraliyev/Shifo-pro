<template>
  <div class="container">
    <h2 class="title">To‘lov qo‘shish</h2>

    <!-- To‘lov turi -->
    <div class="form-group">
      <label class="label">To‘lov turi:</label>
      <select v-model="form.type" class="input">
        <option value="kirim">Kirim</option>
        <option value="chiqim">Chiqim</option>
      </select>
    </div>

    <!-- Kimdan: Bemor yoki Tashqi -->
    <div class="form-group">
      <label class="label">Kimdan:</label>
      <select v-model="form.from" class="input">
        <option value="bemor-kassa">Bemor</option>
        <option value="tashqi">Tashqi</option>
      </select>
    </div>

    <!-- Tashqi uchun joy qo'shish va ro'yxat -->
    <div v-if="form.from === 'tashqi'" class="form-group">
      <label class="label">Qayerga (tashqi joylar):</label>

      <!-- Input va + tugma -->
      <div class="input-add-row">
        <input
          v-model="newTashqi"
          type="text"
          placeholder="Yangi joy nomi"
          class="input"
          @keyup.enter="addTashqi"
        />
        <button type="button" class="btn-add" @click="addTashqi">+</button>
      </div>

      <!-- Qo'shilgan tashqi joylar ro'yxati (filterlangan) -->
      <ul class="tashqi-list" v-if="filteredTashqiOptions.length > 0">
        <li v-for="(item, idx) in filteredTashqiOptions" :key="idx">
          {{ item }}
          <button type="button" class="btn-remove" @click="removeTashqi(idx)">-</button>
        </li>
      </ul>
      <p v-else class="no-results">Joylar topilmadi</p>

      <!-- Select tashqi joylar orasidan tanlash -->
      <select v-model="form.fromDetail" class="input">
        <option value="">-- Tanlang --</option>
        <option v-for="(item, idx) in tashqiOptions" :key="'select-'+idx" :value="item">{{ item }}</option>
      </select>
    </div>

    <!-- Bemor tanlash -->
    <div class="form-group" v-if="form.from === 'bemor-kassa'">
      <label class="label">Bemor:</label>
      <select v-model="selectedClientId" @change="onClientChange" class="input">
        <option value="" disabled>-- Bemorni tanlang --</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.familiya }} {{ client.ism }} {{ client.sharif }}
        </option>
      </select>
    </div>

    <!-- Bemor ma'lumotlari -->
    <div v-if="client" class="info">
      <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }} {{ client.sharif }}</p>
      <p><strong>Telefon:</strong> {{ client.tel1 }}</p>
    </div>

    <!-- To‘lov summasi -->
    <form @submit.prevent="submitPayment">
      <div class="form-row">
        <input v-model.number="form.cash" type="number" placeholder="Naqd" class="input" />
        <input v-model.number="form.card" type="number" placeholder="Karta" class="input" />
      </div>
      <div class="form-row">
        <input v-model.number="form.click" type="number" placeholder="Click" class="input" />
        <input v-model.number="form.humo" type="number" placeholder="Humo" class="input" />
      </div>

      <!-- Izoh (Avtomatik) -->
      <textarea v-model="form.note" class="textarea" readonly></textarea>

      <button
        type="submit"
        class="btn"
        :disabled="
          (form.from === 'bemor-kassa' && !selectedClientId) ||
          (form.from === 'tashqi' && !form.fromDetail)
        "
      >
        Saqlash
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

const clients = ref([]);
const selectedClientId = ref("");
const client = ref(null);
const davolanishId = ref(null);

const form = ref({
  cash: 0,
  card: 0,
  click: 0,
  humo: 0,
  note: "",
  type: "kirim",
  from: "bemor-kassa",
  fromDetail: "", // tashqi joy nomi
  is_patient_payment: 1,
  user_id: null,
  cashier: "",
});

// LocalStorage uchun tashqi joylar
const tashqiOptions = ref([]);
const newTashqi = ref("");

// LocalStorage'dan o'qish
const loadTashqiOptions = () => {
  const data = localStorage.getItem("tashqiOptions");
  if (data) {
    try {
      tashqiOptions.value = JSON.parse(data);
    } catch {
      tashqiOptions.value = [];
    }
  } else {
    tashqiOptions.value = [];
  }
};

// LocalStorage'ga yozish
const saveTashqiOptions = () => {
  localStorage.setItem("tashqiOptions", JSON.stringify(tashqiOptions.value));
};

// Qo'shish funksiyasi
const addTashqi = () => {
  const val = newTashqi.value.trim();
  if (val && !tashqiOptions.value.includes(val)) {
    tashqiOptions.value.push(val);
    saveTashqiOptions();
    newTashqi.value = "";
  }
};

// O'chirish funksiyasi
const removeTashqi = (index) => {
  tashqiOptions.value.splice(index, 1);
  saveTashqiOptions();
};

// Yangi joy inputiga mos keladiganlarni filterlash (faqat inputga mos kelgan joylar ko‘rsin)
const filteredTashqiOptions = computed(() => {
  const search = newTashqi.value.trim().toLowerCase();
  if (!search) {
    return [];
  }
  return tashqiOptions.value.filter((item) =>
    item.toLowerCase().includes(search)
  );
});

const fetchClients = async () => {
  try {
    const res = await api.get("/api/v1/clients");
    clients.value = res.data || [];
  } catch (e) {
    console.error("Bemorlar ro‘yxatini olishda xatolik:", e);
  }
};

const fetchClientById = async (id) => {
  try {
    const res = await api.get(`/api/v1/clients/${id}`);
    client.value = res.data;
  } catch (e) {
    client.value = null;
  }
};

const fetchDavolanishId = async (clientId) => {
  try {
    const res = await api.get(`/api/v1/davolanish?client_id=${clientId}`);
    davolanishId.value = res.data.length ? res.data[0].id : null;
  } catch {
    davolanishId.value = null;
  }
};

const onClientChange = async () => {
  if (!selectedClientId.value) {
    client.value = null;
    davolanishId.value = null;
    return;
  }

  await fetchClientById(selectedClientId.value);
  await fetchDavolanishId(selectedClientId.value);

  form.value.user_id = client.value?.create_user_id || null;
  form.value.cashier = "";
  form.value.note = `Bemor to'lovi: ${client.value.familiya} ${client.value.ism} ${client.value.sharif}`;
};

// Formdagi izohni avtomatik yangilash
watch(
  () => [form.value.type, form.value.from, form.value.fromDetail, selectedClientId.value],
  () => {
    if (form.value.from === "bemor-kassa" && client.value) {
      form.value.note = `Bemor to'lovi: ${client.value.familiya} ${client.value.ism} ${client.value.sharif}`;
    } else if (form.value.from === "tashqi" && form.value.fromDetail) {
      form.value.note = `Tashqi to'lov: ${form.value.fromDetail}`;
    } else {
      form.value.note = "";
    }
  }
);

const submitPayment = async () => {
  try {
    form.value.is_patient_payment = form.value.from === "bemor-kassa" ? 1 : 0;

    const payload = {
      ...form.value,
      client_id: form.value.from === "bemor-kassa" ? selectedClientId.value : null,
      davolanish_id: form.value.from === "bemor-kassa" ? davolanishId.value : null,
      from: form.value.from === "tashqi" ? form.value.fromDetail : form.value.from,
      datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    await api.post("/api/v1/payments", payload);
    alert("To‘lov muvaffaqiyatli qo‘shildi");
    router.push("/admin/kassaFilter");
  } catch (e) {
    alert("Xatolik: to‘lov yuborilmadi");
    console.error(e);
  }
};

onMounted(() => {
  fetchClients();
  loadTashqiOptions();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: bold;
}
.label {
  font-weight: bold;
  margin-bottom: 6px;
  display: block;
}
.input {
  padding: 8px;
  width: 100%;
  margin-top: 4px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 16px;
  resize: none;
}
.form-group {
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.btn {
  background-color: #28a745;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.info {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* Tashqi joy qo'shish qismi */
.input-add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.btn-add,
.btn-remove {
  background-color: #007bff;
  border: none;
  color: white;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.btn-remove {
  background-color: #dc3545;
  margin-left: 8px;
}
.tashqi-list {
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 12px;
}
.tashqi-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #eee;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
}
.no-results {
  font-style: italic;
  color: #666;
}
</style>
