'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { ConfiguracionAparienciaDTO } from '@/types';

interface ThemeContextType {
  config: ConfiguracionAparienciaDTO;
  updateConfig: (newConfig: Partial<ConfiguracionAparienciaDTO>) => Promise<void>;
  applyTheme: () => void;
  loading: boolean;
  reloadConfig: () => Promise<void>;
}

const defaultConfig: ConfiguracionAparienciaDTO = {
  Tema: 'light',
  ColorPrimario: '#3b82f6',
  ColorSecundario: '#8b5cf6',
  TipoFuente: 'system',
  TamanoFuente: 16,
  ModoContraste: 'normal',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionAparienciaDTO>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Cargar configuración al iniciar
  useEffect(() => {
    loadConfig();
  }, []);

  // Aplicar tema cuando cambie la configuración
  useEffect(() => {
    applyTheme();
  }, [config]);

  // Detectar cambios en el usuario (login/logout)
  useEffect(() => {
    const checkUserChange = () => {
      const userStr = localStorage.getItem('user');
      const newUserId = userStr ? JSON.parse(userStr).email : null;
      
      // Si el usuario cambió (o se hizo logout)
      if (newUserId !== currentUserId) {
        console.log('Usuario cambió de:', currentUserId, 'a:', newUserId);
        setCurrentUserId(newUserId);
        
        // Recargar configuración inmediatamente
        loadConfig();
      }
    };

    // Verificar cada 500ms (esto detectará cambios rápidamente)
    const interval = setInterval(checkUserChange, 500);

    // También escuchar eventos de storage
    window.addEventListener('storage', checkUserChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkUserChange);
    };
  }, [currentUserId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay usuario autenticado
      const isAuthenticated = api.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('No hay usuario autenticado, usando config por defecto');
        // Si no hay usuario, usar config por defecto y limpiar localStorage
        setConfig(defaultConfig);
        localStorage.removeItem('themeConfig');
        setLoading(false);
        return;
      }

      console.log('Usuario autenticado, cargando configuración...');

      // 1. Intentar cargar desde localStorage primero (para UI inmediata)
      const localConfig = localStorage.getItem('themeConfig');
      if (localConfig) {
        const parsed = JSON.parse(localConfig);
        setConfig(parsed);
        console.log('Config cargada desde localStorage:', parsed);
      }

      // 2. SIEMPRE cargar desde el backend (para tener datos actualizados)
      try {
        console.log('Solicitando perfil al backend...');
        const perfil = await api.obtenerPerfil();
        
        if (perfil?.Apariencia) {
          console.log('Configuración recibida del backend:', perfil.Apariencia);
          setConfig(perfil.Apariencia);
          // Guardar en localStorage para próximas cargas
          localStorage.setItem('themeConfig', JSON.stringify(perfil.Apariencia));
          console.log('Configuración guardada en localStorage');
        } else {
          console.log('No se recibió configuración de apariencia del backend');
        }
      } catch (error) {
        console.error('Error al cargar configuración del backend:', error);
        // Si falla el backend pero hay localStorage, usar ese
        if (!localConfig) {
          console.log('No hay localStorage, usando config por defecto');
          setConfig(defaultConfig);
        }
      }
    } catch (error) {
      console.error('Error general al cargar configuración:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<ConfiguracionAparienciaDTO>) => {
    const updatedConfig = { ...config, ...newConfig };

    // 1. PRIMERO: Aplicar inmediatamente en el estado local
    setConfig(updatedConfig);

    // 2. SEGUNDO: Guardar en localStorage (síncrono, rápido)
    localStorage.setItem('themeConfig', JSON.stringify(updatedConfig));

    // 3. TERCERO: Guardar en backend (asíncrono, en paralelo)
    try {
      if (api.isAuthenticated()) {
        await api.actualizarApariencia(updatedConfig);
        console.log('Configuración guardada en el backend');
      }
    } catch (error) {
      console.error('Error saving theme to backend:', error);
    }
  };

  const applyTheme = () => {
    const root = document.documentElement;

    // Aplicar tema (light/dark/auto)
    if (config.Tema === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', config.Tema);
    }

    // Aplicar colores personalizados
    root.style.setProperty('--color-primary', config.ColorPrimario);
    root.style.setProperty('--color-secondary', config.ColorSecundario);

    // Aplicar fuente
    root.setAttribute('data-font', config.TipoFuente);
    root.style.setProperty('--font-size-base', `${config.TamanoFuente}px`);

    // Aplicar contraste
    root.setAttribute('data-contrast', config.ModoContraste);
  };

  const value = {
    config,
    updateConfig,
    applyTheme,
    loading,
    reloadConfig: loadConfig,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}