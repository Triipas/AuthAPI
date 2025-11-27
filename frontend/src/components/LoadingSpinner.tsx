import styles from '@/styles/LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = 'Cargando...', 
  size = 'medium',
  fullScreen = true 
}: LoadingSpinnerProps) {
  const sizeClass = styles[size];

  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={styles.content}>
          <div className={`${styles.spinner} ${sizeClass}`}></div>
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inlineContainer}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}