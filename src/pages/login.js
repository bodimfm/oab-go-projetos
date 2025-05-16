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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-8">
            <img 
              src="/images/logo-oabgo.png" 
              alt="OAB-GO" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">
              Sistema de Gerenciamento de Projetos
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Acesse com seu nome de usuário e senha
            </p>
          </div>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Nome de Usuário
              </label>
              <input
                id="username"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Nome da comissão (sem espaços)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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