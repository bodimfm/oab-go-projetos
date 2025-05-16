import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo e Nome */}
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/images/logo-oabgo.png"
              alt="OAB-GO"
              className="h-10 w-auto bg-white p-1 rounded"
            />
            <span className="font-bold text-xl">OAB-GO Projetos</span>
          </Link>

          {/* Menu para Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`hover:text-blue-200 ${router.pathname === '/' ? 'text-blue-200 font-medium' : ''}`}>
              Início
            </Link>
            <Link href="/projetos" className={`hover:text-blue-200 ${router.pathname.startsWith('/projetos') ? 'text-blue-200 font-medium' : ''}`}>
              Projetos
            </Link>
            <Link href="/membros" className={`hover:text-blue-200 ${router.pathname.startsWith('/membros') ? 'text-blue-200 font-medium' : ''}`}>
              Membros
            </Link>
            <Link href="/buscar" className={`hover:text-blue-200 ${router.pathname.startsWith('/buscar') ? 'text-blue-200 font-medium' : ''}`}>
              Buscar
            </Link>

            {isAuthenticated ? (
              <div className="relative ml-3">
                <button
                  type="button"
                  className="flex items-center space-x-2 text-white hover:text-blue-200 focus:outline-none"
                  onClick={toggleMenu}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <span>{user?.nome_completo || 'Usuário'}</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Menu Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link
                        href="/perfil"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      <button
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>

          {/* Menu Hamburger para Mobile */}
          <button
            type="button"
            className="md:hidden text-white hover:text-blue-200 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu para Mobile */}
        {menuOpen && (
          <nav className="md:hidden bg-blue-700 mt-3 rounded-lg p-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`hover:text-blue-200 ${router.pathname === '/' ? 'text-blue-200 font-medium' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/projetos"
                className={`hover:text-blue-200 ${router.pathname.startsWith('/projetos') ? 'text-blue-200 font-medium' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Projetos
              </Link>
              <Link
                href="/membros"
                className={`hover:text-blue-200 ${router.pathname.startsWith('/membros') ? 'text-blue-200 font-medium' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Membros
              </Link>
              <Link
                href="/buscar"
                className={`hover:text-blue-200 ${router.pathname.startsWith('/buscar') ? 'text-blue-200 font-medium' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Buscar
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="border-blue-600" />
                  <Link
                    href="/perfil"
                    className="hover:text-blue-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    className="text-left text-white hover:text-blue-200"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-white text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 