import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AlterarSenha() {
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const { user, alterarSenha, loading, isAuthenticated } = useAuth();
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Verificar se o usuário está autenticado ou tem token de recuperação
  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated && !router.query.token) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    if (!senha || !confirmacaoSenha) {
      setFormError('Preencha todos os campos.');
      return;
    }
    
    if (senha.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if (senha !== confirmacaoSenha) {
      setFormError('As senhas não coincidem.');
      return;
    }
    
    const result = await alterarSenha(senha);
    
    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess('Senha alterada com sucesso!');
      // Redirecionar para página inicial após alguns segundos
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Alterar Senha | OAB-GO Projetos</title>
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
              Alterar Senha
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {user?.primeiro_acesso 
                ? 'Como é seu primeiro acesso, você precisa alterar sua senha'
                : 'Escolha uma nova senha para sua conta'
              }
            </p>
          </div>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
              <p className="text-sm mt-1">Redirecionando...</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="senha">
                Nova Senha
              </label>
              <input
                id="senha"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs italic text-gray-600 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmacaoSenha">
                Confirme a Nova Senha
              </label>
              <input
                id="confirmacaoSenha"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="••••••••"
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 