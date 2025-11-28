'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { PerfilResponseDTO, ActualizarPerfilDTO } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/perfil.module.css';

type TabType = 'personal' | 'apariencia' | 'seguridad';

export default function PerfilPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { config, updateConfig } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [perfil, setPerfil] = useState<PerfilResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Formulario de información personal
  const [formData, setFormData] = useState<ActualizarPerfilDTO>({
    NombreCompleto: '',
    Bio: '',
    FechaNacimiento: '',
    Avatar: '',
  });

  // Preview de imagen
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      cargarPerfil();
    }
  }, [isAuthenticated]);

  const cargarPerfil = async () => {
    try {
      const data = await api.obtenerPerfil();
      setPerfil(data);

      // Inicializar formulario con datos existentes
      setFormData({
        NombreCompleto: data.NombreCompleto || '',
        Bio: data.Bio || '',
        FechaNacimiento: data.FechaNacimiento ? data.FechaNacimiento.split('T')[0] : '',
        Avatar: data.Avatar || '',
      });

      setPhotoPreview(data.FotoPerfil || null);
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage('error', 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ========================================
  // INFORMACIÓN PERSONAL
  // ========================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarInformacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('📤 Enviando datos:', formData);
      const updated = await api.actualizarPerfil(formData);
      console.log('✅ Respuesta recibida:', updated);
      setPerfil(updated);
      showMessage('success', 'Información actualizada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar:', error);
      const errorMsg = error.message || 'Error al actualizar la información';
      showMessage('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // FOTO DE PERFIL
  // ========================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'La imagen no puede superar 5MB');
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir al servidor
    subirFoto(file);
  };

  const subirFoto = async (file: File) => {
    setUploadingPhoto(true);

    try {
      const result = await api.subirFotoPerfil(file);
      showMessage('success', 'Foto de perfil actualizada');
      await cargarPerfil(); // Recargar para obtener la URL del servidor
    } catch (error: any) {
      showMessage('error', error.message || 'Error al subir la foto');
      setPhotoPreview(perfil?.FotoPerfil || null); // Revertir preview
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEliminarFoto = async () => {
    if (!confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

    setUploadingPhoto(true);

    try {
      await api.eliminarFotoPerfil();
      setPhotoPreview(null);
      showMessage('success', 'Foto de perfil eliminada');
      await cargarPerfil();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al eliminar la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ========================================
  // APARIENCIA
  // ========================================

  const handleTemaChange = async (Tema: 'light' | 'dark' | 'auto') => {
    setSaving(true);
    await updateConfig({ Tema });
    setSaving(false);
  };

  const handleColorChange = async (tipo: 'primario' | 'secundario', color: string) => {
    setSaving(true);
    if (tipo === 'primario') {
      await updateConfig({ ColorPrimario: color });
    } else {
      await updateConfig({ ColorSecundario: color });
    }
    setSaving(false);
  };

  const handleFuenteChange = async (TipoFuente: 'system' | 'serif' | 'mono' | 'poppins' | 'roboto' | 'inter') => {
    setSaving(true);
    await updateConfig({ TipoFuente });
    setSaving(false);
  };

  const handleTamanoFuenteChange = async (tamano: number) => {
    setSaving(true);
    await updateConfig({ TamanoFuente: tamano });
    setSaving(false);
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  if (!isAuthenticated || !perfil) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Volver
        </button>
        <h1>Mi Perfil</h1>
        {saving && <span className={styles.savingIndicator}>Guardando...</span>}
      </div>

      {/* Mensajes de éxito/error */}
      {message && (
        <div className={`${styles.messageBox} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Información Personal
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'apariencia' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('apariencia')}
        >
          Apariencia
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'seguridad' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('seguridad')}
        >
          Seguridad
        </button>
      </div>

      <div className={styles.content}>
        {/* ========================================
            TAB: INFORMACIÓN PERSONAL
            ======================================== */}
        {activeTab === 'personal' && (
          <>
            {/* Foto de perfil */}
            <section className={styles.section}>
              <h2>Foto de Perfil</h2>

              <div className={styles.photoSection}>
                <div className={styles.photoPreview}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto de perfil" />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      {formData.NombreCompleto?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className={styles.uploadingOverlay}>
                      <div className={styles.spinner}></div>
                    </div>
                  )}
                </div>

                <div className={styles.photoActions}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                    disabled={uploadingPhoto}
                  >
                    {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                  </button>

                  {photoPreview && (
                    <button
                      onClick={handleEliminarFoto}
                      className={styles.deleteButton}
                      disabled={uploadingPhoto}
                    >
                      Eliminar
                    </button>
                  )}

                  <p className={styles.photoHint}>
                    JPG, PNG o GIF. Máximo 5MB.
                  </p>
                </div>
              </div>
            </section>

            {/* Información básica */}
            <section className={styles.section}>
              <h2>Información Básica</h2>

              <form onSubmit={handleGuardarInformacion} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="NombreCompleto">Nombre Completo</label>
                  <input
                    type="text"
                    id="NombreCompleto"
                    name="NombreCompleto"
                    value={formData.NombreCompleto}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Tu nombre completo"
                    maxLength={100}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={perfil.Email}
                    className={styles.input}
                    disabled
                  />
                  <small className={styles.hint}>El email no se puede cambiar</small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="FechaNacimiento">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    id="FechaNacimiento"
                    name="FechaNacimiento"
                    value={formData.FechaNacimiento}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="Bio">Biografía</label>
                  <textarea
                    id="Bio"
                    name="Bio"
                    value={formData.Bio}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                    maxLength={500}
                  />
                  <small className={styles.hint}>
                    {formData.Bio?.length || 0}/500 caracteres
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="Avatar">Avatar (Emoji o URL)</label>
                  <input
                    type="text"
                    id="Avatar"
                    name="Avatar"
                    value={formData.Avatar}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="https://..."
                  />
                  <small className={styles.hint}>
                    URL de una imagen de Avatar
                  </small>
                </div>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </section>

            {/* Información de cuenta */}
            <section className={styles.section}>
              <h2>Información de Cuenta</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Roles:</label>
                  <span>{perfil.Roles.join(', ')}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Fecha de Registro:</label>
                  <span>{new Date(perfil.FechaRegistro).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ========================================
            TAB: APARIENCIA
            ======================================== */}
        {activeTab === 'apariencia' && (
          <>
            <section className={styles.section}>
              <h2>🎨 Apariencia</h2>

              {/* Selector de tema */}
              <div className={styles.formGroup}>
                <label>Tema</label>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.themeButton} ${config.Tema === 'light' ? styles.active : ''}`}
                    onClick={() => handleTemaChange('light')}
                  >
                    Claro
                  </button>
                  <button
                    className={`${styles.themeButton} ${config.Tema === 'dark' ? styles.active : ''}`}
                    onClick={() => handleTemaChange('dark')}
                  >
                    Oscuro
                  </button>
                  <button
                    className={`${styles.themeButton} ${config.Tema === 'auto' ? styles.active : ''}`}
                    onClick={() => handleTemaChange('auto')}
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Colores */}
              <div className={styles.formGroup}>
                <label>Color Primario</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    value={config.ColorPrimario}
                    onChange={(e) => handleColorChange('primario', e.target.value)}
                  />
                  <span>{config.ColorPrimario}</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Color Secundario</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    value={config.ColorSecundario}
                    onChange={(e) => handleColorChange('secundario', e.target.value)}
                  />
                  <span>{config.ColorSecundario}</span>
                </div>
              </div>

              {/* Fuente */}
              <div className={styles.formGroup}>
                <label>Tipo de Fuente</label>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'system' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('system')}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Sistema
                  </button>
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'serif' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('serif')}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Serif
                  </button>
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'mono' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('mono')}
                    style={{ fontFamily: 'monospace' }}
                  >
                    Mono
                  </button>
                  {/* NUEVAS FUENTES */}
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'poppins' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('poppins')}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Poppins
                  </button>
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'roboto' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('roboto')}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Roboto
                  </button>
                  <button
                    className={`${styles.fontButton} ${config.TipoFuente === 'inter' ? styles.active : ''}`}
                    onClick={() => handleFuenteChange('inter')}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Inter
                  </button>
                </div>
              </div>

              {/* Tamaño de fuente */}
              <div className={styles.formGroup}>
                <label>Tamaño de Fuente: {config.TamanoFuente}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={config.TamanoFuente}
                  onChange={(e) => handleTamanoFuenteChange(Number(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.rangeLabels}>
                  <span>12px</span>
                  <span>24px</span>
                </div>
              </div>
            </section>

            {/* Preview */}
            <section className={styles.section}>
              <h2>Vista Previa</h2>
              <div className={styles.preview}>
                <h3 style={{ color: config.ColorPrimario }}>Título con color primario</h3>
                <p>Este es un párrafo de ejemplo con el tamaño de fuente configurado.</p>
                <button
                  className={styles.previewButton}
                  style={{
                    backgroundColor: config.ColorPrimario,
                    borderColor: config.ColorSecundario
                  }}
                >
                  Botón de ejemplo
                </button>
              </div>
            </section>
          </>
        )}

        {/* ========================================
            TAB: SEGURIDAD
            ======================================== */}
        {activeTab === 'seguridad' && (
          <section className={styles.section}>
            <h2>🔒 Seguridad</h2>
            <p className={styles.securityNote}>
              La funcionalidad de cambio de contraseña estará disponible próximamente.
            </p>

            <div className={styles.infoGrid}>
              {perfil.Seguridad.UltimaActualizacionPassword && (
                <div className={styles.infoItem}>
                  <label>Última actualización de contraseña:</label>
                  <span>
                    {new Date(perfil.Seguridad.UltimaActualizacionPassword).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className={styles.infoItem}>
                <label>Autenticación 2FA:</label>
                <span>{perfil.Seguridad.Autenticacion2FA ? '✅ Activada' : '❌ Desactivada'}</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}