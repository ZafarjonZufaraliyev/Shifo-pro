// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// Chart.js - vue-chart-3 uchun kerakli modullarni to‘liq ro‘yxatdan o‘tkazamiz
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarController,    // ✅ kerak
  LineController,   // ✅ kerak
  PieController     // ✅ kerak (agar PieChart ishlatilsa)
} from 'chart.js'

// BARCHA kerakli qismlarni ro'yxatdan o'tkazish
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarController,
  LineController,
  PieController
)

const app = createApp(App)

app.use(router)

app.mount('#app')
