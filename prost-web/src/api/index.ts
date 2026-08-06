import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// withCredentials: o navegador envia/recebe os cookies httpOnly de sessão.
const api = axios.create({ baseURL: '/api', withCredentials: true });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Um único refresh em voo, compartilhado por várias 401 concorrentes.
let refreshing: Promise<unknown> | null = null;

// Em 401: tenta um refresh (uma vez) e repete a requisição original. Se o
// refresh falhar, manda para o login. Chamadas do próprio /auth ficam de fora
// para não criar loop.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthCall = /\/auth\/(login|refresh|logout)/.test(url);

    if (status === 401 && original && !isAuthCall && !original._retry) {
      original._retry = true;
      try {
        refreshing = refreshing ?? api.post('/auth/refresh');
        await refreshing;
        refreshing = null;
        return api(original); // cookies novos já setados
      } catch (refreshErr) {
        refreshing = null;
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
