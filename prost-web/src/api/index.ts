import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sessão expirada/ inválida: limpa o token e volta ao login em vez de deixar
// o app quebrar em silêncio com 401s. Ignora o próprio /auth para não criar
// loop quando o login em si falha (credenciais inválidas).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';
    if (status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
