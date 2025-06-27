<template>
<SuperAdminsidebar></SuperAdminsidebar>
<Navbar></Navbar>
<router-view></router-view>
  
</template>

<script>
import SuperAdminsidebar from '@/components/SuperAdminsidebar.vue';
import Navbar from '@/components/Navbar.vue';
import { BarChart, LineChart } from 'vue-chart-3'

export default {
  components: {
    BarChart,
    LineChart,
    Navbar,
    SuperAdminsidebar
  },
  data() {
    return {
      todayPatients: 12,
      weeklyPatients: 80,
      monthlyUsers: 310,
      weeklyServices: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'],
        datasets: [
          {
            label: 'Xizmatlar',
            data: [10, 14, 9, 13, 15, 18, 11],
            backgroundColor: '#4e73df'
          }
        ]
      },
      monthlyUsersChart: {
        labels: ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun'],
        datasets: [
          {
            label: 'Foydalanuvchilar',
            data: [100, 120, 150, 170, 180, 210],
            borderColor: '#36b9cc',
            backgroundColor: 'rgba(54, 185, 204, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 270px;
  padding: 20px;
}

.dashboard h1 {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 24px;
}

/* Statistik kartalar */
.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-width: 220px;
  text-align: center;
}

.stat-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #555;
}

.stat-card p {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

/* Grafiklar */
.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.chart-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  flex: 1 1 350px;
  min-width: 300px;
  text-align: center;
}
</style> 
 