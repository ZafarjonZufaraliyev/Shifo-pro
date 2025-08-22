<template>
    <div class="container">
        <h2 class="title">
            📋 Bron qilinganlar ({{ roomName || 'Xona tanlanmagan' }})
        </h2>

        <!-- Bronlar jadvali -->
        <div v-if="bronlar.length" class="table-wrapper">
            <table class="bron-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Ism Familiya</th>
                        <th>Tel1</th>
                        <th>Kelish</th>
                        <th>Ketish</th>
                        <th>Price</th>
                        <th>Kim tamonidan</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in bronlar" :key="item.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.client_name }}</td>
                        <td>{{ item.tel1 || "0" }}</td>
                        <td>{{ formatShortDate(item.start) }}</td>
                        <td>{{ formatShortDate(item.end) }}</td>
                        <td>{{ item.price ?? 0 }}</td>
                        <td>{{ item.create_user_name || '—' }}</td>
                        <td>
                            <button class="btn edit" @click="openEditModal(item)">✏️ Tahrirlash</button>
                            <button class="btn delete" @click="deleteBron(item.id)">🗑️ O‘chirish</button>
                            <!-- Registr tugmasi -->
                            <button class="btn back" @click="goToPayment(item)">💰 Registr</button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>

        <p v-else class="no-data">
            ❌ Bu xonaga hozircha hech kim bron qilmagan.
        </p>

        <!-- Orqaga tugma -->
        <div class="back-btn-wrapper">
            <button class="btn back" @click="$router.back()">⬅️ Orqaga qaytish</button>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal">
                <h3>Tahrirlash: {{ editItem.client_name }}</h3>
                <label>Ism Familiya:</label>
                <input v-model="editItem.client_name" type="text" />

                <label>Tel1:</label>
                <input v-model="editItem.tel1" type="text" />

                <label>Kelish sanasi:</label>
                <input v-model="editItem.start" type="date" />

                <label>Ketish sanasi:</label>
                <input v-model="editItem.end" type="date" />

                <label>Status:</label>
                <select v-model="editItem.status">
                    <option value="to‘langan">To‘langan</option>
                    <option value="qarzdor">Qarzdor</option>
                </select>

                <label>Price:</label>
                <input v-model.number="editItem.price" type="number" />

                <div class="modal-buttons">
                    <button class="btn edit" @click="saveEdit">Saqlash</button>
                    <button class="btn back" @click="closeEditModal">Bekor qilish</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from "@/api";

export default {
    name: "BronTaxrir",
    props: {
        roomId: { type: [String, Number], required: true },
        selectedDate: { type: String, default: null },
    },
    data() {
        return {
            bronlar: [],
            roomName: "",
            showEditModal: false,
            editItem: null,
        };
    },
    methods: {
        goToPayment(item) {
        // item ma'lumotlarini query yoki state orqali yuborish mumkin
        // Agar faqat link kerak bo‘lsa:
        this.$router.push({
            path: '/admin/kassaTolovQoshish',
            query: { bronId: item.id } // kerak bo‘lsa item id yuborish
        });
    },
        formatShortDate(date) {
            if (!date) return "—";
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        },
        normalizeDate(date) {
            const d = new Date(date);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        },
        async loadBronlar() {
            try {
                const { data } = await api.get("/api/v1/bron");
                const allBronlar = Array.isArray(data) ? data : [];
                const selectedDate = this.selectedDate ? this.normalizeDate(this.selectedDate) : null;

                this.bronlar = allBronlar.filter((b) => {
                    const sameRoom = String(b.xona_id) === String(this.roomId);
                    if (!selectedDate) return sameRoom;
                    const start = this.normalizeDate(b.start);
                    const end = this.normalizeDate(b.end);
                    return sameRoom && selectedDate >= start && selectedDate < end;
                });

                this.roomName = `Xona ${this.roomId}`;
            } catch (err) {
                console.error(err);
            }
        },
        openEditModal(item) {
            this.editItem = { ...item }; // nusxa olib tahrirlash
            this.showEditModal = true;
        },
        closeEditModal() {
            this.showEditModal = false;
            this.editItem = null;
        },
        async saveEdit() {
            try {
                await api.put(`/api/v1/bron/${this.editItem.id}`, this.editItem);
                const index = this.bronlar.findIndex(b => b.id === this.editItem.id);
                if (index !== -1) this.bronlar.splice(index, 1, { ...this.editItem });
                this.closeEditModal();
                alert("✅ Ma'lumot muvaffaqiyatli yangilandi!");
            } catch (err) {
                console.error(err);
                alert("❌ Ma'lumotni saqlashda xatolik yuz berdi.");
            }
        },
        async deleteBron(id) {
            if (!confirm("⚠️ Haqiqatan ham o‘chirmoqchimisiz?")) return;
            try {
                await api.delete(`/api/v1/bron/${id}`);
                this.bronlar = this.bronlar.filter(b => b.id !== id);
                alert("✅ Bron muvaffaqiyatli o‘chirildi!");
            } catch (err) {
                console.error(err);
                alert("❌ Xatolik yuz berdi.");
            }
        },
    },
    mounted() {
        this.loadBronlar();
    },
};
</script>

<style scoped>
.container {
    padding: 20px;
    font-family: Arial, sans-serif;
}

.title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
}

.table-wrapper {
    overflow-x: auto;
}

.bron-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    border-radius: 8px;
}

.bron-table th,
.bron-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    text-align: left;
}

.bron-table thead {
    background-color: #f1f5f9;
}

.bron-table tbody tr:hover {
    background-color: #f0f4f8;
}

.paid {
    color: #16a34a;
    font-weight: bold;
}

.unpaid {
    color: #dc2626;
    font-weight: bold;
}

.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
    transition: 0.2s;
}

.btn.edit {
    background-color: #3b82f6;
    color: #fff;
}

.btn.edit:hover {
    background-color: #2563eb;
}

.btn.delete {
    background-color: #ef4444;
    color: #fff;
}

.btn.delete:hover {
    background-color: #b91c1c;
}

.btn.back {
    background-color: #6b7280;
    color: #fff;
    padding: 8px 16px;
    font-size: 14px;
}

.btn.back:hover {
    background-color: #4b5563;
}

.no-data {
    text-align: center;
    margin-top: 30px;
    color: #6b7280;
    font-size: 16px;
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal h3 {
    margin-bottom: 15px;
}

.modal label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
    font-size: 14px;
}

.modal input,
.modal select {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.modal-buttons {
    margin-top: 15px;
    text-align: right;
}
</style>
