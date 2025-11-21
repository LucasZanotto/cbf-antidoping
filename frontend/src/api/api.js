import axios from 'axios';
import { getAuth, logout as doLogout } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// request: inclui token
api.interceptors.request.use((config) => {
  const token = getAuth().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// response: trata 401 e extrai mensagem
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      doLogout();
      // reload suave para forçar voltar pro login
      window.location.href = '/login';
    }
    // normaliza mensagem
    err.userMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Erro inesperado.';
    throw err;
  }
);

export default api;
