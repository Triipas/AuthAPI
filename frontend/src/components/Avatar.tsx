'use client';

import { useState } from 'react';
import styles from '@/styles/Avatar.module.css';

interface AvatarProps {
  src?: string | null;          // URL de la foto
  name?: string | null;         // Nombre para generar inicial
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Tamaño
  className?: string;           // Clases adicionales
  onClick?: () => void;         // Callback al hacer click
  showBorder?: boolean;         // Mostrar borde
}

export default function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  onClick,
  showBorder = false
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Obtener inicial del nombre
  const getInitial = (): string => {
    if (!name || name.trim() === '') return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Generar color de fondo basado en el nombre (consistente)
  const getBackgroundColor = (): string => {
    if (!name) return 'var(--color-primary)';
    
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f97316', // orange
      '#10b981', // emerald
      '#06b6d4', // cyan
      '#6366f1', // indigo
      '#84cc16', // lime
    ];
    
    // Generar índice basado en el nombre
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const shouldShowImage = src && !imageError;

  const containerClasses = [
    styles.avatar,
    styles[size],
    showBorder ? styles.withBorder : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      onClick={onClick}
      style={!shouldShowImage ? { backgroundColor: getBackgroundColor() } : undefined}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={styles.initial}>{getInitial()}</span>
      )}
    </div>
  );
}