import React from 'react';
import Header from './Header';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  
  // Lista de rotas que não precisam de padding (login, cadastro, etc)
  const fullWidthRoutes = ['/login', '/cadastro', '/recuperar-senha', '/alterar-senha'];
  const isFullWidth = fullWidthRoutes.includes(router.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-grow ${!isFullWidth ? 'container mx-auto px-4 py-8' : ''}`}>
        {children}
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} OAB-GO - Todos os direitos reservados
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="https://www.oabgo.org.br" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-800 text-sm">
                Site Oficial
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-800 text-sm">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-800 text-sm">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 