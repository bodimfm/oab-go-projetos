'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

function BuscaPage() {
  const searchParams = useSearchParams();
  const termoBusca = searchParams.get('termo') || '';
  
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [pesquisa, setPesquisa] = useState(termoBusca);

  useEffect(() => {
    const realizarBusca = async () => {
      if (!termoBusca.trim()) return;
      
      try {
        setLoading(true);
        setErro(null);
        const { data } = await api.buscar(termoBusca);
        setResultados(data);
      } catch (error) {
        console.error('Erro ao realizar busca:', error);
        setErro('Ocorreu um erro ao realizar a busca. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    realizarBusca();
  }, [termoBusca]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pesquisa.trim()) {
      window.location.href = `/buscar?termo=${encodeURIComponent(pesquisa.trim())}`;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Busca</h1>
        <p className="text-gray-600">
          Pesquise por projetos e comissões da OAB-GO
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite um termo para buscar projetos ou comissões..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {termoBusca && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Resultados da busca por "{termoBusca}"
          </h2>
          <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Realizando busca...</p>
        </div>
      ) : erro ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-red-500">{erro}</p>
        </div>
      ) : resultados.length === 0 && termoBusca ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Nenhum resultado encontrado para "{termoBusca}".</p>
        </div>
      ) : !termoBusca ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Digite um termo no campo de busca acima para começar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resultados de Projetos */}
          {resultados.filter(r => r.tipo === 'projeto').length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Projetos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultados
                  .filter(r => r.tipo === 'projeto')
                  .map((projeto) => (
                    <div
                      key={projeto.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-5">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                          {projeto.nome}
                        </h2>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                          {projeto.descricao || "Sem descrição disponível"}
                        </p>

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
            </div>
          )}

          {/* Resultados de Comissões */}
          {resultados.filter(r => r.tipo === 'comissao').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Comissões</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultados
                  .filter(r => r.tipo === 'comissao')
                  .map((comissao) => (
                    <div
                      key={comissao.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-5">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                          {comissao.nome}
                        </h2>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                          {comissao.descricao || "Sem descrição disponível"}
                        </p>

                        <div className="text-right">
                          <Link
                            href={`/membros?comissao_id=${comissao.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver Membros →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BuscaPage />
    </Suspense>
  );
}