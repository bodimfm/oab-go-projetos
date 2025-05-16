'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [projetosRecentes, setProjetosRecentes] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        setLoading(true);
        const { data } = await api.getProjetos();
        // Ordenar por data de criação e pegar os 5 mais recentes
        const recentes = data
          .sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio))
          .slice(0, 5);
        setProjetosRecentes(recentes);
      } catch (error) {
        console.error('Erro ao carregar projetos recentes:', error);
        setErro('Não foi possível carregar os projetos recentes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarProjetos();
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Sistema de Gestão de Comissões OAB-GO</h1>
        <p className="text-gray-700 mb-6">
          Bem-vindo ao sistema de gerenciamento de projetos e comissões da OAB-GO. 
          Esta plataforma permite visualizar, criar e gerenciar projetos e membros de comissões.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/projetos" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Ver Projetos
          </Link>
          <Link 
            href="/membros" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Ver Membros
          </Link>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Projetos Recentes</h2>
          <Link 
            href="/projetos" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Ver Todos →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Carregando projetos recentes...</p>
          </div>
        ) : erro ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{erro}</p>
          </div>
        ) : projetosRecentes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projetosRecentes.map((projeto) => (
              <div key={projeto.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {projeto.nome}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {projeto.descricao || "Sem descrição disponível"}
                </p>
                <div className="flex justify-between items-center">
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
                  <Link 
                    href={`/projetos/${projeto.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}