'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import ComissaoAutocomplete from '@/components/ComissaoAutocomplete';

export default function NovoProjeto() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    objetivos: '',
    resultados_esperados: '',
    publico_alvo: '',
    data_inicio: '',
    data_fim_prevista: '',
    status: 'planejamento',
    comissoes: [],
    tags: ''
  });
  
  const [comissoes, setComissoes] = useState([]);
  const [comissoesSelecionadas, setComissoesSelecionadas] = useState([]);
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
  
  const handleComissaoSelect = (comissaoSelecionada) => {
    if (!comissaoSelecionada) return;
    
    // Verifica se a comissão já está selecionada
    if (comissoesSelecionadas.some(c => c.comissao_id === comissaoSelecionada.id)) {
      alert('Esta comissão já foi adicionada ao projeto.');
      return;
    }
    
    setComissoesSelecionadas([
      ...comissoesSelecionadas,
      {
        comissao_id: comissaoSelecionada.id,
        nome: comissaoSelecionada.nome,
        papel_comissao: 'participante'
      }
    ]);
  };
  
  const handlePapelChange = (comissaoId, papel) => {
    if (!comissoesSelecionadas || !Array.isArray(comissoesSelecionadas)) {
      console.error('Lista de comissões selecionadas não disponível');
      return;
    }
    
    setComissoesSelecionadas(comissoesSelecionadas.map(c => 
      c.comissao_id === comissaoId ? { ...c, papel_comissao: papel } : c
    ));
  };
  
  const removerComissao = (comissaoId) => {
    if (!comissoesSelecionadas || !Array.isArray(comissoesSelecionadas)) {
      console.error('Lista de comissões selecionadas não disponível');
      return;
    }
    
    setComissoesSelecionadas(comissoesSelecionadas.filter(c => c.comissao_id !== comissaoId));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }
    
    if (comissoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma comissão para o projeto.');
      return;
    }
    
    // Processar tags
    const tags = formData.tags
      ? formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
      : [];
    
    try {
      setLoading(true);
      setErro(null);
      
      await api.criarProjeto({
        ...formData,
        comissoes: comissoesSelecionadas,
        tags
      });
      
      alert('Projeto criado com sucesso!');
      router.push('/projetos');
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setErro(error.message || 'Ocorreu um erro ao criar o projeto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/projetos"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Voltar para Projetos
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Novo Projeto</h1>
        <p className="text-gray-600 mt-1">
          Preencha o formulário abaixo para criar um novo projeto
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
            <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
              Nome do Projeto *
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
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="descricao" className="block text-gray-700 font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="objetivos" className="block text-gray-700 font-medium mb-2">
              Objetivos
            </label>
            <textarea
              id="objetivos"
              name="objetivos"
              value={formData.objetivos}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="resultados_esperados" className="block text-gray-700 font-medium mb-2">
              Resultados Esperados
            </label>
            <textarea
              id="resultados_esperados"
              name="resultados_esperados"
              value={formData.resultados_esperados}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="publico_alvo" className="block text-gray-700 font-medium mb-2">
              Público Alvo
            </label>
            <input
              type="text"
              id="publico_alvo"
              name="publico_alvo"
              value={formData.publico_alvo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-gray-700 font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="planejamento">Planejamento</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="data_inicio" className="block text-gray-700 font-medium mb-2">
              Data de Início
            </label>
            <input
              type="date"
              id="data_inicio"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="data_fim_prevista" className="block text-gray-700 font-medium mb-2">
              Data de Conclusão Prevista
            </label>
            <input
              type="date"
              id="data_fim_prevista"
              name="data_fim_prevista"
              value={formData.data_fim_prevista}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ex: direito digital, educação, evento"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Comissões Participantes *</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <ComissaoAutocomplete
                comissoes={comissoes}
                onComissaoSelect={handleComissaoSelect}
                disabled={loadingComissoes}
                placeholder="Digite para buscar uma comissão..."
              />
              {loadingComissoes && (
                <p className="text-sm text-gray-500 mt-1">Carregando comissões...</p>
              )}
            </div>
          </div>
          
          {comissoesSelecionadas.length > 0 ? (
            <div className="mt-4">
              <ul className="border rounded-md divide-y">
                {comissoesSelecionadas && comissoesSelecionadas.map((comissao) => (
                  <li key={comissao.comissao_id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="font-medium">{comissao.nome}</div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <div>
                        <select
                          value={comissao.papel_comissao}
                          onChange={(e) => handlePapelChange(comissao.comissao_id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="lider">Líder</option>
                          <option value="participante">Participante</option>
                          <option value="consultivo">Consultivo</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerComissao(comissao.comissao_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Nenhuma comissão selecionada</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/projetos"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}