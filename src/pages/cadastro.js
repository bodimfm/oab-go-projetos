import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Head from 'next/head';
import { api } from '../services/api';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [comissaoId, setComissaoId] = useState('');
  const [comissoes, setComissoes] = useState([]);
  const [comissoesLoading, setComissoesLoading] = useState(true);
  const { cadastrarUsuario, loading } = useAuth();
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar comissões disponíveis
  useEffect(() => {
    const loadComissoes = async () => {
      try {
        setComissoesLoading(true);
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
      } finally {
        setComissoesLoading(false);
      }
    };

    loadComissoes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    if (!nome || !email || !comissaoId) {
      setFormError('Preencha todos os campos.');
      return;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Formato de e-mail inválido.');
      return;
    }

    // Criar usuário
    const result = await cadastrarUsuario({
      nome_completo: nome,
      email,
      comissao_id: comissaoId
    });

    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess(
        `Cadastro realizado com sucesso! Seu nome de usuário é: ${result.data.nome_usuario}. 
        Use a senha padrão OABGONEXT para seu primeiro acesso.`
      );
      // Limpar formulário
      setNome('');
      setEmail('');
      setComissaoId('');
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro | OAB-GO Projetos</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-8">
            <img 
              src="/images/logo-oabgo.png" 
              alt="OAB-GO" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">
              Cadastro de Acesso
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Crie seu acesso ao sistema de projetos
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
              <div className="mt-2">
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Ir para a página de login
                </Link>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs italic text-gray-600 mt-1">
                Será usado para recuperação de senha
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comissao">
                Comissão
              </label>
              <select
                id="comissao"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={comissaoId}
                onChange={(e) => setComissaoId(e.target.value)}
                disabled={loading || comissoesLoading}
              >
                <option value="">Selecione uma comissão</option>
                {comissoes.map((comissao) => (
                  <option key={comissao.id} value={comissao.id}>
                    {comissao.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs italic text-gray-600 mt-1">
                O nome da comissão será usado como seu nome de usuário
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading || comissoesLoading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Já possui conta?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">
                    Faça login
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