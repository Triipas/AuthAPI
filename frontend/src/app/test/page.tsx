'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './page.module.css';

export default function TestPage() {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fullScreen, setFullScreen] = useState(true);
  const [message, setMessage] = useState('Cargando...');
  const [showSpinner, setShowSpinner] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h1>Playground 🎨</h1>
        
        <div className={styles.controlGroup}>
          <label>
            <input
              type="checkbox"
              checked={showSpinner}
              onChange={(e) => setShowSpinner(e.target.checked)}
            />
            Mostrar Spinner
          </label>
        </div>

        <div className={styles.controlGroup}>
          <label>
            <input
              type="checkbox"
              checked={fullScreen}
              onChange={(e) => setFullScreen(e.target.checked)}
            />
            Pantalla completa
          </label>
        </div>

        <div className={styles.controlGroup}>
          <label>Tamaño:</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="small"
                checked={size === 'small'}
                onChange={(e) => setSize(e.target.value as any)}
              />
              Small (30px)
            </label>
            <label>
              <input
                type="radio"
                value="medium"
                checked={size === 'medium'}
                onChange={(e) => setSize(e.target.value as any)}
              />
              Medium (50px)
            </label>
            <label>
              <input
                type="radio"
                value="large"
                checked={size === 'large'}
                onChange={(e) => setSize(e.target.value as any)}
              />
              Large (70px)
            </label>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label>Mensaje:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensaje del spinner"
            className={styles.textInput}
          />
        </div>

        <div className={styles.codePreview}>
          <h3>Código para copiar:</h3>
          <pre>
{`<LoadingSpinner
  size="${size}"
  fullScreen={${fullScreen}}
  message="${message}"
/>`}
          </pre>
        </div>
      </div>

      {showSpinner && (
        <div className={fullScreen ? undefined : styles.spinnerContainer}>
          <LoadingSpinner
            size={size}
            fullScreen={fullScreen}
            message={message}
          />
        </div>
      )}
    </div>
  );
}