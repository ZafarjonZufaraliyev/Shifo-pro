<template>
  <table class="patients-table">
    <thead>
      <tr>
        <th>Ism Familiya</th>
        <th>Telefon</th>
        <th>Keldi</th>
        <th>Ketdi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="patient in patients" :key="patient.id">
        <td data-label="Ism Familiya">{{ patient.firstName }} {{ patient.lastName }}</td>
        <td data-label="Telefon">{{ patient.phone }}</td>
        <td data-label="Keldi">{{ formatDate(patient.arrivalDate) }}</td>
        <td data-label="Ketdi">{{ formatDate(patient.departureDate) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>

export default {
  name: "PatientTable",
  props: {
    patients: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.patients-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.patients-table thead tr {
  background-color: #4a90e2;
  color: white;
  text-align: left;
  font-weight: 600;
  font-size: 16px;
}

.patients-table thead th {
  padding: 14px 20px;
  user-select: none;
}

.patients-table tbody tr {
  background-color: #f9faff;
  transition: background-color 0.3s ease;
  cursor: default;
  border-radius: 8px;
}

.patients-table tbody tr:hover {
  background-color: #e4f0fd;
}

.patients-table tbody td {
  padding: 14px 20px;
  vertical-align: middle;
  border-left: 1px solid #d9e3f0;
  font-size: 15px;
}

.patients-table tbody td:first-child {
  font-weight: 600;
  color: #34495e;
  border-left: none;
}

/* Responsive: kichik ekranlarda jadvalni blokka aylantirish */
@media (max-width: 600px) {
  .patients-table, 
  .patients-table thead, 
  .patients-table tbody, 
  .patients-table th, 
  .patients-table td, 
  .patients-table tr {
    display: block;
  }

  .patients-table thead tr {
    display: none;
  }

  .patients-table tbody tr {
    margin-bottom: 20px;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 12px;
  }

  .patients-table tbody td {
    padding-left: 50%;
    position: relative;
    text-align: left;
    border-left: none;
    border-bottom: 1px solid #eee;
  }

  .patients-table tbody td::before {
    content: attr(data-label);
    position: absolute;
    left: 20px;
    top: 14px;
    font-weight: 600;
    color: #34495e;
  }

  .patients-table tbody td:last-child {
    border-bottom: 0;
  }
}
</style>
