import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <a className="font-bold text-xl">OAB-GO Projetos</a>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {!loading && user ? (
                <>
                  <Link href="/">
                    <a className="hover:text-blue-200">Projetos</a>
                  </Link>
                  
                  {(user.perfil === 'administrador' || user.perfil === 'moderador') && (
                    <Link href="/admin">
                      <a className="hover:text-blue-200">Administração</a>
                    </Link>
                  )}
                  
                  <div className="relative group">
                    <button className="flex items-center hover:text-blue-200">
                      <span>{user.nome}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded shadow-lg hidden group-hover:block z-10">
                      <Link href="/perfil">
                        <a className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Meu Perfil</a>
                      </Link>
                      <Link href="/meus-projetos">
                        <a className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Meus Projetos</a>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              ) : !loading ? (
                <>
                  <Link href="/login">
                    <a className="hover:text-blue-200">Login</a>
                  </Link>
                  <Link href="/registro">
                    <a className="bg-white text-blue-800 px-4 py-2 rounded font-medium hover:bg-blue-50">
                      Registro
                    </a>
                  </Link>
                </>
              ) : null}
            </div>
            
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Menu móvel */}
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-blue-700">
              {!loading && user ? (
                <>
                  <Link href="/">
                    <a className="block py-2 hover:text-blue-200">Projetos</a>
                  </Link>
                  
                  {(user.perfil === 'administrador' || user.perfil === 'moderador') && (
                    <Link href="/admin">
                      <a className="block py-2 hover:text-blue-200">Administração</a>
                    </Link>
                  )}
                  
                  <Link href="/perfil">
                    <a className="block py-2 hover:text-blue-200">Meu Perfil</a>
                  </Link>
                  
                  <Link href="/meus-projetos">
                    <a className="block py-2 hover:text-blue-200">Meus Projetos</a>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 hover:text-blue-200"
                  >
                    Sair
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link href="/login">
                    <a className="block py-2 hover:text-blue-200">Login</a>
                  </Link>
                  <Link href="/registro">
                    <a className="block py-2 hover:text-blue-200">Registro</a>
                  </Link>
                </>
              ) : null}
            </div>
          )}
        </div>
      </nav>
      
      <main>{children}</main>
      
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Comissão de Direito Digital da OAB-GO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}