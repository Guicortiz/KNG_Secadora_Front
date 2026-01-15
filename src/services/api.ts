import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL da sua API Node
});

// Este interceptor adiciona o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@KNG:token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;