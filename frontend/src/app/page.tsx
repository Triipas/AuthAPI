'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay Token
    const Token = localStorage.getItem('Token');
    
    if (Token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return <LoadingSpinner message="Redirigiendo..." size="large"/>;
}