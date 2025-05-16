'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

function NovoMembroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comissaoIdParam = searchParams.get('comissao_id');
  
  const [formData, setFormData] = useState({
    comissao_id: comissaoIdParam || '',
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    inscricao_oab: ''
  });
  
  const [comissoes, setComissoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComissoes, setLoadingComissoes] = useState(true);
  const [erro, setErro] = useState(null);
  
  useEffect(() => {
    const carregarComissoes = async () => {
      try {
        setLoadingComissoes(true);
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
        setErro('Não foi possível carregar as comissões. Tente novamente mais tarde.');
      } finally {
        setLoadingComissoes(false);
      }
    };
    
    carregarComissoes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim()) {
      alert('O nome do membro é obrigatório.');
      return;
    }
    
    if (!formData.comissao_id) {
      alert('Selecione uma comissão.');
      return;
    }
    
    try {
      setLoading(true);
      setErro(null);
      
      await api.adicionarMembro(formData);
      
      alert('Membro adicionado com sucesso!');
      
      // Redirecionar para a página de membros com filtro para a comissão selecionada
      router.push(`/membros?comissao_id=${formData.comissao_id}`);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      setErro(error.message || 'Ocorreu um erro ao adicionar o membro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/membros"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Voltar para Membros
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Adicionar Novo Membro</h1>
        <p className="text-gray-600 mt-1">
          Preencha o formulário abaixo para adicionar um novo membro a uma comissão
        </p>
      </div>
      
      {erro && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{erro}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="comissao_id" className="block text-gray-700 font-medium mb-2">
              Comissão *
            </label>
            <select
              id="comissao_id"
              name="comissao_id"
              value={formData.comissao_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingComissoes}
            >
              <option value="">Selecione uma comissão</option>
              {comissoes.map((comissao) => (
                <option key={comissao.id} value={comissao.id}>
                  {comissao.nome}
                </option>
              ))}
            </select>
            {loadingComissoes && (
              <p className="text-sm text-gray-500 mt-1">Carregando comissões...</p>
            )}
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
              Nome do Membro *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cargo" className="block text-gray-700 font-medium mb-2">
              Cargo na Comissão
            </label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              placeholder="Ex: Presidente, Secretário, Membro"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="inscricao_oab" className="block text-gray-700 font-medium mb-2">
              Inscrição na OAB
            </label>
            <input
              type="text"
              id="inscricao_oab"
              name="inscricao_oab"
              value={formData.inscricao_oab}
              onChange={handleChange}
              placeholder="Ex: GO12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="telefone" className="block text-gray-700 font-medium mb-2">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="Ex: (62) 99999-9999"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/membros"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Salvando...' : 'Adicionar Membro'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NovoMembroPage />
    </Suspense>
  );
}