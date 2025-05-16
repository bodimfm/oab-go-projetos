'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');

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

    carregarProjetos();
  }, []);

  const projetosFiltrados = projetos.filter(projeto => {
    if (filtroStatus === 'todos') return true;
    return projeto.status === filtroStatus;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Projetos</h1>
          <p className="text-gray-600">
            Visualize e gerencie todos os projetos das comissões da OAB-GO
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/projetos/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            + Novo Projeto
          </Link>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <div className="text-gray-700 mb-2">Filtrar por status:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroStatus === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroStatus('planejamento')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroStatus === 'planejamento'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Planejamento
          </button>
          <button
            onClick={() => setFiltroStatus('em_andamento')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroStatus === 'em_andamento'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFiltroStatus('concluido')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroStatus === 'concluido'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Concluído
          </button>
          <button
            onClick={() => setFiltroStatus('cancelado')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroStatus === 'cancelado'
                ? 'bg-red-500 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Cancelado
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Carregando projetos...</p>
        </div>
      ) : erro ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-red-500">{erro}</p>
        </div>
      ) : projetosFiltrados.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Nenhum projeto encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {projeto.nome}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {projeto.descricao || "Sem descrição disponível"}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
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

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Comissões:</h3>
                  {projeto.comissoes.length > 0 ? (
                    <ul className="text-sm text-gray-600">
                      {projeto.comissoes.slice(0, 3).map((comissao) => (
                        <li key={comissao.id} className="truncate">
                          • {comissao.nome} 
                          <span className="text-gray-500">
                            ({comissao.papel === 'lider' ? 'Líder' : 
                              comissao.papel === 'participante' ? 'Participante' : 
                              'Consultivo'})
                          </span>
                        </li>
                      ))}
                      {projeto.comissoes.length > 3 && (
                        <li className="text-blue-600">
                          + {projeto.comissoes.length - 3} mais...
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma comissão vinculada</p>
                  )}
                </div>

                <div className="text-right">
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}