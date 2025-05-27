'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated || false;
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});
  
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md">
      {/* Barra superior com contatos */}
      <div className="bg-oab-primary-dark text-white py-2 text-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="hidden md:flex items-center space-x-6">
            <a href="tel:+556232382000" className="flex items-center hover:text-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>(62) 3238-2000</span>
            </a>
            <a href="mailto:contato@oabgo.org.br" className="flex items-center hover:text-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contato@oabgo.org.br</span>
            </a>
          </div>
          {isAuthenticated && (
            <div className="text-sm">
              <span>Olá, {user?.nome_completo || 'Usuário'}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Menu principal */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo e Nome */}
          <Link href="/" className="flex items-center space-x-4">
            <div className="relative h-14 w-18 flex items-center justify-center bg-white rounded-lg">
              <img
                src="/images/logo-oabgo.png"
                alt="Logo OAB-GO"
                width={72}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-oab-primary-dark">OAB GOIÁS</span>
              <span className="text-oab-text-secondary text-sm">Sistema de Projetos das Comissões</span>
            </div>
          </Link>

          {/* Menu para Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`hover:text-oab-primary transition-colors font-medium ${pathname === '/' ? 'text-oab-primary' : 'text-oab-text-primary'}`}>
              Início
            </Link>
            <Link href="/projetos" className={`hover:text-oab-primary transition-colors font-medium ${pathname.startsWith('/projetos') ? 'text-oab-primary' : 'text-oab-text-primary'}`}>
              Projetos
            </Link>
            <Link href="/membros" className={`hover:text-oab-primary transition-colors font-medium ${pathname.startsWith('/membros') ? 'text-oab-primary' : 'text-oab-text-primary'}`}>
              Membros
            </Link>
            <Link href="/buscar" className={`hover:text-oab-primary transition-colors font-medium ${pathname.startsWith('/buscar') ? 'text-oab-primary' : 'text-oab-text-primary'}`}>
              Buscar
            </Link>

            {isAuthenticated ? (
              <div className="relative ml-3">
                <button
                  type="button"
                  className="flex items-center space-x-2 text-oab-text-primary hover:text-oab-primary focus:outline-none transition-colors"
                  onClick={toggleMenu}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-oab-red hover:text-white"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      <button
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-oab-red hover:text-white"
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
                className="btn-primary"
              >
                Entrar
              </Link>
            )}
          </nav>

          {/* Menu Hamburger para Mobile */}
          <button
            type="button"
            className="md:hidden text-oab-gray-700 hover:text-oab-red focus:outline-none"
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
          <nav className="md:hidden bg-white mt-3 rounded-lg p-4 shadow-lg border border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`hover:text-oab-red ${pathname === '/' ? 'text-oab-red font-medium' : 'text-oab-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/projetos"
                className={`hover:text-oab-red ${pathname.startsWith('/projetos') ? 'text-oab-red font-medium' : 'text-oab-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Projetos
              </Link>
              <Link
                href="/membros"
                className={`hover:text-oab-red ${pathname.startsWith('/membros') ? 'text-oab-red font-medium' : 'text-oab-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Membros
              </Link>
              <Link
                href="/buscar"
                className={`hover:text-oab-red ${pathname.startsWith('/buscar') ? 'text-oab-red font-medium' : 'text-oab-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Buscar
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="border-gray-200" />
                  <Link
                    href="/perfil"
                    className="text-oab-gray-700 hover:text-oab-red"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    className="text-left text-oab-gray-700 hover:text-oab-red"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary text-center mt-2"
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