'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Producto, Categoria, PaginatedResponse } from '@/types';
import Avatar from '@/components/Avatar';  // ← Importar Avatar
import styles from '@/styles/dashboard.module.css';

interface DashboardStats {
  totalProductos: number;
  totalCategorias: number;
  productosBajoStock: number;
  loading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    totalCategorias: 0,
    productosBajoStock: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      const [productosResponse, categoriasResponse, bajoStockResponse] = await Promise.all([
        api.getProductos({ pageSize: 1 }),
        api.getCategorias(),
        user?.Roles?.includes('Admin') 
          ? api.getProductosBajoStock()
          : Promise.resolve([] as Producto[])
      ]);

      setStats({
        totalProductos: productosResponse.Pagination?.TotalCount || 0,
        totalCategorias: categoriasResponse.length,
        productosBajoStock: bajoStockResponse.length,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar estadísticas'
      }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Sistema de Gestión</p>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <Avatar 
                src={user?.FotoPerfil}
                name={user?.NombreCompleto}
                size="md"
                onClick={() => router.push('/perfil')}
              />
              <div>
                <p className={styles.userName}>{user?.NombreCompleto}</p>
                <p className={styles.userEmail}>{user?.Email}</p>
              </div>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Welcome Card */}
        <div className={styles.welcomeCard}>
          <h2>¡Bienvenido, {user?.NombreCompleto}! 👋</h2>
          <p>Has iniciado sesión exitosamente en el sistema de gestión.</p>
        </div>

        {/* Mensaje de error si hay */}
        {stats.error && (
          <div className={styles.errorMessage}>
            <p>{stats.error}</p>
            <button onClick={loadStats} className={styles.retryButton}>
              Reintentar
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div>
              <p className={styles.statLabel}>Productos</p>
              <p className={styles.statValue}>
                {stats.loading ? '...' : stats.totalProductos}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📁</div>
            <div>
              <p className={styles.statLabel}>Categorías</p>
              <p className={styles.statValue}>
                {stats.loading ? '...' : stats.totalCategorias}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div>
              <p className={styles.statLabel}>Bajo Stock</p>
              <p className={styles.statValue}>
                {stats.loading ? '...' : stats.productosBajoStock}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              {user?.Roles?.includes('Admin') ? '👑' : '👤'}
            </div>
            <div>
              <p className={styles.statLabel}>Rol</p>
              <p className={styles.statValue}>
                {user?.Roles?.join(', ') || 'Usuario'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Acciones Rápidas</h3>
          <div className={styles.actionsGrid}>
            <button 
              className={styles.actionCard}
              onClick={() => router.push('/productos')}
            >
              <span className={styles.actionIcon}>📦</span>
              <span className={styles.actionLabel}>Ver Productos</span>
            </button>

            <button 
              className={styles.actionCard}
              onClick={() => router.push('/categorias')}
            >
              <span className={styles.actionIcon}>📁</span>
              <span className={styles.actionLabel}>Ver Categorías</span>
            </button>

            {user?.Roles?.includes('Admin') && (
              <>
                <button 
                  className={styles.actionCard}
                  onClick={() => router.push('/productos/nuevo')}
                >
                  <span className={styles.actionIcon}>➕</span>
                  <span className={styles.actionLabel}>Nuevo Producto</span>
                </button>

                <button 
                  className={styles.actionCard}
                  onClick={() => router.push('/categorias/nueva')}
                >
                  <span className={styles.actionIcon}>📂</span>
                  <span className={styles.actionLabel}>Nueva Categoría</span>
                </button>
              </>
            )}

            <button 
              className={styles.actionCard}
              onClick={() => router.push('/perfil')}
            >
              <span className={styles.actionIcon}>⚙️</span>
              <span className={styles.actionLabel}>Mi Perfil</span>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h4>🎯 Sistema en Desarrollo</h4>
            <p>Este es el dashboard principal. Desde aquí podrás acceder a todas las funcionalidades del sistema.</p>
            <ul className={styles.featureList}>
              <li>✅ Autenticación implementada</li>
              <li>✅ Gestión de sesión</li>
              <li>✅ Estadísticas en tiempo real</li>
              <li>🔄 Gestión de productos (próximamente)</li>
              <li>🔄 Gestión de categorías (próximamente)</li>
              <li>🔄 Perfil de usuario (próximamente)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}