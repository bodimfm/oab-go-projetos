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
    <div className="min-h-screen bg-oab-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="card">
          <h1 className="text-4xl font-bold text-oab-primary-dark mb-6">Sistema de Gestão de Comissões OAB-GO</h1>
          <p className="text-oab-text-secondary mb-8 text-lg">
            Bem-vindo ao sistema de gerenciamento de projetos e comissões da OAB-GO. 
            Esta plataforma permite visualizar, criar e gerenciar projetos e membros de comissões.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link 
              href="/projetos" 
              className="bg-oab-primary hover:bg-oab-primary-dark text-white px-8 py-3 rounded-lg transition-colors font-medium inline-flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Ver Projetos</span>
            </Link>
            <Link 
              href="/membros" 
              className="bg-oab-background border-2 border-oab-border-light hover:border-oab-primary text-oab-primary px-8 py-3 rounded-lg transition-colors font-medium inline-flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Ver Membros</span>
            </Link>
          </div>
        </section>

        {/* Projetos Recentes */}
        <section className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-oab-text-primary">Projetos Recentes</h2>
            <Link 
              href="/projetos" 
              className="text-oab-primary hover:text-oab-primary-dark font-medium inline-flex items-center space-x-1 transition-colors"
            >
              <span>Ver Todos</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center space-x-2 text-oab-text-secondary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-oab-primary"></div>
                <span>Carregando projetos recentes...</span>
              </div>
            </div>
          ) : erro ? (
            <div className="py-12 text-center">
              <div className="text-red-500 bg-red-50 rounded-lg p-4">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{erro}</p>
              </div>
            </div>
          ) : projetosRecentes.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="h-16 w-16 mx-auto text-oab-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-oab-text-secondary">Nenhum projeto encontrado.</p>
            </div>
          ) : (
            <div className="card-grid">
              {projetosRecentes.map((projeto) => (
                <div key={projeto.id} className="bg-white border border-oab-border-light rounded-card p-6 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <h3 className="text-lg font-semibold text-oab-text-primary mb-3 truncate">
                    {projeto.nome}
                  </h3>
                  <p className="text-oab-text-secondary text-sm mb-4 line-clamp-2">
                    {projeto.descricao || "Sem descrição disponível"}
                  </p>
                  <div className="flex justify-between items-center">
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
                    <Link 
                      href={`/projetos/${projeto.id}`}
                      className="text-oab-primary hover:text-oab-primary-dark text-sm font-medium inline-flex items-center space-x-1 transition-colors"
                    >
                      <span>Detalhes</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}