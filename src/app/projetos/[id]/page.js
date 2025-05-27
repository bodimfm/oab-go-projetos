'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

export default function DetalhesProjeto() {
  const params = useParams();
  const router = useRouter();
  const [projeto, setProjeto] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSugestoes, setLoadingSugestoes] = useState(true);
  const [erro, setErro] = useState(null);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // Capturar a URL atual para compartilhamento
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }

    const carregarProjeto = async () => {
      try {
        setLoading(true);
        const { data } = await api.getProjeto(params.id);
        setProjeto(data);
      } catch (error) {
        console.error('Erro ao carregar detalhes do projeto:', error);
        setErro('Não foi possível carregar os detalhes do projeto. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    const carregarSugestoes = async () => {
      try {
        setLoadingSugestoes(true);
        const { data } = await api.getSugestoesIntegracao(params.id);
        let extras = [];
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`sugestoesIntegracao_${params.id}`);
          if (stored) {
            try { extras = JSON.parse(stored); } catch (e) { extras = []; }
          }
        }
        setSugestoes([...(extras || []), ...data]);
      } catch (error) {
        console.error('Erro ao carregar sugestões de integração:', error);
        // Não vamos mostrar erro para o usuário neste caso, apenas não mostraremos as sugestões
      } finally {
        setLoadingSugestoes(false);
      }
    };

    carregarProjeto();
    carregarSugestoes();
  }, [params.id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'planejamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não definida';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
        <p className="text-gray-500">Carregando detalhes do projeto...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
        <p className="text-red-500">{erro}</p>
        <button
          onClick={() => router.push('/projetos')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
        <p className="text-gray-500">Projeto não encontrado.</p>
        <button
          onClick={() => router.push('/projetos')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <Link
            href="/projetos"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Voltar para Projetos
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{projeto.nome}</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(projeto.status)}`}>
            {projeto.status === 'concluido' ? 'Concluído' : 
             projeto.status === 'em_andamento' ? 'Em Andamento' :
             projeto.status === 'planejamento' ? 'Planejamento' : 
             'Cancelado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Projeto</h2>
            
            <div className="mb-4">
              <h3 className="text-gray-700 font-medium mb-1">Descrição</h3>
              <p className="text-gray-600">
                {projeto.descricao || "Sem descrição disponível"}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-gray-700 font-medium mb-1">Objetivos</h3>
              <p className="text-gray-600">
                {projeto.objetivos || "Não especificados"}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-gray-700 font-medium mb-1">Resultados Esperados</h3>
              <p className="text-gray-600">
                {projeto.resultados_esperados || "Não especificados"}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-gray-700 font-medium mb-1">Público Alvo</h3>
              <p className="text-gray-600">
                {projeto.publico_alvo || "Não especificado"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-700 font-medium mb-1">Data de Início</h3>
                <p className="text-gray-600">{formatarData(projeto.data_inicio)}</p>
              </div>
              <div>
                <h3 className="text-gray-700 font-medium mb-1">Data de Conclusão Prevista</h3>
                <p className="text-gray-600">{formatarData(projeto.data_fim_prevista)}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {projeto.tags && projeto.tags.length > 0 ? (
                projeto.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma tag definida para este projeto</p>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Comissões Participantes</h2>
            {projeto.comissoes && projeto.comissoes.length > 0 ? (
              <ul className="space-y-4">
                {projeto.comissoes.map((comissao) => (
                  <li key={comissao.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="font-medium text-gray-800">{comissao.nome}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {comissao.descricao || "Sem descrição disponível"}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        comissao.papel === 'lider' ? 'bg-purple-100 text-purple-800' :
                        comissao.papel === 'participante' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {comissao.papel === 'lider' ? 'Líder' : 
                         comissao.papel === 'participante' ? 'Participante' : 
                         'Consultivo'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhuma comissão participante</p>
            )}
          </section>

          {/* Seção de Sugestões de Integração */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sugestões de Integração</h2>
            {loadingSugestoes ? (
              <p className="text-gray-500">Carregando sugestões...</p>
            ) : sugestoes.length > 0 ? (
              <ul className="space-y-4">
                {sugestoes.slice(0, 3).map((sugestao) => (
                  <li key={sugestao.projeto_similar_id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="font-medium text-gray-800">
                      <Link 
                        href={`/projetos/${sugestao.projeto_similar_id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {sugestao.projeto_similar_nome}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {sugestao.projeto_similar_descricao || "Sem descrição disponível"}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-700">
                        {sugestao.comissoes_comuns} comissões em comum
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhuma sugestão de integração encontrada</p>
            )}
          </section>
        </div>
      </div>

      </div>
    </div>
  );
}