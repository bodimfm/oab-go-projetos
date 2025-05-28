'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [comissoes, setComissoes] = useState([]);
  const [filtroComissao, setFiltroComissao] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        setLoading(true);
        const { data } = await api.getProjetos();
        setProjetos(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        setErro('Não foi possível carregar os projetos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    const carregarComissoes = async () => {
      try {
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
      }
    };
    carregarProjetos();
    carregarComissoes();
  }, []);

  const projetosFiltrados = projetos.filter(projeto => {
    // Filtro por status
    if (filtroStatus !== 'todos' && projeto.status !== filtroStatus) return false;
    // Filtro por comissão
    if (filtroComissao && !projeto.comissoes.some(c => c.id === filtroComissao)) return false;
    // Busca por nome
    if (busca && !projeto.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-oab-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-oab-primary-dark mb-3">Projetos</h1>
            <p className="text-oab-text-secondary text-lg">
              Visualize e gerencie todos os projetos das comissões da OAB-GO
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/projetos/novo"
              className="bg-oab-primary hover:bg-oab-primary-dark text-white px-6 py-3 rounded-lg transition-colors font-medium inline-flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Novo Projeto</span>
            </Link>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-8 gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-oab-text-primary font-medium mb-1">Buscar por nome:</label>
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Digite o nome do projeto..."
                className="w-full px-4 py-2 border border-oab-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-oab-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-oab-text-primary font-medium mb-1">Filtrar por comissão:</label>
              <select
                value={filtroComissao}
                onChange={e => setFiltroComissao(e.target.value)}
                className="w-full px-4 py-2 border border-oab-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-oab-primary"
              >
                <option value="">Todas as comissões</option>
                {comissoes.map(comissao => (
                  <option key={comissao.id} value={comissao.id}>{comissao.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-oab-text-primary mb-4 font-medium">Filtrar por status:</div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filtroStatus === 'todos'
                  ? 'bg-oab-primary text-white'
                  : 'bg-oab-background border border-oab-border-light text-oab-text-primary hover:border-oab-primary'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('planejamento')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filtroStatus === 'planejamento'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800 hover:border-yellow-400'
              }`}
            >
              Planejamento
            </button>
            <button
              onClick={() => setFiltroStatus('em_andamento')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filtroStatus === 'em_andamento'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 border border-blue-200 text-blue-800 hover:border-blue-400'
              }`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFiltroStatus('concluido')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filtroStatus === 'concluido'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 border border-green-200 text-green-800 hover:border-green-400'
              }`}
            >
              Concluído
            </button>
            <button
              onClick={() => setFiltroStatus('cancelado')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filtroStatus === 'cancelado'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 border border-red-200 text-red-800 hover:border-red-400'
              }`}
            >
              Cancelado
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="inline-flex items-center space-x-2 text-oab-text-secondary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oab-primary"></div>
              <span className="text-lg">Carregando projetos...</span>
            </div>
          </div>
        ) : erro ? (
          <div className="card text-center py-12">
            <div className="text-red-500 bg-red-50 rounded-lg p-6">
              <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">{erro}</p>
            </div>
          </div>
        ) : projetosFiltrados.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="h-16 w-16 mx-auto text-oab-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-oab-text-secondary text-lg">Nenhum projeto encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="card-grid">
            {projetosFiltrados.map((projeto) => (
              <div
                key={projeto.id}
                className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <h2 className="text-xl font-semibold text-oab-text-primary mb-3 truncate">
                  {projeto.nome}
                </h2>
                <p className="text-oab-text-secondary mb-6 line-clamp-3">
                  {projeto.descricao || "Sem descrição disponível"}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    projeto.status === 'concluido' ? 'bg-green-100 text-green-800' :
                    projeto.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                    projeto.status === 'planejamento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {projeto.status === 'concluido' ? 'Concluído' : 
                     projeto.status === 'em_andamento' ? 'Em Andamento' :
                     projeto.status === 'planejamento' ? 'Planejamento' : 
                     'Cancelado'}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-oab-text-primary mb-2">Comissões:</h3>
                  {projeto.comissoes.length > 0 ? (
                    <ul className="text-sm text-oab-text-secondary space-y-1">
                      {projeto.comissoes.slice(0, 3).map((comissao) => (
                        <li key={comissao.id} className="truncate">
                          • {comissao.nome} 
                          <span className="text-oab-text-secondary/70">
                            ({comissao.papel === 'lider' ? 'Líder' : 
                              comissao.papel === 'participante' ? 'Participante' : 
                              'Consultivo'})
                          </span>
                        </li>
                      ))}
                      {projeto.comissoes.length > 3 && (
                        <li className="text-oab-primary font-medium">
                          + {projeto.comissoes.length - 3} mais...
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-oab-text-secondary">Nenhuma comissão vinculada</p>
                  )}
                </div>

                <div className="text-right">
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="text-oab-primary hover:text-oab-primary-dark font-medium inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>Ver Detalhes</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}