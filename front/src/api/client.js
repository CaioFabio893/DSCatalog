import axios from 'axios';

// URL do backend Spring Boot.
// O Vite roda em http://localhost:5173 e o backend em http://localhost:8080.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptador de REQUISIÇÃO: adiciona o token JWT em toda chamada autenticada.
// Só aplica o Bearer se a chamada ainda não definiu um header Authorization
// (ex.: o login já envia o Basic e não deve ser sobrescrito).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const hasAuthHeader = config.headers.Authorization;
  if (token && !hasAuthHeader) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptador de RESPOSTA: se o token expirou (401), desloga o usuário.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Evita limpar quando a falha foi no próprio login (200 no /users/me por ex.)
      const url = error.config?.url || '';
      if (!url.includes('/oauth2/token')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Redireciona para o login se não estiver lá
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
