import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!username || !password) {
      setFormError('Preencha todos os campos.');
      return;
    }
    
    const result = await login(username, password);
    if (result.error) {
      setFormError(result.error);
    }
  };

  return (
    <>
      <Head>
        <title>Login | OAB-GO Projetos</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-oab-background">
        <div className="max-w-md w-full card">
          <div className="text-center mb-8">
            <img 
              src="/images/logo-oabgo.png" 
              alt="OAB-GO" 
              className="h-20 mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-oab-primary-dark mb-2">
              OAB GOIÁS
            </h2>
            <h3 className="text-lg font-semibold text-oab-text-primary mb-2">
              Sistema de Gerenciamento de Projetos
            </h3>
            <p className="text-sm text-oab-text-secondary">
              Acesse com seu nome de usuário e senha
            </p>
          </div>
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="block sm:inline">{formError}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-oab-text-primary text-sm font-medium mb-2" htmlFor="username">
                Nome de Usuário
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-3 border border-oab-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-oab-primary focus:border-transparent transition-colors"
                placeholder="Nome da comissão (sem espaços)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-oab-text-primary text-sm font-medium mb-2" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border border-oab-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-oab-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs italic text-gray-600 mt-2">
                Se for seu primeiro acesso, use a senha padrão: OABGONEXT
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              
              <div className="text-center">
                <Link href="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueceu sua senha?
                </Link>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Ainda não tem acesso?{' '}
                  <Link href="/cadastro" className="text-blue-600 hover:text-blue-800">
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 