// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // router-ni import qilamiz
import './assets/css/main.css'
const app = createApp(App)

app.use(router)  // router-ni Vue ilovasiga qo‘shamiz

app.mount('#app')
