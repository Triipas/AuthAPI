'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from '@/styles/dashboard.module.css';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado después de cargar, redirigir a login
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (el useEffect redirigirá)
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
              <div className={styles.avatar}>
                {user?.nombreCompleto?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className={styles.userName}>{user?.nombreCompleto}</p>
                <p className={styles.userEmail}>{user?.email}</p>
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
          <h2>¡Bienvenido, {user?.nombreCompleto}! 👋</h2>
          <p>Has iniciado sesión exitosamente en el sistema de gestión.</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div>
              <p className={styles.statLabel}>Productos</p>
              <p className={styles.statValue}>-</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📁</div>
            <div>
              <p className={styles.statLabel}>Categorías</p>
              <p className={styles.statValue}>-</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div>
              <p className={styles.statLabel}>Bajo Stock</p>
              <p className={styles.statValue}>-</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              {user?.roles?.includes('Admin') ? '👑' : '👤'}
            </div>
            <div>
              <p className={styles.statLabel}>Rol</p>
              <p className={styles.statValue}>
                {user?.roles?.join(', ') || 'Usuario'}
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

            {user?.roles?.includes('Admin') && (
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