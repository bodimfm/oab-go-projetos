import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSuggestion, useUpdateSuggestion } from '../../hooks/useSuggestions';

export default function SuggestionForm({ suggestion, onSuccess, onCancel }) {
  const isEditing = !!suggestion;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: isEditing ? {
      ...suggestion,
      compativel_com: suggestion.compativel_com?.join(', ') || '',
      tags: suggestion.tags?.join(', ') || '',
    } : {
      nome: '',
      descricao: '',
      tipo: 'api',
      area_aplicacao: '',
      detalhes_tecnicos: '',
      url_documentacao: '',
      beneficios: '',
      nivel_complexidade: 'media',
      custo_estimado: '',
      tempo_implementacao: '',
      pre_requisitos: '',
      compativel_com: '',
      tags: '',
      ativa: true
    }
  });
  
  const createMutation = useCreateSuggestion();
  const updateMutation = useUpdateSuggestion();
  
  const onSubmit = (data) => {
    // Converter strings separadas por vírgula em arrays
    const processedData = {
      ...data,
      compativel_com: data.compativel_com ? 
        data.compativel_com.split(',').map(item => item.trim()).filter(Boolean) : [],
      tags: data.tags ? 
        data.tags.split(',').map(item => item.trim()).filter(Boolean) : []
    };
    
    if (isEditing) {
      updateMutation.mutate(
        { id: suggestion.id, updates: processedData },
        {
          onSuccess: () => {
            onSuccess?.();
          }
        }
      );
    } else {
      createMutation.mutate(
        processedData,
        {
          onSuccess: () => {
            reset();
            onSuccess?.();
          }
        }
      );
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Integração*
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Integração*
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-md ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
              {...register('tipo', { required: 'Tipo é obrigatório' })}
            >
              <option value="api">API</option>
              <option value="software">Software</option>
              <option value="servico">Serviço</option>
              <option value="outra">Outra</option>
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área de Aplicação*
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md ${errors.area_aplicacao ? 'border-red-500' : 'border-gray-300'}`}
              {...register('area_aplicacao', { required: 'Área de aplicação é obrigatória' })}
            />
            {errors.area_aplicacao && (
              <p className="mt-1 text-sm text-red-600">{errors.area_aplicacao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Complexidade*
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-md ${errors.nivel_complexidade ? 'border-red-500' : 'border-gray-300'}`}
              {...register('nivel_complexidade', { required: 'Nível de complexidade é obrigatório' })}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
            {errors.nivel_complexidade && (
              <p className="mt-1 text-sm text-red-600">{errors.nivel_complexidade.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Documentação
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register('url_documentacao')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compatível com (separar por vírgulas)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Comissão de Direito Digital, Comissão de IA"
              {...register('compativel_com')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separar por vírgulas)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: automação, documentos, IA"
              {...register('tags')}
            />
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="ativa"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('ativa')}
            />
            <label htmlFor="ativa" className="ml-2 block text-sm text-gray-700">
              Ativa (visível para usuários)
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição*
            </label>
            <textarea
              rows={4}
              className={`w-full px-4 py-2 border rounded-md ${errors.descricao ? 'border-red-500' : 'border-gray-300'}`}
              {...register('descricao', { required: 'Descrição é obrigatória' })}
            ></textarea>
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefícios (separar por ponto e vírgula)
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Redução de tempo; Maior precisão; Melhor experiência"
              {...register('beneficios')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhes Técnicos
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register('detalhes_tecnicos')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pré-requisitos (separar por ponto e vírgula)
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Aprovação da diretoria; Recursos disponíveis"
              {...register('pre_requisitos')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custo Estimado
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Baixo, Médio, Alto ou valor específico"
              {...register('custo_estimado')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo de Implementação
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: 15 a 30 dias"
              {...register('tempo_implementacao')}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? (
            'Salvando...'
          ) : isEditing ? (
            'Atualizar Sugestão'
          ) : (
            'Criar Sugestão'
          )}
        </button>
      </div>
    </form>
  );
} 