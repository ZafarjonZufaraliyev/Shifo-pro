// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shifo-pro.uz',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Har bir so'rovga localStorage'dan token olib qo'shamiz
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
