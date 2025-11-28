'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from '@/styles/Login-Register.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    Email: '',
    Password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.brandContainer}>
          <div className={styles.logoCircle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className={styles.brandName}>Sistema de Gestión</h1>
          <p className={styles.brandSubtitle}>Control Integral de Inventario</p>
          <p className={styles.brandDescription}>Plataforma completa para la administración</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Gestión de productos y categorías</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Control de inventario en tiempo real</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Sistema de autenticación seguro</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Reportes y análisis detallados</span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Iniciar Sesión</h2>
          <p className={styles.formSubtitle}>
            Ingresa tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Ingresa tu Email"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="Password" className={styles.label}>
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="Password"
                  type="Password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿No tienes cuenta?{' '}
              <Link href="/register" className={styles.link}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.copyright}>
        © 2025 Sistema de Gestión - Plataforma Integral
      </footer>
    </div>
  );
}