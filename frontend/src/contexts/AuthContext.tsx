'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { LoginDTO, RegisterDTO } from '@/types';

// Tipo de usuario con foto de perfil
interface Usuario {
  Id?: string;
  Email: string;
  NombreCompleto: string;
  Roles: string[];
  FotoPerfil?: string | null;
}

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserPhoto: (photoUrl: string | null) => void;  // Para actualizar foto sin recargar
  refreshUserProfile: () => Promise<void>;  // Para recargar perfil completo
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
      // Cargar perfil para obtener foto actualizada
      loadUserProfile();
    }
    setLoading(false);
  }, []);

  // Cargar perfil completo del usuario (incluyendo foto)
  const loadUserProfile = async () => {
    try {
      if (!api.isAuthenticated()) return;
      
      const perfil = await api.obtenerPerfil();
      
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = {
          ...prev,
          Id: perfil.Id,
          FotoPerfil: perfil.FotoPerfil || null,
          NombreCompleto: perfil.NombreCompleto || prev.NombreCompleto
        };
        
        // Actualizar también en localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (data: LoginDTO) => {
    try {
      const response = await api.login(data);
      const userData: Usuario = {
        Email: response.Email,
        NombreCompleto: response.NombreCompleto,
        Roles: response.Roles
      };
      setUser(userData);
      
      // Esperar un poco para que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cargar perfil para obtener foto
      try {
        const perfil = await api.obtenerPerfil();
        const userWithPhoto: Usuario = {
          ...userData,
          Id: perfil.Id,
          FotoPerfil: perfil.FotoPerfil || null
        };
        setUser(userWithPhoto);
        localStorage.setItem('user', JSON.stringify(userWithPhoto));
      } catch (e) {
        console.error('Could not load profile photo:', e);
      }
      
      // Redirigir
      window.location.href = '/dashboard';
      
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterDTO) => {
    try {
      const response = await api.register(data);
      const userData: Usuario = {
        Email: response.Email,
        NombreCompleto: response.NombreCompleto,
        Roles: response.Roles,
        FotoPerfil: null  // Usuario nuevo no tiene foto
      };
      setUser(userData);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.location.href = '/dashboard';
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    window.location.href = '/login';
  };

  // Actualizar solo la foto del usuario (útil después de subir foto en perfil)
  const updateUserPhoto = (photoUrl: string | null) => {
    setUser(prev => {
      if (!prev) return null;
      
      const updatedUser = { ...prev, FotoPerfil: photoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Recargar perfil completo
  const refreshUserProfile = async () => {
    await loadUserProfile();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.Roles?.includes('Admin') ?? false,
    updateUserPhoto,
    refreshUserProfile
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