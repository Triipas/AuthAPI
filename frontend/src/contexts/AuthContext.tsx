'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { LoginDTO, RegisterDTO, Usuario } from '@/types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay usuario guardado al cargar
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginDTO) => {
    try {
      const response = await api.login(data);
      const userData: Usuario = {
        Id: '', // El backend no devuelve el ID en el login, lo obtendrías del perfil
        Email: response.Email,
        NombreCompleto: response.NombreCompleto,
        Roles: response.Roles
      };
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterDTO) => {
    try {
      const response = await api.register(data);
      const userData: Usuario = {
        Id: '',
        Email: response.Email,
        NombreCompleto: response.NombreCompleto,
        Roles: response.Roles
      };
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.Roles?.includes('Admin') ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}