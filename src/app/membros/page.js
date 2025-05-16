'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

function MembrosPage() {
  const searchParams = useSearchParams();
  const comissaoIdParam = searchParams.get('comissao_id');
  
  const [membros, setMembros] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [comissaoSelecionada, setComissaoSelecionada] = useState(comissaoIdParam || '');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarComissoes = async () => {
      try {
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
        setErro('Não foi possível carregar as comissões. Tente novamente mais tarde.');
      }
    };

    carregarComissoes();
  }, []);

  useEffect(() => {
    const carregarMembros = async () => {
      try {
        setLoading(true);
        const { data } = await api.getMembros(comissaoSelecionada || null);
        setMembros(data);
      } catch (error) {
        console.error('Erro ao carregar membros:', error);
        setErro('Não foi possível carregar os membros. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarMembros();
  }, [comissaoSelecionada]);

  const handleComissaoChange = (e) => {
    setComissaoSelecionada(e.target.value);
  };

  // Agrupar membros por comissão
  const membrosPorComissao = membros.reduce((acc, membro) => {
    const comissaoId = membro.comissao_id;
    if (!acc[comissaoId]) {
      acc[comissaoId] = {
        id: comissaoId,
        nome: membro.comissao_nome,
        descricao: membro.comissao_descricao,
        area_atuacao: membro.area_atuacao,
        membros: []
      };
    }
    acc[comissaoId].membros.push(membro);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Membros de Comissões</h1>
          <p className="text-gray-600">
            Visualize os membros de todas as comissões da OAB-GO
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/membros/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            + Adicionar Membro
          </Link>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <div className="text-gray-700 mb-2">Filtrar por comissão:</div>
        <select
          value={comissaoSelecionada}
          onChange={handleComissaoChange}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as comissões</option>
          {comissoes.map((comissao) => (
            <option key={comissao.id} value={comissao.id}>
              {comissao.nome}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Carregando membros...</p>
        </div>
      ) : erro ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-red-500">{erro}</p>
        </div>
      ) : Object.keys(membrosPorComissao).length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
          <p className="text-gray-500">Nenhum membro encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.values(membrosPorComissao).map((comissao) => (
            <div key={comissao.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h2 className="text-xl font-semibold text-gray-800">{comissao.nome}</h2>
                <p className="text-gray-600 mt-1">{comissao.descricao || "Sem descrição disponível"}</p>
                {comissao.area_atuacao && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-700">Áreas de atuação: </span>
                    <span className="text-gray-600">{comissao.area_atuacao}</span>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscrição OAB
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Ingresso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comissao.membros.map((membro) => (
                      <tr key={membro.membro_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{membro.membro_nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{membro.cargo || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {membro.email && <div>{membro.email}</div>}
                            {membro.telefone && <div>{membro.telefone}</div>}
                            {!membro.email && !membro.telefone && "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{membro.inscricao_oab || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {membro.data_ingresso ? new Date(membro.data_ingresso).toLocaleDateString('pt-BR') : "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MembrosPage />
    </Suspense>
  );
}