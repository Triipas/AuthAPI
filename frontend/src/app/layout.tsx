import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Gestión',
  description: 'Plataforma integral de gestión de inventario',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}