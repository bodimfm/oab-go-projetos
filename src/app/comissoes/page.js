"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarComissoes = async () => {
      try {
        setLoading(true);
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        setErro("Não foi possível carregar as comissões. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    carregarComissoes();
  }, []);

  const comissoesFiltradas = comissoes.filter((comissao) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      comissao.nome.toLowerCase().includes(termo) ||
      (comissao.area_atuacao && comissao.area_atuacao.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="min-h-screen bg-oab-background">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-oab-primary-dark mb-6">Comissões</h1>
        <div className="mb-8">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou área de atuação..."
            className="w-full md:w-1/2 px-4 py-2 border border-oab-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-oab-primary"
          />
        </div>
        {loading ? (
          <div className="card text-center py-12">
            <span className="text-lg text-oab-text-secondary">Carregando comissões...</span>
          </div>
        ) : erro ? (
          <div className="card text-center py-12">
            <span className="text-red-500">{erro}</span>
          </div>
        ) : comissoesFiltradas.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-oab-text-secondary">Nenhuma comissão encontrada.</span>
          </div>
        ) : (
          <div className="card-grid">
            {comissoesFiltradas.map((comissao) => (
              <div key={comissao.id} className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <h2 className="text-xl font-semibold text-oab-text-primary mb-2 truncate">{comissao.nome}</h2>
                {comissao.area_atuacao && (
                  <div className="text-oab-primary text-sm mb-2">Área de atuação: {comissao.area_atuacao}</div>
                )}
                <p className="text-oab-text-secondary line-clamp-4">{comissao.descricao || "Sem descrição disponível"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 