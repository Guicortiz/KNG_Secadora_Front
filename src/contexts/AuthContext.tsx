import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  signed: boolean;
  signIn(credentials: object): Promise<void>;
  signOut(): void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@KNG:user');
    const storagedToken = localStorage.getItem('@KNG:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
  }, []);

  async function signIn({ email, senha }: any) {
    const response = await api.post('/login', { email, senha });

    const { user, token } = response.data;

    setUser(user);

    localStorage.setItem('@KNG:user', JSON.stringify(user));
    localStorage.setItem('@KNG:token', token);
  }

  function signOut() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}