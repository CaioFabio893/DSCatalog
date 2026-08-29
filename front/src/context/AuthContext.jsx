import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, fetchMe } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Decodifica o JWT para ler o username e as authorities (roles).
  const decodeToken = useCallback((token) => {
    try {
      const base64 = token.split('.')[1];
      const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    } catch {
      return null;
    }
  }, []);

  // Ao iniciar, se houver token, busca os dados completos do usuário.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('access_token', data.access_token);

    // Busca os dados do usuário logado
    const me = await fetchMe();
    setUser(me);
    localStorage.setItem('user', JSON.stringify(me));

    return me;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  // Permissões por role (authorities vêm como ROLE_ADMIN / ROLE_OPERATOR)
  const hasRole = (role) => {
    const authorities = decodePermissions();
    return authorities.some((a) => a === role);
  };

  const decodePermissions = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return [];
    const payload = decodeToken(token);
    return payload?.authorities || [];
  };

  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isOperator = () => hasRole('ROLE_OPERATOR');
  const canManage = () => isAdmin() || isOperator(); // admin e operator podem criar/editar/deletar produtos e categorias

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        isAdmin,
        isOperator,
        canManage,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
