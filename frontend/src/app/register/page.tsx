'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from '@/styles/Login-Register.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    NombreCompleto: '',
    Email: '',
    Password: '',
    ConfirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.Password !== formData.ConfirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (formData.Password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({
        NombreCompleto: formData.NombreCompleto,
        Email: formData.Email,
        Password: formData.Password
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
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
          <p className={styles.brandDescription}>Únete a nuestra plataforma</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Acceso completo a todas las funcionalidades</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Interfaz intuitiva y fácil de usar</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Soporte técnico disponible 24/7</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.checkmark}>✓</div>
            <span>Actualizaciones constantes del sistema</span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Crear Cuenta</h2>
          <p className={styles.formSubtitle}>
            Completa el formulario para registrarte
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="NombreCompleto" className={styles.label}>
                Nombre Completo
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="NombreCompleto"
                  type="text"
                  name="NombreCompleto"
                  value={formData.NombreCompleto}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="Email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="Email"
                  type="Email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="tu@Email.com"
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
                  placeholder="Mínimo 6 caracteres"
                  className={styles.input}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="ConfirmPassword" className={styles.label}>
                Confirmar Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="ConfirmPassword"
                  type="Password"
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className={styles.link}>
                Inicia sesión aquí
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