'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

export default function IdeiaProjeto() {
  const [ideia, setIdeia] = useState('');
  const [sugestao, setSugestao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const router = useRouter();

  const gerar = async () => {
    if (!ideia.trim()) return;
    setLoading(true);
    setErro(null);
    try {
      const { data } = await api.gerarSugestaoProjeto(ideia);
      setSugestao(data);
    } catch (e) {
      console.error(e);
      setErro('Erro ao gerar sugestão.');
    } finally {
      setLoading(false);
    }
  };

  const usarSugestao = () => {
    if (!sugestao) return;
    sessionStorage.setItem('sugestaoProjeto', JSON.stringify(sugestao));
    router.push('/projetos/novo');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Voltar para Início
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Nova Ideia</h1>
        <p className="text-gray-600">Descreva sua ideia de projeto para receber sugestões.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <textarea
          className="w-full border rounded-md p-3"
          rows="4"
          value={ideia}
          onChange={(e) => setIdeia(e.target.value)}
          placeholder="Digite sua ideia de projeto aqui"
        />
        <button
          onClick={gerar}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Gerando...' : 'Gerar Sugestão'}
        </button>
        {erro && <p className="text-red-500">{erro}</p>}
      </div>

      {sugestao && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Sugestão Gerada</h2>
          {sugestao.nome && <p><strong>Nome:</strong> {sugestao.nome}</p>}
          {sugestao.descricao && <p><strong>Descrição:</strong> {sugestao.descricao}</p>}
          {sugestao.objetivos && <p><strong>Objetivos:</strong> {sugestao.objetivos}</p>}
          {sugestao.resultados_esperados && <p><strong>Resultados:</strong> {sugestao.resultados_esperados}</p>}
          {sugestao.publico_alvo && <p><strong>Público Alvo:</strong> {sugestao.publico_alvo}</p>}
          {sugestao.tags && sugestao.tags.length > 0 && (
            <p><strong>Tags:</strong> {sugestao.tags.join(', ')}</p>
          )}
          {sugestao.integracoes && sugestao.integracoes.length > 0 && (
            <div>
              <strong>Integrações sugeridas:</strong>
              <ul className="list-disc list-inside">
                {sugestao.integracoes.map((s, i) => (
                  <li key={i}>{s.nome}{s.descricao ? ` - ${s.descricao}` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={usarSugestao} className="btn-primary mt-4">
            Usar Sugestão
          </button>
        </div>
      )}
    </div>
  );
}
