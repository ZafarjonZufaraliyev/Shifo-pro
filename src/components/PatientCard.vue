<template>
  <div class="patient-card">
    <div class="card__header">
      <h3>{{ patient.familiya }} {{ patient.ism }}</h3>
      <span>{{ patient.tugulgan_sana }} yosh | {{ patient.gender }}</span>
    </div>

    <div class="card__body">
      <p><strong>📞 Telefon:</strong> {{ patient.tel1 || '—' }}</p>
      <p><strong>📅 Keldi:</strong> {{ formatDate(patient.arrivalDate) }}</p>
      <p><strong>📤 Ketdi:</strong> {{ formatDate(patient.departureDate) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    patient: Object
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
.patient-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin: 16px;
  width: 100%;
  max-width: 380px;
  transition: transform 0.2s ease;
}

.patient-card:hover {
  transform: translateY(-4px);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.card__header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.card__header span {
  font-size: 14px;
  color: #7f8c8d;
}

.card__body p {
  font-size: 15px;
  margin: 6px 0;
  color: #34495e;
}

.card__body strong {
  font-weight: 600;
  color: #2d3436;
}

/* Responsive: wrap cards in grid */
@media (min-width: 768px) {
  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
  }
}
</style>
