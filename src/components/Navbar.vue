<template>
  <div class="layout">
    <SuperSidebar />
    <div class="content">
      <Navbar />
      <main class="dashboard">
        <h1>📊 Bosh sahifa statistikasi</h1>

        <div class="charts">
          <div class="chart-card">
            <h3>🧍 Bugungi yotgan bemorlar</h3>
            <PieChart :data="dailyOccupancy" />
          </div>

          <div class="chart-card">
            <h3>📅 Haftalik xizmatlar</h3>
            <BarChart :data="weeklyServices" />
          </div>

          <div class="chart-card">
            <h3>📈 Yillik foydalanuvchilar</h3>
            <LineChart :data="yearlyUsers" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import SuperSidebar from '@/components/SuperAdminsidebar.vue';
import Navbar from '@/components/Navbar.vue';
import { PieChart, BarChart, LineChart } from 'vue-chart-3';

export default {
  components: {
    SuperSidebar,
    Navbar,
    PieChart,
    BarChart,
    LineChart
  },
  data() {
    return {
      dailyOccupancy: {
        labels: ['Bo‘sh', 'Band'],
        datasets: [{
          data: [40, 60],
          backgroundColor: ['#00c49f', '#ff6384'],
        }]
      },
      weeklyServices: {
        labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
        datasets: [{
          label: 'Xizmatlar soni',
          data: [10, 15, 12, 18, 20, 25, 14],
          backgroundColor: '#4e73df'
        }]
      },
      yearlyUsers: {
        labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'],
        datasets: [{
          label: 'Yangi foydalanuvchilar',
          data: [100, 120, 150, 170, 180, 210],
          borderColor: '#36b9cc',
          backgroundColor: 'rgba(54, 185, 204, 0.2)',
          fill: true,
          tension: 0.4
        }]
      }
    };
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f8;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard {
  padding: 30px;
  flex-grow: 1;
  background-color: #f9f9f9;
}

.dashboard h1 {
  font-size: 28px;
  margin-bottom: 25px;
  font-weight: 700;
  color: #333;
}

.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-around;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  flex: 1 1 300px;
  min-width: 280px;
  max-width: 400px;
  transition: transform 0.3s ease;
  text-align: center;
}

.chart-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}
</style>