'use client';

import { useState, useEffect, useRef } from 'react';

export default function ComissaoAutocomplete({ 
  comissoes, 
  onComissaoSelect, 
  disabled,
  placeholder = 'Buscar comissão...'
}) {
  const [busca, setBusca] = useState('');
  const [comissoesFiltradas, setComissoesFiltradas] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Filtrar comissões com base na busca
  useEffect(() => {
    if (!busca.trim() || !comissoes || !Array.isArray(comissoes)) {
      setComissoesFiltradas([]);
      return;
    }

    const buscarTermo = busca.toLowerCase().trim();
    const resultados = comissoes
      .filter(comissao => 
        comissao.nome.toLowerCase().includes(buscarTermo) || 
        (comissao.area_atuacao && comissao.area_atuacao.toLowerCase().includes(buscarTermo))
      )
      .slice(0, 10); // Limitar a 10 resultados para melhor desempenho
    
    setComissoesFiltradas(resultados);
    setHighlightedIndex(resultados.length > 0 ? 0 : -1);
  }, [busca, comissoes]);

  // Fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          resultsRef.current && !resultsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manipular navegação com teclado
  const handleKeyDown = (e) => {
    if (!isOpen || comissoesFiltradas.length === 0) return;

    // Tecla para baixo
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < comissoesFiltradas.length - 1 ? prev + 1 : 0));
    }
    // Tecla para cima
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : comissoesFiltradas.length - 1));
    }
    // Enter para selecionar
    else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(comissoesFiltradas[highlightedIndex]);
    }
    // Escape para fechar
    else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Selecionar uma comissão
  const handleSelect = (comissao) => {
    onComissaoSelect(comissao);
    setBusca('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => busca.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled}
        autoComplete="off"
      />
      
      {isOpen && comissoesFiltradas.length > 0 && (
        <ul 
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {comissoesFiltradas.map((comissao, index) => (
            <li
              key={comissao.id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                index === highlightedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSelect(comissao)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="font-medium truncate">{comissao.nome}</div>
              {comissao.area_atuacao && (
                <div className="text-xs text-gray-500 truncate">
                  {comissao.area_atuacao}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 