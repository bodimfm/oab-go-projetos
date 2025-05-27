import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  
  // Lista de rotas que não precisam de padding (login, cadastro, etc)
  const fullWidthRoutes = ['/login', '/cadastro', '/recuperar-senha', '/alterar-senha'];
  const isFullWidth = fullWidthRoutes.includes(router.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-oab-background">
      <Header />
      
      <main className={`flex-grow ${!isFullWidth ? 'container mx-auto px-6 py-8' : ''}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
} 