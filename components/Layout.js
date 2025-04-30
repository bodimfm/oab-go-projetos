import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Não mostrar o layout em páginas de login
  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            OAB Projetos
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span>Olá, {user.email}</span>
                <Link href="/projetos/novo" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition duration-300">
                  Novo Projeto
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition duration-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; {new Date().getFullYear()} OAB - Ordem dos Advogados do Brasil
        </div>
      </footer>
    </div>
  );
};

export default Layout;