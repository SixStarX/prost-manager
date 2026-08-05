import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../api';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (user: SessionUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Ao montar, descobre se há sessão válida (cookie httpOnly) via /auth/me.
  // Se o access expirou mas o refresh é válido, o interceptor renova sozinho.
  useEffect(() => {
    let active = true;
    api
      .get<{ user: SessionUser }>('/auth/me')
      .then((r) => {
        if (active) setUser(r.data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback((u: SessionUser) => setUser(u), []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* mesmo se falhar, limpamos o estado local */
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
