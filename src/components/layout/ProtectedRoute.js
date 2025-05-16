import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar se a página está carregando ou se o usuário não está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // Verificar se o usuário precisa alterar a senha (primeiro acesso)
    if (!loading && isAuthenticated && user?.primeiro_acesso && router.pathname !== '/alterar-senha') {
      router.push('/alterar-senha');
    }
  }, [isAuthenticated, loading, router, user]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário precisa alterar a senha no primeiro acesso
  if (user?.primeiro_acesso && router.pathname !== '/alterar-senha') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Redirecionando para alteração de senha...</p>
        </div>
      </div>
    );
  }

  // Retorna o conteúdo da página se tudo estiver correto
  return <>{children}</>;
} 